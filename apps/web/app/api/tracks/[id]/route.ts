import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createServerSupabaseClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get track with full details
    const { data: userTrack, error } = await supabase
      .from('user_tracks')
      .select(`
        id,
        personal_rating,
        tags,
        source,
        play_count,
        last_played_at,
        created_at,
        tracks!inner (
          id,
          title,
          duration_ms,
          bpm,
          key,
          camelot_key,
          energy_level,
          version_type,
          version_info,
          song_id,
          release_id,
          songs (
            id,
            title,
            artist,
            genres,
            styles
          ),
          records:release_id (
            id,
            title,
            artist,
            year,
            format,
            cover_image_url,
            label,
            collection_type,
            import_source
          )
        )
      `)
      .eq('user_id', user.id)
      .eq('track_id', params.id)
      .single();

    if (error || !userTrack) {
      return NextResponse.json({ error: 'Track not found' }, { status: 404 });
    }

    // Flatten the structure
    const track = {
      ...userTrack.tracks,
      user_track_id: userTrack.id,
      personal_rating: userTrack.personal_rating,
      tags: userTrack.tags,
      source: userTrack.source,
      play_count: userTrack.play_count,
      last_played_at: userTrack.last_played_at,
      created_at: userTrack.created_at,
    };

    return NextResponse.json({ track });
  } catch (error) {
    console.error('Error fetching track:', error);
    return NextResponse.json(
      { error: 'Failed to fetch track' },
      { status: 500 }
    );
  }
}

