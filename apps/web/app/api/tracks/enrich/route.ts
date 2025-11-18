/**
 * API Route: Enrich Track Metadata
 * 
 * POST /api/tracks/enrich
 * 
 * Enriches tracks with BPM/key data from Spotify API
 * Used as fallback when Rekordbox data is not available
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { enrichTrackWithSpotify } from '@/lib/spotify/client';

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
    
    const { trackId, trackIds } = await request.json();
    
    // Support both single and batch enrichment
    if (trackId) {
      const result = await enrichSingleTrack(supabase, user.id, trackId);
      return NextResponse.json({ success: true, result });
    } else if (trackIds && Array.isArray(trackIds)) {
      const results = await enrichMultipleTracks(supabase, user.id, trackIds);
      return NextResponse.json({ success: true, results });
    } else {
      return NextResponse.json(
        { error: 'Missing trackId or trackIds' },
        { status: 400 }
      );
    }
    
  } catch (error) {
    console.error('Error enriching track:', error);
    return NextResponse.json(
      { 
        error: 'Failed to enrich track',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function enrichSingleTrack(supabase: any, userId: string, trackId: string) {
  // Get track info
  const { data: track, error: trackError } = await supabase
    .from('tracks')
    .select('*, songs(*), records(*)')
    .eq('id', trackId)
    .single();
  
  if (trackError || !track) {
    throw new Error('Track not found');
  }
  
  // Skip if already has BPM and key
  if (track.bpm && track.key) {
    return { status: 'already_enriched', track };
  }
  
  // Try to enrich with Spotify
  const enriched = await enrichTrackWithSpotify(
    track.songs.artist,
    track.title,
    {
      album: track.records.title,
      durationMs: track.duration_ms,
    }
  );
  
  if (!enriched) {
    return { status: 'not_found', message: 'No Spotify match found' };
  }
  
  // Update track with enriched data
  const { data: updated, error: updateError } = await supabase
    .from('tracks')
    .update({
      bpm: enriched.bpm,
      key: enriched.key,
      camelot_key: enriched.camelotKey,
      energy_level: enriched.energy,
      spotify_track_id: enriched.spotifyTrackId,
    })
    .eq('id', trackId)
    .select()
    .single();
  
  if (updateError) {
    throw new Error(`Failed to update track: ${updateError.message}`);
  }
  
  // Add metadata source
  await supabase
    .from('track_metadata_sources')
    .insert({
      track_id: trackId,
      user_id: userId,
      source_type: 'spotify',
      source_confidence: 75, // Spotify is reliable but not as accurate as analyzed audio
      bpm: enriched.bpm,
      key: enriched.key,
      camelot_key: enriched.camelotKey,
      energy_level: enriched.energy,
      metadata: {
        spotify_track_id: enriched.spotifyTrackId,
        danceability: enriched.danceability,
        isrc: enriched.isrc,
      },
    });
  
  return { status: 'enriched', track: updated };
}

async function enrichMultipleTracks(supabase: any, userId: string, trackIds: string[]) {
  const results = {
    total: trackIds.length,
    enriched: 0,
    already_enriched: 0,
    not_found: 0,
    failed: 0,
    errors: [] as Array<{ trackId: string; error: string }>,
  };
  
  for (const trackId of trackIds) {
    try {
      const result = await enrichSingleTrack(supabase, userId, trackId);
      
      if (result.status === 'enriched') {
        results.enriched++;
      } else if (result.status === 'already_enriched') {
        results.already_enriched++;
      } else if (result.status === 'not_found') {
        results.not_found++;
      }
      
      // Rate limiting: wait 200ms between requests
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (error) {
      results.failed++;
      results.errors.push({
        trackId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
  
  return results;
}

