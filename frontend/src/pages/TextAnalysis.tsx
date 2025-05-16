import React, { useState } from 'react';
import axios from 'axios';

interface AnalysisResult {
  suggestions: string[];
  score: number;
  details: {
    summary?: string;
    explanation?: string;
    raw_analysis?: string;
  };
}

const TextAnalysis: React.FC = () => {
  const [text, setText] = useState('');
  const [analysisType, setAnalysisType] = useState('grammar');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:8001/api/analyze', {
        text,
        analysis_type: analysisType,
      });
      setResult(response.data);
    } catch (err) {
      setError('An error occurred while analyzing the text. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const renderScore = (score: number) => {
    let color = 'text-red-600';
    let label = 'Needs significant improvement';
    
    if (score >= 0.9) {
      color = 'text-green-600';
      label = 'Excellent';
    } else if (score >= 0.7) {
      color = 'text-green-500';
      label = 'Good';
    } else if (score >= 0.4) {
      color = 'text-yellow-600';
      label = 'Average';
    }
    
    return (
      <div className="flex items-center space-x-2">
        <span className={`text-2xl font-bold ${color}`}>{score.toFixed(2)}</span>
        <span className="text-gray-600">({label})</span>
      </div>
    );
  };

  const cleanSuggestion = (suggestion: string) => {
    // Remove markdown formatting
    return suggestion
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/^[0-9]+\.\s*/, '')
      .trim();
  };

  const renderSuggestions = (suggestions: string[]) => {
    const categories = {
      specificity: [] as string[],
      uniqueValue: [] as string[],
      targetAudience: [] as string[],
      actionItems: [] as string[],
      other: [] as string[]
    };

    suggestions.forEach(suggestion => {
      const cleanSug = cleanSuggestion(suggestion);
      if (cleanSug.toLowerCase().includes('specificity')) {
        categories.specificity.push(cleanSug);
      } else if (cleanSug.toLowerCase().includes('unique value')) {
        categories.uniqueValue.push(cleanSug);
      } else if (cleanSug.toLowerCase().includes('target audience')) {
        categories.targetAudience.push(cleanSug);
      } else if (cleanSug.toLowerCase().includes('action item')) {
        categories.actionItems.push(cleanSug);
      } else {
        categories.other.push(cleanSug);
      }
    });

    return (
      <div className="space-y-6">
        {categories.specificity.length > 0 && (
          <div>
            <h5 className="text-sm font-medium text-gray-900 mb-2">Specificity</h5>
            <ul className="space-y-2">
              {categories.specificity.map((suggestion, index) => (
                <li key={`specificity-${index}`} className="text-sm text-gray-700">{suggestion}</li>
              ))}
            </ul>
          </div>
        )}
        
        {categories.uniqueValue.length > 0 && (
          <div>
            <h5 className="text-sm font-medium text-gray-900 mb-2">Unique Value</h5>
            <ul className="space-y-2">
              {categories.uniqueValue.map((suggestion, index) => (
                <li key={`unique-${index}`} className="text-sm text-gray-700">{suggestion}</li>
              ))}
            </ul>
          </div>
        )}
        
        {categories.targetAudience.length > 0 && (
          <div>
            <h5 className="text-sm font-medium text-gray-900 mb-2">Target Audience</h5>
            <ul className="space-y-2">
              {categories.targetAudience.map((suggestion, index) => (
                <li key={`audience-${index}`} className="text-sm text-gray-700">{suggestion}</li>
              ))}
            </ul>
          </div>
        )}
        
        {categories.actionItems.length > 0 && (
          <div>
            <h5 className="text-sm font-medium text-gray-900 mb-2">Action Items</h5>
            <ul className="space-y-2">
              {categories.actionItems.map((suggestion, index) => (
                <li key={`action-${index}`} className="text-sm text-gray-700">{suggestion}</li>
              ))}
            </ul>
          </div>
        )}
        
        {categories.other.length > 0 && (
          <div>
            <h5 className="text-sm font-medium text-gray-900 mb-2">Other Suggestions</h5>
            <ul className="space-y-2">
              {categories.other.map((suggestion, index) => (
                <li key={`other-${index}`} className="text-sm text-gray-700">{suggestion}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Text Analysis</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 mb-8">
        <div>
          <label htmlFor="analysisType" className="block text-sm font-medium text-gray-700">
            Analysis Type
          </label>
          <select
            id="analysisType"
            value={analysisType}
            onChange={(e) => setAnalysisType(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          >
            <option value="grammar">Grammar & Spelling</option>
            <option value="tone">Tone Analysis</option>
            <option value="plagiarism">Plagiarism Check</option>
            <option value="style">Style Analysis</option>
          </select>
        </div>

        <div>
          <label htmlFor="text" className="block text-sm font-medium text-gray-700">
            Your Text
          </label>
          <textarea
            id="text"
            rows={6}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Enter your text here..."
          />
        </div>

        <button
          type="submit"
          disabled={loading || !text}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Analyzing...' : 'Analyze Text'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {result && (
        <div className="mt-8 space-y-6">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Analysis Results
              </h3>
              {result.details.summary && (
                <p className="mt-2 text-sm text-gray-600">
                  {cleanSuggestion(result.details.summary)}
                </p>
              )}
            </div>
            
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h4 className="text-md font-medium text-gray-900">Quality Score</h4>
                {renderScore(result.score)}
              </div>
            </div>

            <div className="px-4 py-5 sm:px-6">
              <h4 className="text-md font-medium text-gray-900 mb-4">Suggestions for Improvement</h4>
              {renderSuggestions(result.suggestions)}
            </div>

            {result.details.explanation && (
              <div className="px-4 py-5 sm:px-6 bg-gray-50">
                <h4 className="text-md font-medium text-gray-900 mb-2">Detailed Explanation</h4>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {cleanSuggestion(result.details.explanation)}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TextAnalysis; 