'use client';

import { useState } from 'react';
import VideoTranscript from '@/components/VideoTranscript';
import CommentSection from '@/components/CommentSection';
import VideoInput from '@/components/VideoInput';

export default function Home() {
  const [videoId, setVideoId] = useState<string>('');

  const handleVideoSubmit = (id: string) => {
    setVideoId(id);
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Sara</h1>
          <p className="text-gray-600 mb-6">Transform YouTube videos into readable articles</p>
          <VideoInput onSubmit={handleVideoSubmit} />
        </div>
        
        {videoId && (
          <article className="space-y-12">
            <VideoTranscript videoId={videoId} />
            <hr className="border-gray-200" />
            <CommentSection videoId={videoId} />
          </article>
        )}
      </div>
    </main>
  );
}
