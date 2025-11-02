import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

interface TrackScore {
  track_id: string;
  track_title: string;
  artist: string;
  album: string;
  cover_image_url?: string;
  label?: string;
  year?: number;
  bpm: number | null;
  key: string | null;
  genres?: string[];
  styles?: string[];
  match_reasons: string[];
  total_score: number;
}

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

    console.log('🎯 Getting recommendations (Cumulative Scoring) for track:', params.id);

    // Get current track with full details
    const { data: currentTrackData, error: trackError } = await supabase
      .from('tracks')
      .select('*, release_id, song_id')
      .eq('id', params.id)
      .single();

    if (trackError || !currentTrackData) {
      console.error('❌ Failed to get current track:', trackError);
      return NextResponse.json({ recommendations: [] });
    }

    // Get release and song details
    const { data: releaseData } = await supabase
      .from('records')
      .select('artist, title, label, year, genres, styles')
      .eq('id', currentTrackData.release_id)
      .single();

    const { data: songData } = await supabase
      .from('songs')
      .select('artist, genres, styles')
      .eq('id', currentTrackData.song_id)
      .single();

    const currentTrack = {
      ...currentTrackData,
      release: releaseData,
      song: songData,
    };

    const currentArtist = releaseData?.artist || songData?.artist;
    const currentLabel = releaseData?.label;
    const currentGenres = releaseData?.genres || songData?.genres || [];

    console.log('📀 Current track:', {
      title: currentTrack.title,
      artist: currentArtist,
      label: currentLabel,
      year: releaseData?.year,
      bpm: currentTrack.bpm,
      key: currentTrack.key,
      genres: currentGenres,
    });

    // Check for existing relations
    const { data: existingRelations } = await supabase
      .from('track_transitions')
      .select('to_track_id, worked_well')
      .eq('from_track_id', params.id)
      .eq('user_id', user.id);

    const relationMap = new Map(
      existingRelations?.map(r => [r.to_track_id, r.worked_well]) || []
    );

    console.log(`🔗 Found ${relationMap.size} existing relations`);

    // Get user's tracks to check (remove default 1000 limit)
    const { data: userTracks, count } = await supabase
      .from('user_tracks')
      .select('track_id', { count: 'exact' })
      .eq('user_id', user.id)
      .neq('track_id', params.id)
      .limit(10000); // Increase limit to 10k tracks

    if (!userTracks || userTracks.length === 0) {
      console.log('⚠️  No user_tracks found');
      return NextResponse.json({ recommendations: [] });
    }

    console.log(`📊 Analyzing ${userTracks.length} tracks in your collection (total: ${count})...`);

    // SMART SELECTION: Prioritize label-based tracks
    const prioritizedTrackIds: string[] = [];
    const seenTrackIds = new Set<string>();

    // 1. PRIORITY: Get tracks from SAME LABEL
    if (currentLabel) {
      console.log(`🏷️  Prioritizing tracks from label: "${currentLabel}"`);
      
      // Check if you have OTHER albums from this label (with relations enabled)
      const { data: sameLabelReleases } = await supabase
        .from('records')
        .select('id, title, artist, notes')
        .eq('label', currentLabel)
        .limit(100);

      // Filter out albums with relations disabled
      const enabledLabelReleases = sameLabelReleases?.filter(
        r => !r.notes?.includes('__RELATIONS_DISABLED__')
      ) || [];

      console.log(`   📀 Total releases in DB with this label: ${sameLabelReleases?.length || 0}`);
      console.log(`   ✅ Releases with relations enabled: ${enabledLabelReleases.length}`);
      
      // Filter to only releases you own (via user_tracks)
      const { data: userOwnedReleases } = await supabase
        .from('user_tracks')
        .select('tracks!inner(release_id, records!inner(id, title, artist, label, notes))')
        .eq('user_id', user.id);

      const userLabelReleases = userOwnedReleases
        ?.map((ut: any) => ut.tracks?.records)
        .filter((r: any) => 
          r && 
          r.label === currentLabel && 
          r.id !== currentTrack.release_id &&
          !r.notes?.includes('__RELATIONS_DISABLED__') // Filter out disabled
        )
        .filter((r: any, index: number, self: any[]) => 
          index === self.findIndex((t: any) => t.id === r.id)
        ) || [];

      console.log(`   📚 Releases YOU own from "${currentLabel}":`, 
        userLabelReleases.map((r: any) => `"${r.title}" by ${r.artist}`));

      if (userLabelReleases.length === 0) {
        console.log(`   ⚠️  You don't own any other albums from "${currentLabel}"`);
      } else {
        const releaseIds = userLabelReleases.map((r: any) => r.id);
        const { data: sameLabelTracks } = await supabase
          .from('tracks')
          .select('id, title')
          .in('release_id', releaseIds);

        console.log(`   Found ${sameLabelTracks?.length || 0} tracks from those releases`);

        if (sameLabelTracks) {
          sameLabelTracks.forEach(track => {
            if (!seenTrackIds.has(track.id) && track.id !== params.id) {
              prioritizedTrackIds.push(track.id);
              seenTrackIds.add(track.id);
            }
          });
          console.log(`   ✅ Added ${sameLabelTracks.length} tracks from same label to priority list`);
        }
      }
    }

    // 2. PRIORITY: Get tracks from SAME ARTIST (with relations enabled)
    if (currentArtist) {
      const { data: sameArtistReleases } = await supabase
        .from('records')
        .select('id, notes')
        .eq('artist', currentArtist)
        .neq('id', currentTrack.release_id)
        .limit(30);

      // Filter out albums with relations disabled
      const enabledArtistReleases = sameArtistReleases?.filter(
        r => !r.notes?.includes('__RELATIONS_DISABLED__')
      ) || [];

      if (enabledArtistReleases.length > 0) {
        const releaseIds = enabledArtistReleases.map(r => r.id);
        const { data: sameArtistTracks } = await supabase
          .from('tracks')
          .select('id')
          .in('release_id', releaseIds);

        if (sameArtistTracks) {
          const userTrackIdSet = new Set(userTracks.map(ut => ut.track_id));
          const artistTrackIds = sameArtistTracks
            .map(t => t.id)
            .filter(id => userTrackIdSet.has(id));
          
          artistTrackIds.forEach(id => {
            if (!seenTrackIds.has(id)) {
              prioritizedTrackIds.push(id);
              seenTrackIds.add(id);
            }
          });
          console.log(`   Found ${artistTrackIds.length} tracks from same artist (relations enabled)`);
        }
      }
    }

    // 3. Fill remaining slots with other tracks (up to 150 total)
    const remainingSlots = 150 - prioritizedTrackIds.length;
    const otherTrackIds = userTracks
      .map(ut => ut.track_id)
      .filter(id => !seenTrackIds.has(id))
      .slice(0, remainingSlots);

    const finalTrackIds = [...prioritizedTrackIds, ...otherTrackIds];
    console.log(`📊 Evaluating ${finalTrackIds.length} tracks (${prioritizedTrackIds.length} prioritized, ${otherTrackIds.length} others)...`);

    // Get all tracks with full details
    const { data: allTracks } = await supabase
      .from('tracks')
      .select('id, title, bpm, key, release_id, song_id')
      .in('id', finalTrackIds);

    if (!allTracks || allTracks.length === 0) {
      return NextResponse.json({ recommendations: [] });
    }

    // Use a Map to accumulate scores
    const scoresMap = new Map<string, TrackScore>();

    // Score each track cumulatively
    for (const track of allTracks) {
      const reasons: string[] = [];
      let score = 0;

      // Get track details
      const { data: trackRelease } = await supabase
        .from('records')
        .select('title, artist, label, year, genres, styles, cover_image_url, notes')
        .eq('id', track.release_id)
        .single();

      // SKIP tracks from albums with relations disabled
      if (trackRelease?.notes?.includes('__RELATIONS_DISABLED__')) {
        console.log(`⏭️  Skipping "${track.title}" from "${trackRelease.title}" (relations disabled)`);
        continue;
      }

      const { data: trackSong } = await supabase
        .from('songs')
        .select('artist, genres')
        .eq('id', track.song_id)
        .single();

      const trackArtist = trackRelease?.artist || trackSong?.artist;
      const trackLabel = trackRelease?.label;
      const trackGenres = trackRelease?.genres || trackSong?.genres || [];
      const trackStyles = trackRelease?.styles || [];

      // ============================================
      // 1. HIGHEST PRIORITY: My Relations (+100)
      // ============================================
      if (relationMap.has(track.id)) {
        const workedWell = relationMap.get(track.id);
        score += 100;
        reasons.push(workedWell ? '✨ You marked this as works' : '✨ You marked this transition');
      }

      // ============================================
      // 2. TODO: Same Session/Playlist (+90)
      // ============================================
      // Will be implemented when sessions are populated

      // ============================================
      // 3. KEY + BPM Combo (Up to +45)
      // ============================================
      
      // BPM matching
      if (currentTrack.bpm && track.bpm) {
        const bpmDiff = Math.abs(currentTrack.bpm - track.bpm);
        if (bpmDiff <= 3) {
          score += 25;
          reasons.push(`🎵 BPM ${track.bpm} (±3)`);
        } else if (bpmDiff <= 5) {
          score += 15;
          reasons.push(`🎵 BPM ${track.bpm} (±5)`);
        } else if (bpmDiff <= 10) {
          score += 5;
          reasons.push(`🎵 BPM ${track.bpm} (±10)`);
        }
      }

      // Key matching
      if (currentTrack.key && track.key) {
        const compatibleKeys = getCompatibleKeys(currentTrack.key);
        if (compatibleKeys.includes(track.key)) {
          score += 20;
          reasons.push(`🔑 Compatible key (${track.key})`);
        }
      }

      // ============================================
      // 4. Genre Matching (+10 per shared genre)
      // ============================================
      const sharedGenres = currentGenres.filter((g: string) => 
        trackGenres.includes(g) && !['Electronic', 'Dance'].includes(g) // Exclude too generic
      );

      if (sharedGenres.length > 0) {
        const genreScore = sharedGenres.length * 10;
        score += genreScore;
        const displayGenres = sharedGenres.slice(0, 2).join(', ');
        reasons.push(`🎨 ${sharedGenres.length} shared genre(s): ${displayGenres}`);
      }

      // ============================================
      // 5. Label Network (+5 to +25)
      // ============================================
      if (currentLabel && trackLabel) {
        if (currentLabel === trackLabel) {
          // Same label - HIGH PRIORITY
          score += 20;
          reasons.push(`🏷️  Same label (${currentLabel})`);

          // Bonus: Same artist on same label
          if (currentArtist && trackArtist && currentArtist === trackArtist) {
            score += 15;
            reasons.push(`🎤 Same artist on same label`);
          }
        } else {
          // Different labels
          
          // Same artist, different label
          if (currentArtist && trackArtist && currentArtist === trackArtist) {
            score += 12;
            reasons.push(`🎤 Same artist, different label`);
          }

          // Check if this artist has releases on current track's label
          const { data: artistOnCurrentLabel } = await supabase
            .from('records')
            .select('id')
            .eq('artist', trackArtist)
            .eq('label', currentLabel)
            .limit(1)
            .maybeSingle();

          if (artistOnCurrentLabel) {
            score += 8;
            reasons.push(`🔗 Artist also on ${currentLabel}`);
          }
        }
      }

      // ============================================
      // 6. Year (Low priority, +1 to +3)
      // ============================================
      if (releaseData?.year && trackRelease?.year) {
        const yearDiff = Math.abs(releaseData.year - trackRelease.year);
        if (yearDiff === 0) {
          score += 3;
          reasons.push(`📅 Same year (${trackRelease.year})`);
        } else if (yearDiff <= 2) {
          score += 1;
          // Don't add reason for minor year match
        }
      }

      // Only add tracks with score > 0
      if (score > 0 && reasons.length > 0) {
        scoresMap.set(track.id, {
          track_id: track.id,
          track_title: track.title,
          artist: trackArtist || 'Unknown',
          album: trackRelease?.title || 'Unknown',
          cover_image_url: trackRelease?.cover_image_url,
          label: trackRelease?.label,
          year: trackRelease?.year,
          bpm: track.bpm,
          key: track.key,
          genres: trackGenres,
          styles: trackStyles,
          match_reasons: reasons,
          total_score: score,
        });
      }
    }

    // Convert to array and sort by total score
    const recommendations = Array.from(scoresMap.values())
      .sort((a, b) => b.total_score - a.total_score)
      .slice(0, 20)
      .map(rec => ({
        track_id: rec.track_id,
        track_title: rec.track_title,
        artist: rec.artist,
        album: rec.album,
        cover_image_url: rec.cover_image_url,
        label: rec.label,
        year: rec.year,
        bpm: rec.bpm,
        key: rec.key,
        genres: rec.genres,
        styles: rec.styles,
        match_reason: rec.match_reasons.join(' • '),
        match_score: rec.total_score,
      }));

    console.log(`✅ Found ${recommendations.length} recommendations`);
    if (recommendations.length > 0) {
      console.log('🏆 Top 3:');
      recommendations.slice(0, 3).forEach((r, i) => {
        console.log(`  ${i + 1}. "${r.track_title}" - Score: ${r.match_score}`);
        console.log(`     ${r.match_reason}`);
      });
    }

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error('❌ Recommendations error:', error);
    return NextResponse.json({ 
      recommendations: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Helper: Get compatible keys for harmonic mixing
function getCompatibleKeys(key: string): string[] {
  const keyMap: Record<string, string[]> = {
    'C': ['C', 'G', 'F', 'Am', 'Em', 'Dm'],
    'G': ['G', 'D', 'C', 'Em', 'Bm', 'Am'],
    'D': ['D', 'A', 'G', 'Bm', 'F#m', 'Em'],
    'A': ['A', 'E', 'D', 'F#m', 'C#m', 'Bm'],
    'E': ['E', 'B', 'A', 'C#m', 'G#m', 'F#m'],
    'B': ['B', 'F#', 'E', 'G#m', 'D#m', 'C#m'],
    'F': ['F', 'C', 'Bb', 'Dm', 'Am', 'Gm'],
    'Bb': ['Bb', 'F', 'Eb', 'Gm', 'Dm', 'Cm'],
    'Eb': ['Eb', 'Bb', 'Ab', 'Cm', 'Gm', 'Fm'],
    'Ab': ['Ab', 'Eb', 'Db', 'Fm', 'Cm', 'Bbm'],
    'Db': ['Db', 'Ab', 'Gb', 'Bbm', 'Fm', 'Ebm'],
    'Gb': ['Gb', 'Db', 'Cb', 'Ebm', 'Bbm', 'Abm'],
    'Am': ['Am', 'Em', 'Dm', 'C', 'G', 'F'],
    'Em': ['Em', 'Bm', 'Am', 'G', 'D', 'C'],
    'Bm': ['Bm', 'F#m', 'Em', 'D', 'A', 'G'],
    'F#m': ['F#m', 'C#m', 'Bm', 'A', 'E', 'D'],
    'C#m': ['C#m', 'G#m', 'F#m', 'E', 'B', 'A'],
    'G#m': ['G#m', 'D#m', 'C#m', 'B', 'F#', 'E'],
    'Dm': ['Dm', 'Am', 'Gm', 'F', 'C', 'Bb'],
    'Gm': ['Gm', 'Dm', 'Cm', 'Bb', 'F', 'Eb'],
    'Cm': ['Cm', 'Gm', 'Fm', 'Eb', 'Bb', 'Ab'],
    'Fm': ['Fm', 'Cm', 'Bbm', 'Ab', 'Eb', 'Db'],
    'Bbm': ['Bbm', 'Fm', 'Ebm', 'Db', 'Ab', 'Gb'],
    'Ebm': ['Ebm', 'Bbm', 'Abm', 'Gb', 'Db', 'Cb'],
  };

  return keyMap[key] || [key];
}
