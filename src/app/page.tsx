'use client';

import { useState } from 'react';
import VideoTranscript from '@/components/VideoTranscript';
import CommentSection from '@/components/CommentSection';
import VideoInput from '@/components/VideoInput';
import { TrendingVideos } from '@/components/TrendingVideos/TrendingVideos';
import { UserPreferences } from '@/components/UserPreferences/UserPreferences';
import { SwipeInterface } from '@/components/SwipeInterface/SwipeInterface';

export default function Home() {
  const [videoId, setVideoId] = useState<string>('');
  const [currentView, setCurrentView] = useState<'home' | 'trending' | 'preferences'>('home');

  const handleVideoSubmit = (id: string) => {
    setVideoId(id);
    setCurrentView('home');
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    const views: ('home' | 'trending' | 'preferences')[] = ['trending', 'home', 'preferences'];
    const currentIndex = views.indexOf(currentView);
    
    if (direction === 'left' && currentIndex < views.length - 1) {
      setCurrentView(views[currentIndex + 1]);
    } else if (direction === 'right' && currentIndex > 0) {
      setCurrentView(views[currentIndex - 1]);
    }
  };

  return (
    <SwipeInterface
      onSwipeLeft={() => handleSwipe('left')}
      onSwipeRight={() => handleSwipe('right')}
    >
      <main className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Sara</h1>
            <p className="text-gray-600 mb-6">Transform YouTube videos into readable articles</p>
          </div>

          {/* Navigation */}
          <nav className="mb-8">
            <ul className="flex justify-center space-x-4">
              <li>
                <button
                  onClick={() => setCurrentView('trending')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentView === 'trending'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Trending
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('home')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentView === 'home'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Home
                </button>
              </li>
              <li>
                <button
                  onClick={() => setCurrentView('preferences')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    currentView === 'preferences'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Preferences
                </button>
              </li>
            </ul>
          </nav>

          {/* View Content */}
          <div className="transition-opacity duration-200">
            {currentView === 'home' && (
              <>
                <div className="mb-8">
                  <VideoInput onSubmit={handleVideoSubmit} />
                </div>
                
                {videoId && (
                  <article className="space-y-12">
                    <VideoTranscript videoId={videoId} />
                    <hr className="border-gray-200" />
                    <CommentSection videoId={videoId} />
                  </article>
                )}
              </>
            )}

            {currentView === 'trending' && <TrendingVideos />}
            {currentView === 'preferences' && <UserPreferences />}
          </div>
        </div>
      </main>
    </SwipeInterface>
  );
}
