'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface EnhancedArticleProps {
  transcript: string;
  videoTitle: string;
  onArticleGenerated?: (article: string) => void;
  cachedArticle?: string;
}

const EnhancedArticle = ({ 
  transcript, 
  videoTitle, 
  onArticleGenerated,
  cachedArticle 
}: EnhancedArticleProps) => {
  const [enhancedContent, setEnhancedContent] = useState<string>(cachedArticle || '');
  const [loading, setLoading] = useState(!cachedArticle);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const enhanceArticle = async () => {
      // If we already have a cached article, don't make the API call
      if (cachedArticle) {
        setEnhancedContent(cachedArticle);
        return;
      }

      if (!transcript) return;

      setLoading(true);
      setError(null);

      try {
        const response = await axios.post('/api/enhance', {
          transcript,
          videoTitle,
        });

        const article = response.data.article;
        setEnhancedContent(article);
        onArticleGenerated?.(article);
      } catch (err: any) {
        setError(
          err.response?.data?.error || 'Failed to enhance article. Please try again.'
        );
        console.error('Error enhancing article:', err);
      } finally {
        setLoading(false);
      }
    };

    enhanceArticle();
  }, [transcript, videoTitle, cachedArticle, onArticleGenerated]);

  if (!transcript) {
    return null;
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-3/4"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-6 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!enhancedContent) {
    return null;
  }

  return (
    <div className="prose prose-gray lg:prose-lg mx-auto">
      {enhancedContent.split('\n').map((paragraph, index) => {
        if (paragraph.trim() === '') return null;
        
        if (paragraph.startsWith('#')) {
          const level = paragraph.match(/^#+/)[0].length;
          const text = paragraph.replace(/^#+\s*/, '');
          const HeadingTag = `h${Math.min(level + 2, 6)}` as keyof JSX.IntrinsicElements;
          return <HeadingTag key={index} className="font-bold mt-6 mb-4">{text}</HeadingTag>;
        }
        
        return (
          <p key={index} className="text-lg text-gray-700 leading-relaxed mb-4">
            {paragraph}
          </p>
        );
      })}
    </div>
  );
};

export default EnhancedArticle;
