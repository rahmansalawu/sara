import { NextResponse } from 'next/server';
import { YoutubeTranscript } from 'youtube-transcript';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const videoId = searchParams.get('videoId');

    if (!videoId) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
    }

    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    
    if (!transcript || !Array.isArray(transcript)) {
      throw new Error('Failed to fetch transcript');
    }

    return NextResponse.json(transcript);
  } catch (error) {
    console.error('Error fetching transcript:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transcript. This video might not have captions available.' },
      { status: 500 }
    );
  }
}
