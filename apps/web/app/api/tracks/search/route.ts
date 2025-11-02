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

    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json({ tracks: [] });
    }

    // Search using the user_tracks_detail view or fallback
    let tracks = [];

    try {
      const { data, error } = await supabase
        .from('user_tracks_detail')
        .select('*')
        .eq('user_id', user.id)
        .or(`track_title.ilike.%${query}%,song_artist.ilike.%${query}%,release_title.ilike.%${query}%`)
        .limit(20);

      if (error) throw error;
      tracks = data || [];
    } catch (err) {
      // Fallback to records table
      const { data } = await supabase
        .from('records')
        .select('*')
        .eq('user_id', user.id)
        .or(`title.ilike.%${query}%,artist.ilike.%${query}%`)
        .limit(20);

      tracks = data?.map(record => ({
        track_id: record.id,
        track_title: record.title,
        song_artist: record.artist,
        release_title: record.title,
        cover_image_url: record.cover_image_url,
      })) || [];
    }

    return NextResponse.json({ tracks });
  } catch (error) {
    console.error('Search tracks error:', error);
    return NextResponse.json(
      { error: 'Failed to search tracks' },
      { status: 500 }
    );
  }
}

