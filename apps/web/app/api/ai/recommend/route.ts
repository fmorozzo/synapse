import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getUserRecords } from '@synapse/supabase';
import { createOpenAIClient, getRecommendations } from '@synapse/ai';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    // Get user's records
    const records = await getUserRecords(supabase, user.id);

    if (records.length === 0) {
      return NextResponse.json(
        { error: 'No records found. Add some records to get recommendations.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const preferences = body.preferences;

    // Get recommendations
    const openai = createOpenAIClient(apiKey);
    const recommendations = await getRecommendations(openai, records, preferences);

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error('AI recommendations error:', error);
    return NextResponse.json(
      { error: 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}

