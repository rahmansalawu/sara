'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';

interface ArticleProps {
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
  videoId: string;
  estimatedReadTime: number;
}

export const ArticleView: React.FC<ArticleProps> = ({
  title,
  author,
  date,
  content,
  videoId,
  estimatedReadTime,
}) => {
  const { textSize } = useTheme();

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      {/* Article Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          {title}
        </h1>
        <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            <span>{author}</span>
            <span>•</span>
            <span>{date}</span>
          </div>
          <span>{estimatedReadTime} min read</span>
        </div>
      </header>

      {/* Video Preview */}
      <div className="aspect-video w-full mb-8 rounded-lg overflow-hidden">
        <iframe
          width="100%"
          height="100%"
          src={`https://www.youtube.com/embed/${videoId}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>

      {/* Article Content */}
      <div className={`prose prose-${textSize} dark:prose-invert max-w-none`}>
        {content.sections.map((section, index) => (
          <section key={index} className="mb-8">
            {section.heading && (
              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                {section.heading}
              </h2>
            )}
            {section.paragraphs.map((paragraph, pIndex) => (
              <div key={pIndex} className="mb-4">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {paragraph}
                </p>
                {section.timestamp && pIndex === section.paragraphs.length - 1 && (
                  <a
                    href={`https://youtube.com/watch?v=${videoId}&t=${section.timestamp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    Watch this section on YouTube
                  </a>
                )}
              </div>
            ))}
          </section>
        ))}
      </div>

      {/* Article Footer */}
      <footer className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <a
            href={`https://youtube.com/watch?v=${videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            Watch full video on YouTube
          </a>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            Back to top ↑
          </button>
        </div>
      </footer>
    </article>
  );
};
