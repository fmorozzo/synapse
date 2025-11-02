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

    // Get current track details
    const { data: currentTrack } = await supabase
      .from('tracks')
      .select(`
        *,
        song:songs(
          genres,
          styles
        ),
        release:records(
          artist,
          label
        )
      `)
      .eq('id', params.id)
      .single();

    if (!currentTrack) {
      return NextResponse.json({ recommendations: [] });
    }

    const recommendations: any[] = [];

    // 1. BPM-based recommendations (±5 BPM)
    if (currentTrack.bpm) {
      const { data: bpmMatches } = await supabase
        .from('user_tracks')
        .select(`
          track:tracks(
            id,
            title,
            bpm,
            key,
            song:songs(artist),
            release:records(title)
          )
        `)
        .eq('user_id', user.id)
        .neq('track_id', params.id)
        .gte('track.bpm', currentTrack.bpm - 5)
        .lte('track.bpm', currentTrack.bpm + 5)
        .limit(10);

      bpmMatches?.forEach((match: any) => {
        if (match.track && match.track.id) {
          recommendations.push({
            track_id: match.track.id,
            track_title: match.track.title,
            artist: match.track.song?.artist || 'Unknown',
            album: match.track.release?.title || 'Unknown',
            bpm: match.track.bpm,
            key: match.track.key,
            match_reason: `Similar BPM (${match.track.bpm})`,
            match_score: 100 - Math.abs(currentTrack.bpm - match.track.bpm) * 2,
          });
        }
      });
    }

    // 2. Key-compatible recommendations
    if (currentTrack.key) {
      const compatibleKeys = getCompatibleKeys(currentTrack.key);
      
      const { data: keyMatches } = await supabase
        .from('user_tracks')
        .select(`
          track:tracks(
            id,
            title,
            bpm,
            key,
            song:songs(artist),
            release:records(title)
          )
        `)
        .eq('user_id', user.id)
        .neq('track_id', params.id)
        .in('track.key', compatibleKeys)
        .limit(10);

      keyMatches?.forEach((match: any) => {
        if (match.track && match.track.id && !recommendations.find(r => r.track_id === match.track.id)) {
          recommendations.push({
            track_id: match.track.id,
            track_title: match.track.title,
            artist: match.track.song?.artist || 'Unknown',
            album: match.track.release?.title || 'Unknown',
            bpm: match.track.bpm,
            key: match.track.key,
            match_reason: `Compatible key (${match.track.key})`,
            match_score: 85,
          });
        }
      });
    }

    // 3. Genre-based recommendations
    if (currentTrack.song?.genres && currentTrack.song.genres.length > 0) {
      const { data: genreMatches } = await supabase
        .from('user_tracks')
        .select(`
          track:tracks(
            id,
            title,
            bpm,
            key,
            song:songs(
              artist,
              genres
            ),
            release:records(title)
          )
        `)
        .eq('user_id', user.id)
        .neq('track_id', params.id)
        .limit(10);

      genreMatches?.forEach((match: any) => {
        if (match.track && match.track.id && !recommendations.find(r => r.track_id === match.track.id)) {
          const sharedGenres = match.track.song?.genres?.filter((g: string) =>
            currentTrack.song.genres.includes(g)
          ) || [];

          if (sharedGenres.length > 0) {
            recommendations.push({
              track_id: match.track.id,
              track_title: match.track.title,
              artist: match.track.song?.artist || 'Unknown',
              album: match.track.release?.title || 'Unknown',
              bpm: match.track.bpm,
              key: match.track.key,
              match_reason: `Similar genre (${sharedGenres[0]})`,
              match_score: 70,
            });
          }
        }
      });
    }

    // 4. Same artist recommendations
    if (currentTrack.release?.artist) {
      const { data: artistMatches } = await supabase
        .from('user_tracks')
        .select(`
          track:tracks(
            id,
            title,
            bpm,
            key,
            song:songs(artist),
            release:records(title, artist)
          )
        `)
        .eq('user_id', user.id)
        .neq('track_id', params.id)
        .eq('track.release.artist', currentTrack.release.artist)
        .limit(5);

      artistMatches?.forEach((match: any) => {
        if (match.track && match.track.id && !recommendations.find(r => r.track_id === match.track.id)) {
          recommendations.push({
            track_id: match.track.id,
            track_title: match.track.title,
            artist: match.track.song?.artist || 'Unknown',
            album: match.track.release?.title || 'Unknown',
            bpm: match.track.bpm,
            key: match.track.key,
            match_reason: 'Same artist',
            match_score: 60,
          });
        }
      });
    }

    // Sort by match score and limit to top 20
    recommendations.sort((a, b) => b.match_score - a.match_score);
    const topRecommendations = recommendations.slice(0, 20);

    return NextResponse.json({ recommendations: topRecommendations });
  } catch (error) {
    console.error('Get recommendations error:', error);
    return NextResponse.json({ recommendations: [] });
  }
}

// Helper function to get compatible keys (simple version)
function getCompatibleKeys(key: string): string[] {
  const keyMap: Record<string, string[]> = {
    'C': ['C', 'G', 'F', 'Am', 'Em', 'Dm'],
    'G': ['G', 'D', 'C', 'Em', 'Bm', 'Am'],
    'D': ['D', 'A', 'G', 'Bm', 'F#m', 'Em'],
    'A': ['A', 'E', 'D', 'F#m', 'C#m', 'Bm'],
    'E': ['E', 'B', 'A', 'C#m', 'G#m', 'F#m'],
    'Am': ['Am', 'Em', 'Dm', 'C', 'G', 'F'],
    'Em': ['Em', 'Bm', 'Am', 'G', 'D', 'C'],
    'Dm': ['Dm', 'Am', 'Gm', 'F', 'C', 'Bb'],
    // Add more as needed
  };

  return keyMap[key] || [key];
}

