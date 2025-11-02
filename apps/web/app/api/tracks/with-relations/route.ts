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

    // Get all tracks that have at least one transition (incoming or outgoing)
    const { data: tracksData, error } = await supabase.rpc('get_tracks_with_relations', {
      p_user_id: user.id
    });

    if (error) {
      // If the function doesn't exist, fall back to manual query
      console.log('RPC function not found, using fallback query');
      
      // Get all transitions for this user
      const { data: transitions } = await supabase
        .from('track_transitions')
        .select('from_track_id, to_track_id')
        .eq('user_id', user.id);

      if (!transitions || transitions.length === 0) {
        return NextResponse.json({ tracks: [] });
      }

      // Get unique track IDs that have relations
      const trackIds = new Set<string>();
      transitions.forEach(t => {
        trackIds.add(t.from_track_id);
        trackIds.add(t.to_track_id);
      });

      // Fetch track details
      const { data: tracks } = await supabase
        .from('user_tracks_detail')
        .select('*')
        .in('track_id', Array.from(trackIds))
        .eq('user_id', user.id);

      if (!tracks) {
        return NextResponse.json({ tracks: [] });
      }

      // Count relations for each track
      const tracksWithCounts = tracks.map(track => {
        const outgoing = transitions.filter(t => t.from_track_id === track.track_id).length;
        const incoming = transitions.filter(t => t.to_track_id === track.track_id).length;
        
        return {
          track_id: track.track_id,
          track_title: track.track_title,
          song_artist: track.song_artist,
          release_title: track.release_title,
          bpm: track.bpm,
          key: track.key,
          cover_image_url: track.cover_image_url,
          outgoing_count: outgoing,
          incoming_count: incoming,
          total_relations: outgoing + incoming,
        };
      });

      // Sort by total relations (descending)
      tracksWithCounts.sort((a, b) => b.total_relations - a.total_relations);

      return NextResponse.json({ tracks: tracksWithCounts });
    }

    // If RPC function exists, use its results
    return NextResponse.json({ tracks: tracksData || [] });
  } catch (error) {
    console.error('Get tracks with relations error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tracks with relations' },
      { status: 500 }
    );
  }
}

