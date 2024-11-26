import { NextResponse } from 'next/server';
import { getTranscript } from '@/utils/youtube';
import { RateLimiter } from '@/utils/rateLimit';
import { RateLimitError } from '@/utils/errors';

export async function POST(request: Request) {
  try {
    const rateLimiter = RateLimiter.getInstance();
    
    // Check rate limit before proceeding
    const canProceed = await rateLimiter.checkLimit('youtube');
    if (!canProceed) {
      const { remaining, total } = rateLimiter.getQuotaInfo('youtube');
      const resetTime = rateLimiter.getResetTime('youtube');
      throw new RateLimitError('youtube', resetTime, remaining, total);
    }

    const { videoUrl } = await request.json();

    if (!videoUrl) {
      return NextResponse.json({ error: 'Video URL is required' }, { status: 400 });
    }

    const { transcript, videoTitle } = await getTranscript(videoUrl);

    // Increment counter after successful API call
    await rateLimiter.incrementCounter('youtube');

    return NextResponse.json({
      transcript,
      videoTitle,
      quotaRemaining: rateLimiter.getRemainingQuota('youtube')
    });

  } catch (error) {
    if (error instanceof RateLimitError) {
      return NextResponse.json({
        error: error.message,
        resetTime: error.resetTime,
        remaining: error.remaining,
        total: error.total
      }, { status: 429 });
    }

    console.error('Error fetching transcript:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transcript' },
      { status: 500 }
    );
  }
}
