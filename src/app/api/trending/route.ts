import { NextResponse } from 'next/server';
import { google } from 'googleapis';

const youtube = google.youtube('v3');

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const language = searchParams.get('language') || 'en';
    const duration = searchParams.get('duration') || 'any';
    const category = searchParams.get('category') || 'all';

    // Get trending videos from YouTube API
    const response = await youtube.videos.list({
      key: process.env.NEXT_PUBLIC_YOUTUBE_API_KEY,
      part: ['snippet', 'contentDetails', 'statistics'],
      chart: 'mostPopular',
      maxResults: 24,
      regionCode: language === 'en' ? 'US' : language === 'es' ? 'ES' : 'FR',
      videoCategoryId: category === 'all' ? undefined : getCategoryId(category),
    });

    // Filter and transform the response
    const videos = response.data.items?.map((item) => ({
      id: item.id,
      title: item.snippet?.title,
      thumbnail: item.snippet?.thumbnails?.high?.url,
      duration: item.contentDetails?.duration,
      category: item.snippet?.categoryId,
      language: language,
    })) || [];

    // Filter by duration if specified
    const filteredVideos = duration === 'any' 
      ? videos 
      : videos.filter((video) => {
          const durationInSeconds = parseDuration(video.duration || '');
          return matchesDurationFilter(durationInSeconds, duration);
        });

    return NextResponse.json({ videos: filteredVideos });
  } catch (error) {
    console.error('Error fetching trending videos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch trending videos' },
      { status: 500 }
    );
  }
}

function getCategoryId(category: string): string {
  // YouTube category IDs (these are standard across YouTube)
  const categories: Record<string, string> = {
    education: '27',
    tech: '28',
    science: '28', // Science falls under "Science & Technology"
  };
  return categories[category] || '';
}

function parseDuration(duration: string): number {
  // Convert ISO 8601 duration to seconds
  const matches = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!matches) return 0;
  
  const hours = parseInt(matches[1] || '0', 10);
  const minutes = parseInt(matches[2] || '0', 10);
  const seconds = parseInt(matches[3] || '0', 10);
  
  return hours * 3600 + minutes * 60 + seconds;
}

function matchesDurationFilter(durationInSeconds: number, filter: string): boolean {
  switch (filter) {
    case 'short':
      return durationInSeconds < 300; // Less than 5 minutes
    case 'medium':
      return durationInSeconds >= 300 && durationInSeconds <= 1200; // 5-20 minutes
    case 'long':
      return durationInSeconds > 1200; // More than 20 minutes
    default:
      return true;
  }
}
