import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResponse, FileInput } from "../types";

const PROMPT_TEMPLATE = `
You are an Academic Research Assistant specialized in Systematic Literature Reviews. 
Your goal is to analyze the provided batch of research articles (PDFs) and evaluate their relevance to the specific Research Topic provided below.

Research Topic: "{RESEARCH_TOPIC}"

Follow these stages rigorously:

STAGE 1: DEEP INDIVIDUAL ANALYSIS
For each article, analyze:
- Identification (Title, Authors, Year)
- Relevance Rating (0-100) based on alignment with the topic.
- Rating Justification (Brief explanation).
- Methodological Summary.
- Key Contributions.
- Thesis Integration advice.

STAGE 2: SUMMARY OVERVIEW TABLE
Provide data for a concise table: Article Name, Rating, Core Conclusion, Utility (Low/Medium/High).

STAGE 3: SYNTHESIS MATRIX
Compare articles across:
- Common themes/frameworks.
- Divergent results/conflicting viewpoints.
- Research gaps.

GUIDELINES:
- Objective, academic tone.
- If rating < 30, provide a brief summary.
- If rating > 85, highlight specific strong points.

Return the result in the specified JSON structure.
`;

export const analyzeArticles = async (
  topic: string,
  files: FileInput[]
): Promise<AnalysisResponse> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing in environment variables");
  }

  const ai = new GoogleGenAI({ apiKey });

  // Prepare the content parts
  const parts = [];

  // Add the text prompt with the topic injected
  const prompt = PROMPT_TEMPLATE.replace("{RESEARCH_TOPIC}", topic);
  parts.push({ text: prompt });

  // Add the files as inline data
  for (const fileInput of files) {
    // Extract base64 data (remove data URL prefix)
    const base64Data = fileInput.base64.split(',')[1];
    
    parts.push({
      inlineData: {
        mimeType: fileInput.file.type,
        data: base64Data,
      },
    });
  }

  // Define the schema for structured output
  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      individualAnalyses: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            authors: { type: Type.STRING },
            year: { type: Type.STRING },
            relevanceRating: { type: Type.NUMBER },
            ratingJustification: { type: Type.STRING },
            methodologicalSummary: { type: Type.STRING },
            keyContributions: { type: Type.STRING },
            thesisIntegration: { type: Type.STRING },
          },
          required: ["title", "authors", "year", "relevanceRating", "ratingJustification", "methodologicalSummary", "keyContributions", "thesisIntegration"],
        },
      },
      summaryTable: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            article: { type: Type.STRING },
            rating: { type: Type.NUMBER },
            coreConclusion: { type: Type.STRING },
            utility: { type: Type.STRING, enum: ["Low", "Medium", "High"] },
          },
          required: ["article", "rating", "coreConclusion", "utility"],
        },
      },
      synthesisMatrix: {
        type: Type.OBJECT,
        properties: {
          commonThemes: { type: Type.ARRAY, items: { type: Type.STRING } },
          divergentResults: { type: Type.ARRAY, items: { type: Type.STRING } },
          researchGaps: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["commonThemes", "divergentResults", "researchGaps"],
      },
    },
    required: ["individualAnalyses", "summaryTable", "synthesisMatrix"],
  };

  // Helper for exponential backoff
  const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  let attempt = 0;
  const maxRetries = 3;

  while (true) {
    try {
      // Switched to gemini-3-flash-preview for better rate limits while maintaining good reasoning capabilities
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview", 
        contents: {
          parts: parts,
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
          thinkingConfig: { thinkingBudget: 2048 } // Optimized budget for flash
        },
      });

      if (!response.text) {
        throw new Error("No response generated");
      }

      return JSON.parse(response.text) as AnalysisResponse;

    } catch (error: any) {
      // Check for quota exhaustion (429) or service unavailable (503)
      // The error object might differ depending on the exact SDK version/response, so we check multiple properties
      const isQuotaError = error.message?.includes('429') || error.status === 429 || error.code === 429;
      const isServerOverload = error.message?.includes('503') || error.status === 503;

      if ((isQuotaError || isServerOverload) && attempt < maxRetries) {
        attempt++;
        // Exponential backoff: 2s, 4s, 8s
        const delayMs = 2000 * Math.pow(2, attempt - 1); 
        console.warn(`Attempt ${attempt} failed with ${isQuotaError ? 'quota' : 'server'} error. Retrying in ${delayMs}ms...`);
        await wait(delayMs);
        continue;
      }
      
      console.error("Gemini Analysis Error:", error);
      throw error;
    }
  }
};
