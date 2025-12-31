import React, { useState } from 'react';
import { GraduationCap, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { FileInput, AnalysisResponse, AnalysisStage } from './types';
import { FileUpload } from './components/FileUpload';
import { AnalysisView } from './components/AnalysisView';
import { analyzeArticles } from './services/geminiService';

const App: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [files, setFiles] = useState<FileInput[]>([]);
  const [stage, setStage] = useState<AnalysisStage>(AnalysisStage.INPUT);
  const [results, setResults] = useState<AnalysisResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleReset = () => {
    setTopic('');
    setFiles([]);
    setResults(null);
    setStage(AnalysisStage.INPUT);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!topic.trim()) {
      setError("Please enter a research topic.");
      return;
    }
    if (files.length === 0) {
      setError("Please upload at least one PDF article.");
      return;
    }

    setStage(AnalysisStage.PROCESSING);
    setError(null);

    try {
      const data = await analyzeArticles(topic, files);
      setResults(data);
      setStage(AnalysisStage.RESULTS);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred during analysis.");
      setStage(AnalysisStage.INPUT);
    }
  };

  if (stage === AnalysisStage.RESULTS && results) {
    return <AnalysisView data={results} topic={topic} onReset={handleReset} />;
  }

  return (
    <div className="min-h-screen bg-academic-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-academic-900 text-white shadow-xl mb-6">
            <GraduationCap size={32} />
          </div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-academic-900 mb-3">
            ScholarSync
          </h1>
          <p className="text-academic-500 text-lg max-w-md mx-auto">
            Your AI Research Assistant for Systematic Literature Reviews
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-white/50 p-6 md:p-8">
          {stage === AnalysisStage.PROCESSING ? (
            <div className="py-20 flex flex-col items-center justify-center text-center">
              <div className="relative">
                <div className="absolute inset-0 bg-accent-500 blur-xl opacity-20 animate-pulse rounded-full"></div>
                <Loader2 size={48} className="text-accent-600 animate-spin relative z-10" />
              </div>
              <h3 className="mt-8 text-xl font-bold text-academic-800">Analyzing Literature</h3>
              <p className="text-academic-500 mt-2 max-w-sm">
                Reading {files.length} articles and evaluating relevance against your topic...
              </p>
              <div className="mt-6 flex flex-col gap-2 w-64">
                 <div className="h-1.5 w-full bg-academic-100 rounded-full overflow-hidden">
                    <div className="h-full bg-accent-500 animate-[shimmer_2s_infinite] w-1/3 rounded-full"></div>
                 </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Topic Input */}
              <div className="space-y-3">
                <label htmlFor="topic" className="block text-sm font-semibold text-academic-700 uppercase tracking-wide">
                  Research Topic
                </label>
                <div className="relative">
                    <textarea
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., The impact of Generative AI on undergraduate computer science education pedagogy..."
                    className="w-full p-4 rounded-xl border border-academic-300 focus:border-accent-500 focus:ring-4 focus:ring-accent-500/10 outline-none transition-all min-h-[100px] text-academic-800 font-serif resize-none shadow-sm"
                    />
                    <div className="absolute bottom-3 right-3 text-academic-300 pointer-events-none">
                        <Sparkles size={16} />
                    </div>
                </div>
              </div>

              {/* File Input */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-academic-700 uppercase tracking-wide">
                  Research Articles (PDF)
                </label>
                <FileUpload files={files} setFiles={setFiles} />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 text-red-700 animate-fade-in">
                  <AlertCircle size={20} className="mt-0.5 shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleAnalyze}
                disabled={!topic.trim() || files.length === 0}
                className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-lg ${
                  !topic.trim() || files.length === 0
                    ? 'bg-academic-200 text-academic-400 cursor-not-allowed shadow-none'
                    : 'bg-academic-900 text-white hover:bg-black hover:shadow-xl'
                }`}
              >
                <Sparkles size={20} />
                Analyze Articles
              </button>
            </div>
          )}
        </div>
        
        <p className="text-center text-academic-400 text-xs mt-8">
            Powered by Google Gemini 3 Flash • Designed for Academic Integrity
        </p>
      </div>
    </div>
  );
};

export default App;