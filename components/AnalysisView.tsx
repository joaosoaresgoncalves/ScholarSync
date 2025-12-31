import React, { useState } from 'react';
import { AnalysisResponse, ResultTab, IndividualAnalysis, SummaryRow } from '../types';
import { BookOpen, Table, Network, Download, ChevronRight } from 'lucide-react';

interface AnalysisViewProps {
  data: AnalysisResponse;
  topic: string;
  onReset: () => void;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({ data, topic, onReset }) => {
  const [activeTab, setActiveTab] = useState<ResultTab>(ResultTab.INDIVIDUAL);

  const getRatingColor = (rating: number) => {
    if (rating >= 85) return 'text-green-600 bg-green-50 border-green-200';
    if (rating >= 60) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (rating >= 30) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getUtilityBadge = (utility: string) => {
    switch (utility) {
      case 'High': return 'bg-green-100 text-green-800 border-green-200';
      case 'Medium': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Low': return 'bg-slate-100 text-slate-800 border-slate-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleExport = () => {
    const date = new Date().toLocaleDateString();
    let content = `# Systematic Literature Review Report\n\n`;
    content += `**Research Topic:** ${topic}\n`;
    content += `**Date:** ${date}\n\n`;
    content += `---\n\n`;

    // Summary Table
    content += `## 1. Summary Overview\n\n`;
    content += `| Article | Rating | Core Conclusion | Utility |\n`;
    content += `| :--- | :--- | :--- | :--- |\n`;
    data.summaryTable.forEach(row => {
      // Sanitize content for markdown table
      const article = row.article.replace(/\|/g, '\\|').replace(/\n/g, ' ');
      const conclusion = row.coreConclusion.replace(/\|/g, '\\|').replace(/\n/g, ' ');
      content += `| ${article} | ${row.rating} | ${conclusion} | ${row.utility} |\n`;
    });
    content += `\n---\n\n`;

    // Synthesis Matrix
    content += `## 2. Synthesis Matrix\n\n`;
    content += `### Common Themes\n`;
    data.synthesisMatrix.commonThemes.forEach(item => content += `- ${item}\n`);
    content += `\n### Divergent Results\n`;
    data.synthesisMatrix.divergentResults.forEach(item => content += `- ${item}\n`);
    content += `\n### Research Gaps\n`;
    data.synthesisMatrix.researchGaps.forEach(item => content += `- ${item}\n`);
    content += `\n---\n\n`;

    // Individual Analysis
    content += `## 3. Deep Individual Analysis\n\n`;
    data.individualAnalyses.forEach(item => {
      content += `### ${item.title}\n`;
      content += `**Authors:** ${item.authors} | **Year:** ${item.year}\n`;
      content += `**Relevance:** ${item.relevanceRating}/100\n\n`;
      
      content += `**Methodological Summary:**\n${item.methodologicalSummary}\n\n`;
      content += `**Key Contributions:**\n${item.keyContributions}\n\n`;
      content += `**Rating Justification:**\n${item.ratingJustification}\n\n`;
      content += `**Thesis Integration:**\n${item.thesisIntegration}\n\n`;
      content += `---\n\n`;
    });

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ScholarSync_Report_${new Date().toISOString().slice(0,10)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-gray-200 pb-6">
        <div>
          <h2 className="text-2xl font-serif font-bold text-academic-900">Systematic Literature Review</h2>
          <p className="text-academic-500 mt-1">Research Topic: <span className="font-semibold text-academic-700">{topic}</span></p>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={onReset}
                className="px-4 py-2 text-sm text-academic-600 hover:text-academic-900 font-medium transition-colors"
            >
                Start New Analysis
            </button>
            <button 
                className="flex items-center gap-2 px-4 py-2 bg-academic-800 text-white rounded-lg hover:bg-academic-900 transition-colors shadow-sm"
                onClick={handleExport}
            >
                <Download size={16} />
                Export Report
            </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 bg-academic-50 p-1.5 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab(ResultTab.INDIVIDUAL)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === ResultTab.INDIVIDUAL
              ? 'bg-white text-academic-900 shadow-sm'
              : 'text-academic-500 hover:text-academic-700 hover:bg-academic-100/50'
          }`}
        >
          <BookOpen size={16} />
          Deep Analysis
        </button>
        <button
          onClick={() => setActiveTab(ResultTab.SUMMARY)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === ResultTab.SUMMARY
              ? 'bg-white text-academic-900 shadow-sm'
              : 'text-academic-500 hover:text-academic-700 hover:bg-academic-100/50'
          }`}
        >
          <Table size={16} />
          Summary Table
        </button>
        <button
          onClick={() => setActiveTab(ResultTab.SYNTHESIS)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
            activeTab === ResultTab.SYNTHESIS
              ? 'bg-white text-academic-900 shadow-sm'
              : 'text-academic-500 hover:text-academic-700 hover:bg-academic-100/50'
          }`}
        >
          <Network size={16} />
          Synthesis Matrix
        </button>
      </div>

      {/* Content Area */}
      <div className="min-h-[60vh]">
        {activeTab === ResultTab.INDIVIDUAL && (
          <div className="grid grid-cols-1 gap-6">
            {data.individualAnalyses.map((item, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-serif font-bold text-academic-900 mb-1">{item.title}</h3>
                    <div className="text-sm text-academic-500 flex items-center gap-2">
                        <span>{item.authors}</span>
                        <span className="w-1 h-1 rounded-full bg-academic-300"></span>
                        <span>{item.year}</span>
                    </div>
                  </div>
                  <div className={`flex items-center justify-center px-4 py-2 rounded-lg border text-lg font-bold h-fit whitespace-nowrap ${getRatingColor(item.relevanceRating)}`}>
                    {item.relevanceRating} / 100
                  </div>
                </div>
                
                <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                        <Section title="Methodological Summary" content={item.methodologicalSummary} />
                        <Section title="Key Contributions" content={item.keyContributions} />
                    </div>
                    <div className="space-y-6">
                         <div className="bg-academic-50 rounded-lg p-4 border border-academic-100">
                             <h4 className="text-xs font-bold uppercase tracking-wider text-academic-500 mb-2">Rating Justification</h4>
                             <p className="text-sm text-academic-700 leading-relaxed">{item.ratingJustification}</p>
                         </div>
                         <div className="bg-amber-50 rounded-lg p-4 border border-amber-100">
                             <h4 className="text-xs font-bold uppercase tracking-wider text-amber-600 mb-2">Thesis Integration</h4>
                             <p className="text-sm text-academic-800 leading-relaxed italic">"{item.thesisIntegration}"</p>
                         </div>
                    </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === ResultTab.SUMMARY && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-academic-50 border-b border-academic-200">
                    <th className="py-4 px-6 font-semibold text-sm text-academic-700 uppercase tracking-wider w-1/4">Article</th>
                    <th className="py-4 px-6 font-semibold text-sm text-academic-700 uppercase tracking-wider w-24">Rating</th>
                    <th className="py-4 px-6 font-semibold text-sm text-academic-700 uppercase tracking-wider">Core Conclusion</th>
                    <th className="py-4 px-6 font-semibold text-sm text-academic-700 uppercase tracking-wider w-32">Utility</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.summaryTable.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-4 px-6 text-sm font-medium text-academic-900">{row.article}</td>
                      <td className="py-4 px-6 text-sm">
                        <span className={`font-bold ${row.rating >= 60 ? 'text-academic-800' : 'text-academic-500'}`}>{row.rating}</span>
                      </td>
                      <td className="py-4 px-6 text-sm text-academic-600 leading-relaxed">{row.coreConclusion}</td>
                      <td className="py-4 px-6 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getUtilityBadge(row.utility)}`}>
                          {row.utility}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === ResultTab.SYNTHESIS && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             <SynthesisCard 
                title="Common Themes" 
                items={data.synthesisMatrix.commonThemes} 
                icon={<div className="w-2 h-2 rounded-full bg-blue-500"></div>}
                colorClass="border-blue-200 bg-blue-50/30"
            />
             <SynthesisCard 
                title="Divergent Results" 
                items={data.synthesisMatrix.divergentResults} 
                icon={<div className="w-2 h-2 rounded-full bg-orange-500"></div>}
                colorClass="border-orange-200 bg-orange-50/30"
            />
             <SynthesisCard 
                title="Research Gaps" 
                items={data.synthesisMatrix.researchGaps} 
                icon={<div className="w-2 h-2 rounded-full bg-purple-500"></div>}
                colorClass="border-purple-200 bg-purple-50/30"
            />
          </div>
        )}
      </div>
    </div>
  );
};

const Section: React.FC<{ title: string; content: string }> = ({ title, content }) => (
    <div>
        <h4 className="text-sm font-bold uppercase tracking-wider text-academic-400 mb-2">{title}</h4>
        <p className="text-academic-800 leading-relaxed font-serif text-sm md:text-base">{content}</p>
    </div>
);

const SynthesisCard: React.FC<{ title: string; items: string[]; icon: React.ReactNode; colorClass: string }> = ({ title, items, icon, colorClass }) => (
    <div className={`bg-white rounded-xl border shadow-sm p-6 ${colorClass}`}>
        <h3 className="text-lg font-bold text-academic-900 mb-4 flex items-center gap-2">
            {title}
        </h3>
        <ul className="space-y-3">
            {items.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-academic-700 text-sm leading-relaxed">
                    <span className="mt-2 shrink-0">{icon}</span>
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    </div>
);