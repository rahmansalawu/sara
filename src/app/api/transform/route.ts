import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const videoId = searchParams.get('videoId');

  if (!videoId) {
    return NextResponse.json(
      { error: 'Video ID is required' },
      { status: 400 }
    );
  }

  try {
    // 1. Fetch video transcript
    const transcript = await fetchTranscript(videoId);
    
    // 2. Transform transcript into article format using OpenAI
    const article = await transformTranscript(transcript);

    return NextResponse.json(article);
  } catch (error) {
    console.error('Error transforming content:', error);
    return NextResponse.json(
      { error: 'Failed to transform content' },
      { status: 500 }
    );
  }
}

async function fetchTranscript(videoId: string): Promise<string> {
  // TODO: Implement transcript fetching using YouTube API
  // This is a placeholder that should be replaced with actual implementation
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${process.env.YOUTUBE_API_KEY}`
  );
  const data = await response.json();
  
  if (!data.items?.[0]) {
    throw new Error('Video not found');
  }

  // For now, return video description as placeholder
  return data.items[0].snippet.description;
}

async function transformTranscript(transcript: string) {
  const prompt = `
    Transform this YouTube video transcript into a well-structured article.
    The article should:
    1. Be divided into logical sections with clear headings
    2. Have well-formatted paragraphs
    3. Maintain the key points and flow of the original content
    4. Be engaging and easy to read
    
    Transcript:
    ${transcript}
  `;

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "You are a professional content editor who transforms video transcripts into engaging articles while maintaining the original message and adding appropriate structure."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    model: "gpt-4-1106-preview",
  });

  const transformedContent = completion.choices[0].message.content;
  
  // Parse the transformed content and structure it according to our needs
  // This is a simplified example - you might want to add more sophisticated parsing
  const sections = transformedContent.split('\n\n').map(section => ({
    heading: section.split('\n')[0],
    paragraphs: section.split('\n').slice(1),
  }));

  return {
    title: "Title of the Video", // Replace with actual video title
    author: "Video Author", // Replace with actual author
    date: new Date().toLocaleDateString(),
    content: { sections },
    estimatedReadTime: Math.ceil(transformedContent.split(' ').length / 200), // Assuming 200 words per minute reading speed
  };
}
