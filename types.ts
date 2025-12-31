export interface FileInput {
  file: File;
  base64: string;
}

export interface IndividualAnalysis {
  title: string;
  authors: string;
  year: string;
  relevanceRating: number;
  ratingJustification: string;
  methodologicalSummary: string;
  keyContributions: string;
  thesisIntegration: string;
}

export interface SummaryRow {
  article: string;
  rating: number;
  coreConclusion: string;
  utility: 'Low' | 'Medium' | 'High';
}

export interface SynthesisMatrix {
  commonThemes: string[];
  divergentResults: string[];
  researchGaps: string[];
}

export interface AnalysisResponse {
  individualAnalyses: IndividualAnalysis[];
  summaryTable: SummaryRow[];
  synthesisMatrix: SynthesisMatrix;
}

export enum AnalysisStage {
  INPUT = 'INPUT',
  PROCESSING = 'PROCESSING',
  RESULTS = 'RESULTS',
}

export enum ResultTab {
  INDIVIDUAL = 'INDIVIDUAL',
  SUMMARY = 'SUMMARY',
  SYNTHESIS = 'SYNTHESIS',
}