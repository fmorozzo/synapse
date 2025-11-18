import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getCompatibleKeys } from '@synapse/shared';

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

    // Get current track with full details
    const { data: currentTrackData, error: trackError } = await supabase
      .from('tracks')
      .select(`
        id,
        title,
        bpm,
        key,
        camelot_key,
        release_id,
        song_id,
        records:release_id (
          title,
          artist,
          label,
          year,
          genres,
          styles
        ),
        songs (
          artist,
          genres,
          styles
        )
      `)
      .eq('id', params.id)
      .single();

    if (trackError || !currentTrackData) {
      console.error('Failed to get current track:', trackError);
      return NextResponse.json({ recommendations: [] });
    }

    const currentTrack: any = currentTrackData;
    const currentArtist = currentTrack.records?.artist || currentTrack.songs?.artist;
    const currentLabel = currentTrack.records?.label;
    const currentGenres = currentTrack.records?.genres || currentTrack.songs?.genres || [];
    const currentBpm = currentTrack.bpm;
    const currentKey = currentTrack.camelot_key || currentTrack.key;

    console.log('🎯 Getting recommendations for:', {
      title: currentTrack.title,
      artist: currentArtist,
      bpm: currentBpm,
      key: currentKey,
      genres: currentGenres,
    });

    // Get user's other tracks (limit to 10,000)
    const { data: userTracks } = await supabase
      .from('user_tracks')
      .select('track_id')
      .eq('user_id', user.id)
      .neq('track_id', params.id)
      .limit(10000);

    if (!userTracks || userTracks.length === 0) {
      return NextResponse.json({ recommendations: [] });
    }

    const trackIds = userTracks.map(ut => ut.track_id);

    // Get all candidate tracks
    const { data: candidateTracks } = await supabase
      .from('tracks')
      .select(`
        id,
        title,
        bpm,
        key,
        camelot_key,
        records:release_id (
          id,
          title,
          artist,
          label,
          year,
          genres,
          styles,
          cover_image_url,
          collection_type
        ),
        songs (
          artist,
          genres
        )
      `)
      .in('id', trackIds)
      .limit(500); // Limit for performance

    if (!candidateTracks || candidateTracks.length === 0) {
      return NextResponse.json({ recommendations: [] });
    }

    // Score each track
    const recommendations = candidateTracks
      .map((track: any) => {
        let score = 0;
        const reasons: string[] = [];

        const trackArtist = track.records?.artist || track.songs?.artist;
        const trackLabel = track.records?.label;
        const trackGenres = track.records?.genres || track.songs?.genres || [];
        const trackBpm = track.bpm;
        const trackKey = track.camelot_key || track.key;

        // BPM matching (±6% for DJ pitch control)
        if (currentBpm && trackBpm) {
          const bpmDiff = Math.abs(currentBpm - trackBpm);
          const percentDiff = (bpmDiff / currentBpm) * 100;
          
          if (percentDiff <= 6) {
            score += 30;
            reasons.push(`BPM ${trackBpm.toFixed(0)} (±${percentDiff.toFixed(1)}%)`);
          } else if (percentDiff <= 10) {
            score += 10;
          }
        }

        // Harmonic key matching (Camelot wheel)
        if (currentKey && trackKey) {
          const compatibleKeys = getCompatibleKeys(currentKey);
          if (compatibleKeys.some(k => k.key === trackKey)) {
            score += 25;
            reasons.push(`Harmonic match (${trackKey})`);
          }
        }

        // Same label
        if (currentLabel && trackLabel && currentLabel === trackLabel) {
          score += 20;
          reasons.push(`Same label (${currentLabel})`);
        }

        // Same artist
        if (currentArtist && trackArtist && currentArtist === trackArtist) {
          score += 15;
          reasons.push(`Same artist`);
        }

        // Genre matching
        const sharedGenres = currentGenres.filter((g: string) => 
          trackGenres.includes(g)
        );
        if (sharedGenres.length > 0) {
          score += sharedGenres.length * 5;
          reasons.push(`Genre: ${sharedGenres.slice(0, 2).join(', ')}`);
        }

        // Year proximity
        if (currentTrack.records?.year && track.records?.year) {
          const yearDiff = Math.abs(currentTrack.records.year - track.records.year);
          if (yearDiff <= 2) {
            score += 3;
          }
        }

        return {
          track_id: track.id,
          track_title: track.title,
          artist: trackArtist || 'Unknown',
          album: track.records?.title || 'Unknown',
          cover_image_url: track.records?.cover_image_url,
          label: track.records?.label,
          year: track.records?.year,
          bpm: track.bpm,
          key: track.camelot_key || track.key,
          genres: trackGenres,
          styles: track.records?.styles || [],
          collection_type: track.records?.collection_type,
          match_reason: reasons.join(' • ') || 'Similar music',
          match_score: score,
        };
      })
      .filter(rec => rec.match_score > 0)
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, 20);

    console.log(`✅ Found ${recommendations.length} recommendations`);

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error('❌ Recommendations error:', error);
    return NextResponse.json({ 
      recommendations: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

