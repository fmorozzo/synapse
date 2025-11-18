/**
 * API Route: Import Rekordbox Collection
 * 
 * POST /api/rekordbox/import
 * 
 * Accepts Rekordbox XML file content and imports tracks into the database:
 * 1. Parse XML file
 * 2. Create/match canonical songs
 * 3. Create digital releases
 * 4. Create tracks with BPM/key metadata
 * 5. Link to user collection
 * 6. Store Rekordbox-specific data (cue points, etc.)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { 
  parseRekordboxXML, 
  RekordboxTrack,
  getCollectionStats 
} from '@synapse/shared';
import { 
  matchTracks,
  normalizeArtist,
  normalizeTitle,
  TrackIdentity 
} from '@synapse/shared';
import crypto from 'crypto';

// ============================================
// TYPES
// ============================================

interface ImportResult {
  success: boolean;
  stats: {
    totalTracks: number;
    imported: number;
    matched: number;
    failed: number;
    duplicates: number;
  };
  errors: Array<{
    track: string;
    error: string;
  }>;
}

// ============================================
// MAIN HANDLER
// ============================================

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
    
    // Get request body
    const { xmlContent, fileName } = await request.json();
    
    if (!xmlContent) {
      return NextResponse.json(
        { error: 'Missing XML content' },
        { status: 400 }
      );
    }
    
    // Parse Rekordbox XML
    console.log('Parsing Rekordbox XML...');
    const collection = await parseRekordboxXML(xmlContent);
    
    const stats = getCollectionStats(collection);
    console.log('Collection stats:', stats);
    
    // Import tracks
    const result = await importRekordboxCollection(
      supabase,
      user.id,
      collection.tracks,
      fileName || 'rekordbox.xml'
    );
    
    return NextResponse.json({
      success: true,
      result,
      collectionStats: stats,
    });
    
  } catch (error) {
    console.error('Error importing Rekordbox collection:', error);
    return NextResponse.json(
      { 
        error: 'Failed to import Rekordbox collection',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// ============================================
// IMPORT LOGIC
// ============================================

async function importRekordboxCollection(
  supabase: any,
  userId: string,
  tracks: RekordboxTrack[],
  fileName: string
): Promise<ImportResult> {
  const result: ImportResult = {
    success: true,
    stats: {
      totalTracks: tracks.length,
      imported: 0,
      matched: 0,
      failed: 0,
      duplicates: 0,
    },
    errors: [],
  };
  
  // Get existing tracks for matching
  const { data: existingTracks } = await supabase
    .from('tracks')
    .select('id, title, song_id, songs(title, artist)');
  
  const existingTrackIdentities: Array<TrackIdentity & { id: string; song_id: string }> = 
    existingTracks?.map((t: any) => ({
      id: t.id,
      song_id: t.song_id,
      title: t.songs?.title || t.title,
      artist: t.songs?.artist || '',
    })) || [];
  
  // Process tracks in batches (to avoid overwhelming the database)
  const BATCH_SIZE = 50;
  for (let i = 0; i < tracks.length; i += BATCH_SIZE) {
    const batch = tracks.slice(i, i + BATCH_SIZE);
    
    await Promise.all(
      batch.map(track => importSingleTrack(
        supabase,
        userId,
        track,
        fileName,
        existingTrackIdentities,
        result
      ))
    );
    
    console.log(`Processed ${Math.min(i + BATCH_SIZE, tracks.length)}/${tracks.length} tracks`);
  }
  
  return result;
}

async function importSingleTrack(
  supabase: any,
  userId: string,
  rbTrack: RekordboxTrack,
  fileName: string,
  existingTracks: Array<TrackIdentity & { id: string; song_id: string }>,
  result: ImportResult
): Promise<void> {
  try {
    // Check if this track already exists for this user
    const { data: existingUserTrack } = await supabase
      .from('rekordbox_data')
      .select('id, track_id')
      .eq('user_id', userId)
      .eq('rekordbox_track_id', rbTrack.trackId)
      .single();
    
    if (existingUserTrack) {
      result.stats.duplicates++;
      return; // Skip duplicates
    }
    
    // Step 1: Find or create canonical song
    const songId = await findOrCreateSong(supabase, rbTrack);
    
    // Step 2: Try to match with existing physical track
    const matchedTrack = findMatchingTrack(rbTrack, existingTracks);
    
    if (matchedTrack) {
      // Match found! Just add metadata source and rekordbox data
      await addMetadataSource(supabase, matchedTrack.id, userId, rbTrack);
      await addRekordboxData(supabase, matchedTrack.id, userId, rbTrack, fileName);
      
      // Link to user's collection
      await linkTrackToUser(supabase, userId, matchedTrack.id, rbTrack);
      
      result.stats.matched++;
    } else {
      // No match - create new digital release and track
      const releaseId = await createDigitalRelease(supabase, userId, rbTrack);
      const trackId = await createTrack(supabase, songId, releaseId, rbTrack);
      
      // Add metadata source
      await addMetadataSource(supabase, trackId, userId, rbTrack);
      
      // Add Rekordbox-specific data
      await addRekordboxData(supabase, trackId, userId, rbTrack, fileName);
      
      // Link to user's collection
      await linkTrackToUser(supabase, userId, trackId, rbTrack);
      
      result.stats.imported++;
    }
    
  } catch (error) {
    console.error(`Error importing track ${rbTrack.name}:`, error);
    result.stats.failed++;
    result.errors.push({
      track: `${rbTrack.artist} - ${rbTrack.name}`,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

// ============================================
// DATABASE OPERATIONS
// ============================================

async function findOrCreateSong(supabase: any, rbTrack: RekordboxTrack): Promise<string> {
  const normalizedTitle = normalizeTitle(rbTrack.name);
  const normalizedArtist = normalizeArtist(rbTrack.artist);
  
  // Try to find existing song
  const { data: existingSong } = await supabase
    .from('songs')
    .select('id')
    .eq('title_normalized', normalizedTitle)
    .eq('artist_normalized', normalizedArtist)
    .single();
  
  if (existingSong) {
    return existingSong.id;
  }
  
  // Create new song
  const { data: newSong, error } = await supabase
    .from('songs')
    .insert({
      title: rbTrack.name,
      artist: rbTrack.artist,
      original_year: rbTrack.year,
      genres: rbTrack.genre ? [rbTrack.genre] : null,
    })
    .select('id')
    .single();
  
  if (error) {
    throw new Error(`Failed to create song: ${error.message}`);
  }
  
  return newSong.id;
}

async function createDigitalRelease(supabase: any, userId: string, rbTrack: RekordboxTrack): Promise<string> {
  // Create a unique identifier for this digital "release" (album)
  const digitalReleaseId = crypto
    .createHash('md5')
    .update(`${rbTrack.artist}::${rbTrack.album || 'Single'}`)
    .digest('hex');
  
  // Check if release already exists
  const { data: existingRelease } = await supabase
    .from('records')
    .select('id')
    .eq('digital_release_id', digitalReleaseId)
    .eq('user_id', userId)
    .single();
  
  if (existingRelease) {
    return existingRelease.id;
  }
  
  // Create new digital release
  const { data: newRelease, error } = await supabase
    .from('records')
    .insert({
      user_id: userId,
      title: rbTrack.album || rbTrack.name,
      artist: rbTrack.artist,
      year: rbTrack.year,
      format: 'Digital',
      collection_type: 'digital',
      import_source: 'rekordbox',
      file_format: rbTrack.fileType,
      bitrate: rbTrack.bitrate,
      sample_rate: rbTrack.sampleRate,
      digital_release_id: digitalReleaseId,
      genres: rbTrack.genre ? [rbTrack.genre] : null,
    })
    .select('id')
    .single();
  
  if (error) {
    throw new Error(`Failed to create digital release: ${error.message}`);
  }
  
  return newRelease.id;
}

async function createTrack(
  supabase: any,
  songId: string,
  releaseId: string,
  rbTrack: RekordboxTrack
): Promise<string> {
  const { data: newTrack, error } = await supabase
    .from('tracks')
    .insert({
      song_id: songId,
      release_id: releaseId,
      title: rbTrack.name,
      duration_ms: rbTrack.duration * 1000,
      bpm: rbTrack.bpm,
      key: rbTrack.key,
      camelot_key: rbTrack.camelotKey,
    })
    .select('id')
    .single();
  
  if (error) {
    throw new Error(`Failed to create track: ${error.message}`);
  }
  
  return newTrack.id;
}

async function addMetadataSource(
  supabase: any,
  trackId: string,
  userId: string,
  rbTrack: RekordboxTrack
): Promise<void> {
  await supabase
    .from('track_metadata_sources')
    .insert({
      track_id: trackId,
      user_id: userId,
      source_type: 'rekordbox',
      source_confidence: 85, // Rekordbox analysis is quite reliable
      bpm: rbTrack.bpm,
      key: rbTrack.key,
      camelot_key: rbTrack.camelotKey,
      metadata: {
        file_type: rbTrack.fileType,
        bitrate: rbTrack.bitrate,
        sample_rate: rbTrack.sampleRate,
      },
    });
}

async function addRekordboxData(
  supabase: any,
  trackId: string,
  userId: string,
  rbTrack: RekordboxTrack,
  fileName: string
): Promise<void> {
  await supabase
    .from('rekordbox_data')
    .insert({
      track_id: trackId,
      user_id: userId,
      rekordbox_track_id: rbTrack.trackId,
      file_path: rbTrack.filePath,
      cue_points: rbTrack.cuePoints,
      hot_cues: rbTrack.hotCues,
      memory_cues: rbTrack.memoryCues,
      color: rbTrack.color,
      rating: rbTrack.rating,
      comment: rbTrack.comment,
      play_count: rbTrack.playCount,
      last_played_at: rbTrack.lastPlayed?.toISOString(),
      imported_from_file: fileName,
    });
}

async function linkTrackToUser(
  supabase: any,
  userId: string,
  trackId: string,
  rbTrack: RekordboxTrack
): Promise<void> {
  // Check if already linked
  const { data: existing } = await supabase
    .from('user_tracks')
    .select('id')
    .eq('user_id', userId)
    .eq('track_id', trackId)
    .single();
  
  if (existing) {
    return; // Already linked
  }
  
  await supabase
    .from('user_tracks')
    .insert({
      user_id: userId,
      track_id: trackId,
      source: 'digital',
      personal_rating: rbTrack.rating,
      play_count: rbTrack.playCount,
      last_played_at: rbTrack.lastPlayed?.toISOString(),
    });
}

// ============================================
// MATCHING LOGIC
// ============================================

function findMatchingTrack(
  rbTrack: RekordboxTrack,
  existingTracks: Array<TrackIdentity & { id: string; song_id: string }>
): { id: string; song_id: string } | null {
  const trackIdentity: TrackIdentity = {
    title: rbTrack.name,
    artist: rbTrack.artist,
    duration: rbTrack.duration * 1000,
    album: rbTrack.album,
    year: rbTrack.year,
  };
  
  for (const existing of existingTracks) {
    const match = matchTracks(trackIdentity, existing);
    
    if (match.confidence >= 85) {
      return { id: existing.id, song_id: existing.song_id };
    }
  }
  
  return null;
}

