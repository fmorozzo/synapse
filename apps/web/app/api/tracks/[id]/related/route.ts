import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(
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

    // Get related tracks (transitions FROM this track)
    const { data: outgoingTransitions, error: outgoingError } = await supabase
      .from('track_transitions')
      .select(`
        *,
        to_track:tracks!track_transitions_to_track_id_fkey(
          id,
          title,
          bpm,
          key,
          song:songs(artist),
          release:records(title)
        )
      `)
      .eq('from_track_id', params.id)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    // Get related tracks (transitions TO this track)
    const { data: incomingTransitions, error: incomingError } = await supabase
      .from('track_transitions')
      .select(`
        *,
        from_track:tracks!track_transitions_from_track_id_fkey(
          id,
          title,
          bpm,
          key,
          song:songs(artist),
          release:records(title)
        )
      `)
      .eq('to_track_id', params.id)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (outgoingError && incomingError) {
      // Table might not exist yet
      console.log('Transitions table not found');
      return NextResponse.json({ related: [] });
    }

    // Map outgoing transitions (this track → other tracks)
    const outgoing = outgoingTransitions?.map((t: any) => ({
      track_id: t.to_track?.id || t.to_track_id,
      track_title: t.to_track?.title || 'Unknown',
      artist: t.to_track?.song?.artist || 'Unknown',
      album: t.to_track?.release?.title || 'Unknown',
      bpm: t.to_track?.bpm,
      key: t.to_track?.key,
      rating: t.rating,
      worked_well: t.worked_well,
      context: t.context,
      transition_id: t.id,
      direction: 'outgoing' as const,
    })) || [];

    // Map incoming transitions (other tracks → this track)
    const incoming = incomingTransitions?.map((t: any) => ({
      track_id: t.from_track?.id || t.from_track_id,
      track_title: t.from_track?.title || 'Unknown',
      artist: t.from_track?.song?.artist || 'Unknown',
      album: t.from_track?.release?.title || 'Unknown',
      bpm: t.from_track?.bpm,
      key: t.from_track?.key,
      rating: t.rating,
      worked_well: t.worked_well,
      context: t.context,
      transition_id: t.id,
      direction: 'incoming' as const,
    })) || [];

    // Combine both directions and remove duplicates
    const allRelated = [...outgoing, ...incoming];
    const uniqueRelated = allRelated.filter((track, index, self) =>
      index === self.findIndex((t) => t.track_id === track.track_id)
    );

    return NextResponse.json({ related: uniqueRelated });
  } catch (error) {
    console.error('Get related tracks error:', error);
    return NextResponse.json({ related: [] });
  }
}

