'use client';

import React, { useEffect, useState } from 'react';
import { ArticleView } from '@/components/ArticleView/ArticleView';
import { useParams } from 'next/navigation';

interface TransformedContent {
  title: string;
  author: string;
  date: string;
  content: {
    sections: {
      heading?: string;
      paragraphs: string[];
      timestamp?: string;
    }[];
  };
  estimatedReadTime: number;
}

export default function ArticlePage() {
  const { videoId } = useParams();
  const [article, setArticle] = useState<TransformedContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(`/api/transform?videoId=${videoId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch article');
        }
        const data = await response.json();
        setArticle(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    };

    if (videoId) {
      fetchArticle();
    }
  }, [videoId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
        <p className="text-gray-600 dark:text-gray-400">{error}</p>
      </div>
    );
  }

  if (!article) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ArticleView
        title={article.title}
        author={article.author}
        date={article.date}
        content={article.content}
        videoId={videoId as string}
        estimatedReadTime={article.estimatedReadTime}
      />
    </main>
  );
}
