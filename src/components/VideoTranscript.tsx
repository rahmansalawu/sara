'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import EnhancedArticle from './EnhancedArticle';
import TLDRSummary from './TLDRSummary';

interface TranscriptItem {
  text: string;
  offset: number;
  duration: number;
}

interface VideoTranscriptProps {
  videoId: string;
}

const VideoTranscript = ({ videoId }: VideoTranscriptProps) => {
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState<string>('');
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');
  const [showOriginal, setShowOriginal] = useState(false);
  const [cachedEnhancedArticle, setCachedEnhancedArticle] = useState<string>('');
  const [cachedTLDR, setCachedTLDR] = useState<string>('');

  useEffect(() => {
    const fetchTranscript = async () => {
      if (!videoId) return;
      
      setLoading(true);
      setError(null);
      setCachedEnhancedArticle(''); // Reset cache when video changes
      setCachedTLDR(''); // Reset TLDR cache when video changes
      
      try {
        const response = await axios.get(`/api/transcript?videoId=${videoId}`);
        setTranscript(response.data);
        
        const titleResponse = await axios.get(`https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${process.env.NEXT_PUBLIC_YOUTUBE_API_KEY}`);
        if (titleResponse.data.items?.[0]?.snippet) {
          const snippet = titleResponse.data.items[0].snippet;
          setVideoTitle(snippet.title);
          const thumbnails = snippet.thumbnails;
          const thumbnail = thumbnails.maxres || thumbnails.standard || thumbnails.high || thumbnails.medium || thumbnails.default;
          setThumbnailUrl(thumbnail.url);
        }
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to load transcript. Please try again.');
        console.error('Error fetching transcript:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTranscript();
  }, [videoId]);

  const cleanText = (text: string): string => {
    return text
      .replace(/\[.*?\]/g, '')
      .replace(/\(.*?\)/g, '')
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s.,!?-]/g, '')
      .trim();
  };

  const handleArticleGenerated = (article: string) => {
    setCachedEnhancedArticle(article);
  };

  const handleSummaryGenerated = (summary: string) => {
    setCachedTLDR(summary);
  };

  if (!videoId) {
    return null;
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-3/4"></div>
        <div className="aspect-video bg-gray-200 rounded-lg"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
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

  const paragraphs = transcript.reduce((acc: string[], item) => {
    const cleanedText = cleanText(item.text);
    if (!cleanedText) return acc;
    
    if (acc.length === 0) {
      return [cleanedText];
    }
    
    const lastParagraph = acc[acc.length - 1];
    if (/[.!?]$/.test(lastParagraph)) {
      return [...acc, cleanedText];
    }
    acc[acc.length - 1] += ' ' + cleanedText;
    return acc;
  }, []);

  return (
    <article className="prose prose-gray lg:prose-lg mx-auto">
      {videoTitle && (
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{videoTitle}</h1>
      )}
      {thumbnailUrl && (
        <div className="mb-8 rounded-lg overflow-hidden shadow-lg">
          <img
            src={thumbnailUrl}
            alt={videoTitle}
            className="w-full h-auto object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* Toggle Switch */}
      <div className="flex items-center justify-end mb-8 space-x-3">
        <span className={`text-sm ${!showOriginal ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
          Enhanced
        </span>
        <button
          onClick={() => setShowOriginal(!showOriginal)}
          className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          style={{ backgroundColor: showOriginal ? '#cbd5e1' : '#3b82f6' }}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              showOriginal ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        <span className={`text-sm ${showOriginal ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
          Original
        </span>
      </div>

      {/* TLDR Summary - Always show regardless of toggle state */}
      {cachedEnhancedArticle && (
        <TLDRSummary
          enhancedArticle={cachedEnhancedArticle}
          videoTitle={videoTitle}
          cachedSummary={cachedTLDR}
          onSummaryGenerated={handleSummaryGenerated}
        />
      )}

      {showOriginal ? (
        <div className="space-y-6 text-gray-700 leading-relaxed">
          {paragraphs.map((paragraph, index) => (
            <p key={index} className="text-lg">
              {paragraph}
            </p>
          ))}
        </div>
      ) : (
        <EnhancedArticle 
          transcript={paragraphs.join('\n')} 
          videoTitle={videoTitle}
          cachedArticle={cachedEnhancedArticle}
          onArticleGenerated={handleArticleGenerated}
        />
      )}
    </article>
  );
};

export default VideoTranscript;
