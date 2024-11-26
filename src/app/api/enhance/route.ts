import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_API_KEY,
});

export async function POST(request: Request) {
  try {
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

    const enhancedArticle = completion.choices[0]?.message?.content;

    if (!enhancedArticle) {
      throw new Error('Failed to generate enhanced article');
    }

    return NextResponse.json({ article: enhancedArticle });
  } catch (error) {
    console.error('Error enhancing article:', error);
    return NextResponse.json(
      { error: 'Failed to enhance article' },
      { status: 500 }
    );
  }
}
