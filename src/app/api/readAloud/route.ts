// app/api/tts/route.ts
import { NextRequest } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const maxDuration = 40;

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    const response = await openai.audio.speech.create({
      model: "tts-1",
      voice: "sage",
      input: text,
      response_format: "mp3",
    });

    // Get the raw audio data as a readable stream
    const stream = response.body;

    // Return the stream directly
    return new Response(stream, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (error) {
    console.error('Error generating TTS:', error);
    return Response.json({ error: 'Failed to generate speech' }, { status: 500 });
  }
}