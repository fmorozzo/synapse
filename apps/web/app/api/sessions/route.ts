import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
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

    // Try to get sessions with details from view
    let sessions;
    try {
      const { data, error } = await supabase
        .from('session_details')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      sessions = data;
    } catch (err) {
      // Fallback if view doesn't exist
      const { data } = await supabase
        .from('sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      sessions = data || [];
    }

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Get sessions error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

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

    const body = await request.json();
    const { name, description, session_date, venue, status } = body;

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Session name is required' },
        { status: 400 }
      );
    }

    // Create session
    const { data: session, error: insertError } = await supabase
      .from('sessions')
      .insert({
        user_id: user.id,
        name: name.trim(),
        description: description || null,
        session_date: session_date || null,
        venue: venue || null,
        status: status || 'draft',
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json({ success: true, session });
  } catch (error) {
    console.error('Create session error:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
}

