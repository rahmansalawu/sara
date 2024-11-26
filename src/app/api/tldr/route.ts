import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { enhancedArticle, videoTitle } = await request.json();

    if (!enhancedArticle) {
      return NextResponse.json({ error: 'Enhanced article is required' }, { status: 400 });
    }

    const prompt = `
      Create a TLDR (Too Long; Didn't Read) summary of this article in exactly 5 bullet points.
      Each bullet point should be concise but informative, capturing the key insights or main points.
      
      Article Title: ${videoTitle}
      
      Article Content:
      ${enhancedArticle}
      
      Format the response as 5 bullet points, each starting with "•". Focus on the most important takeaways.
    `;

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
    });

    const tldrSummary = completion.choices[0]?.message?.content;

    if (!tldrSummary) {
      throw new Error('Failed to generate TLDR summary');
    }

    return NextResponse.json({ summary: tldrSummary });
  } catch (error) {
    console.error('Error generating TLDR:', error);
    return NextResponse.json(
      { error: 'Failed to generate TLDR summary' },
      { status: 500 }
    );
  }
}
