'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface TLDRSummaryProps {
  enhancedArticle: string;
  videoTitle: string;
  cachedSummary?: string;
  onSummaryGenerated?: (summary: string) => void;
}

const TLDRSummary = ({ 
  enhancedArticle, 
  videoTitle, 
  cachedSummary,
  onSummaryGenerated 
}: TLDRSummaryProps) => {
  const [summary, setSummary] = useState<string>(cachedSummary || '');
  const [loading, setLoading] = useState(!cachedSummary);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generateSummary = async () => {
      if (cachedSummary) {
        setSummary(cachedSummary);
        return;
      }

      if (!enhancedArticle) return;

      setLoading(true);
      setError(null);

      try {
        const response = await axios.post('/api/tldr', {
          enhancedArticle,
          videoTitle,
        });

        const newSummary = response.data.summary;
        setSummary(newSummary);
        onSummaryGenerated?.(newSummary);
      } catch (err: any) {
        setError(
          err.response?.data?.error || 'Failed to generate summary. Please try again.'
        );
        console.error('Error generating summary:', err);
      } finally {
        setLoading(false);
      }
    };

    generateSummary();
  }, [enhancedArticle, videoTitle, cachedSummary, onSummaryGenerated]);

  if (!enhancedArticle) {
    return null;
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-3 bg-gray-50 rounded-lg p-6 mb-8">
        <div className="h-5 bg-gray-200 rounded w-1/4"></div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded w-3/4"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-lg p-4 mb-8">
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <div className="bg-gray-50 rounded-lg p-6 mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">TLDR Summary</h3>
      <div className="space-y-2">
        {summary.split('\n').map((point, index) => {
          if (!point.trim()) return null;
          return (
            <p key={index} className="text-gray-700">
              {point.trim()}
            </p>
          );
        })}
      </div>
    </div>
  );
};

export default TLDRSummary;
