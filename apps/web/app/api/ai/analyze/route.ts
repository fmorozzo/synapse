import { NextRequest, NextResponse } from 'next/server';
import { createOpenAIClient, analyzeAlbum } from '@synapse/ai';
import { DiscogsReleaseSchema } from '@synapse/shared';

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    
    // Validate release data
    const release = DiscogsReleaseSchema.parse(body.release);

    // Analyze album
    const openai = createOpenAIClient(apiKey);
    const analysis = await analyzeAlbum(openai, release);

    return NextResponse.json({ analysis });
  } catch (error) {
    console.error('AI analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze album' },
      { status: 500 }
    );
  }
}

