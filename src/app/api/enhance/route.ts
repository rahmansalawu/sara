import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { RateLimiter } from '@/utils/rateLimit';
import { RateLimitError } from '@/utils/errors';

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const rateLimiter = RateLimiter.getInstance();
    
    // Check rate limit before proceeding
    const canProceed = await rateLimiter.checkLimit('openai');
    if (!canProceed) {
      const { remaining, total } = rateLimiter.getQuotaInfo('openai');
      const resetTime = rateLimiter.getResetTime('openai');
      throw new RateLimitError('openai', resetTime, remaining, total);
    }

    const { transcript, videoTitle } = await request.json();

    if (!transcript) {
      return NextResponse.json({ error: 'Transcript is required' }, { status: 400 });
    }

    const prompt = `
      You are a skilled content writer. Transform this YouTube video transcript into an engaging, well-structured article.
      The article should be informative, easy to read, and maintain the key points from the original content.
      
      Video Title: ${videoTitle}
      
      Transcript:
      ${transcript}
      
      Please structure the article with:
      1. An engaging introduction
      2. Well-organized main points
      3. Clear transitions between topics
      4. A concise conclusion
      
      Make it engaging and professional while maintaining accuracy to the original content.
    `;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
    });

    // Increment counter after successful API call
    await rateLimiter.incrementCounter('openai');

    const enhancedArticle = completion.choices[0]?.message?.content;

    if (!enhancedArticle) {
      throw new Error('Failed to generate enhanced article');
    }

    return NextResponse.json({
      article: enhancedArticle,
      quotaRemaining: rateLimiter.getRemainingQuota('openai')
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

    console.error('Error enhancing article:', error);
    return NextResponse.json(
      { error: 'Failed to enhance article' },
      { status: 500 }
    );
  }
}
