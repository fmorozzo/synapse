import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { track_id, position, notes } = body;

    if (!track_id) {
      return NextResponse.json(
        { error: 'Track ID is required' },
        { status: 400 }
      );
    }

    // Verify session belongs to user
    const { data: session } = await supabase
      .from('sessions')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Get the next position if not provided
    let nextPosition = position;
    if (nextPosition === undefined || nextPosition === null) {
      const { data: tracks } = await supabase
        .from('session_tracks')
        .select('position')
        .eq('session_id', params.id)
        .order('position', { ascending: false })
        .limit(1);

      nextPosition = tracks && tracks.length > 0 ? tracks[0].position + 1 : 0;
    }

    // Add track to session
    const { data: sessionTrack, error: insertError } = await supabase
      .from('session_tracks')
      .insert({
        session_id: params.id,
        track_id,
        position: nextPosition,
        notes: notes || null,
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json({ success: true, session_track: sessionTrack });
  } catch (error) {
    console.error('Add track to session error:', error);
    return NextResponse.json(
      { error: 'Failed to add track to session' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { tracks } = body; // Array of { id, position }

    if (!tracks || !Array.isArray(tracks)) {
      return NextResponse.json(
        { error: 'Tracks array is required' },
        { status: 400 }
      );
    }

    // Verify session belongs to user
    const { data: session } = await supabase
      .from('sessions')
      .select('id')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single();

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Update positions for all tracks
    const updates = tracks.map((track) =>
      supabase
        .from('session_tracks')
        .update({ position: track.position })
        .eq('id', track.id)
        .eq('session_id', params.id)
    );

    await Promise.all(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Reorder session tracks error:', error);
    return NextResponse.json(
      { error: 'Failed to reorder tracks' },
      { status: 500 }
    );
  }
}

