'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

interface Comment {
  id: string;
  authorDisplayName: string;
  authorProfileImageUrl: string;
  textDisplay: string;
  likeCount: number;
  replyCount: number;
  publishedAt: string;
}

interface CommentSectionProps {
  videoId: string;
}

const CommentSection = ({ videoId }: CommentSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'likes' | 'replies'>('likes');

  useEffect(() => {
    const fetchComments = async () => {
      if (!videoId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(`/api/comments?videoId=${videoId}`);
        setComments(response.data);
      } catch (err: any) {
        setError('Failed to load comments. Please try again.');
        console.error('Error fetching comments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchComments();
  }, [videoId]);

  const sortedComments = [...comments].sort((a, b) => {
    if (sortBy === 'likes') {
      return b.likeCount - a.likeCount;
    }
    return b.replyCount - a.replyCount;
  });

  if (!videoId) return null;

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/4"></div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex gap-4">
              <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
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

  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-gray-900">
          Discussion ({comments.length})
        </h2>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'likes' | 'replies')}
          className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
          aria-label="Sort comments by"
        >
          <option value="likes">Most Liked</option>
          <option value="replies">Most Discussed</option>
        </select>
      </div>

      <div className="space-y-6">
        {sortedComments.map((comment) => (
          <article key={comment.id} className="flex gap-4 p-4 rounded-lg hover:bg-gray-50 transition-colors">
            <img
              src={comment.authorProfileImageUrl}
              alt={`${comment.authorDisplayName}'s profile`}
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1 space-y-2">
              <header className="flex items-center gap-2">
                <h3 className="font-medium text-gray-900">
                  {comment.authorDisplayName}
                </h3>
                <time className="text-sm text-gray-500">
                  {new Date(comment.publishedAt).toLocaleDateString()}
                </time>
              </header>
              <p className="text-gray-700 leading-relaxed">{comment.textDisplay}</p>
              <footer className="flex gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"></path>
                  </svg>
                  {comment.likeCount}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                  </svg>
                  {comment.replyCount}
                </span>
              </footer>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default CommentSection;
