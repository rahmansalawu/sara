'use client';

import React, { useEffect, useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface TrendingVideo {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  category: string;
  language: string;
}

interface TrendingFilters {
  language: string;
  duration: 'short' | 'medium' | 'long';
  category: string;
}

export const TrendingVideos: React.FC = () => {
  const [videos, setVideos] = useState<TrendingVideo[]>([]);
  const [filters, setFilters] = useLocalStorage<TrendingFilters>('trending_filters', {
    language: 'en',
    duration: 'medium',
    category: 'all'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrendingVideos = async () => {
      try {
        setLoading(true);
        // TODO: Implement API call to fetch trending videos
        const response = await fetch(`/api/trending?${new URLSearchParams({
          language: filters.language,
          duration: filters.duration,
          category: filters.category
        })}`);
        
        if (!response.ok) throw new Error('Failed to fetch trending videos');
        
        const data = await response.json();
        setVideos(data.videos);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch trending videos');
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingVideos();
    // Refresh every 6 hours
    const interval = setInterval(fetchTrendingVideos, 6 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [filters]);

  if (loading) return <div className="animate-pulse">Loading trending videos...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex gap-4 p-4 bg-gray-100 rounded-lg">
        <select
          value={filters.language}
          onChange={(e) => setFilters({ ...filters, language: e.target.value })}
          className="rounded-md border-gray-300"
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
        </select>

        <select
          value={filters.duration}
          onChange={(e) => setFilters({ ...filters, duration: e.target.value as any })}
          className="rounded-md border-gray-300"
        >
          <option value="short">Short (&lt; 5min)</option>
          <option value="medium">Medium (5-20min)</option>
          <option value="long">Long (&gt; 20min)</option>
        </select>

        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          className="rounded-md border-gray-300"
        >
          <option value="all">All Categories</option>
          <option value="education">Education</option>
          <option value="tech">Technology</option>
          <option value="science">Science</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video) => (
          <div
            key={video.id}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
          >
            <img
              src={video.thumbnail}
              alt={video.title}
              className="w-full aspect-video object-cover"
            />
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{video.title}</h3>
              <div className="flex justify-between text-sm text-gray-600">
                <span>{video.duration}</span>
                <span>{video.category}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
