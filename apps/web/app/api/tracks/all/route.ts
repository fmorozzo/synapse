/**
 * API Route: Get All Tracks with Filters
 * 
 * GET /api/tracks/all
 * 
 * Returns all user's tracks with DJ-focused filters:
 * - BPM range (with ±6% pitch adjustment)
 * - Key (with harmonic compatibility)
 * - Genre
 * - Search (artist/title/album/label)
 * - Decade
 * - Format (vinyl/digital)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

interface TrackFilters {
  bpmMin?: number;
  bpmMax?: number;
  targetBpm?: number; // For ±6% calculation
  keys?: string[]; // Array of compatible keys
  genres?: string[];
  search?: string;
  decade?: string;
  format?: 'vinyl' | 'digital' | 'all';
  sortBy?: 'bpm' | 'key' | 'artist' | 'title' | 'dateAdded';
  sortOrder?: 'asc' | 'desc';
}

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
    
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;
    
    const filters: TrackFilters = {
      bpmMin: searchParams.get('bpmMin') ? parseFloat(searchParams.get('bpmMin')!) : undefined,
      bpmMax: searchParams.get('bpmMax') ? parseFloat(searchParams.get('bpmMax')!) : undefined,
      targetBpm: searchParams.get('targetBpm') ? parseFloat(searchParams.get('targetBpm')!) : undefined,
      keys: searchParams.get('keys')?.split(',').filter(Boolean),
      genres: searchParams.get('genres')?.split(',').filter(Boolean),
      search: searchParams.get('search') || undefined,
      decade: searchParams.get('decade') || undefined,
      format: (searchParams.get('format') as any) || 'all',
      sortBy: (searchParams.get('sortBy') as any) || 'artist', // Default to alphabetical by artist
      sortOrder: (searchParams.get('sortOrder') as any) || 'asc',
    };
    
    // Build query - use a simpler approach with direct joins
    console.log('🚀 Fetching user tracks...');
    
    // FIRST: Check if ANY digital records exist in the database
    const { count: digitalRecordsCount } = await supabase
      .from('records')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('collection_type', 'digital');
    
    console.log(`🔍 TOTAL digital records in database for this user: ${digitalRecordsCount}`);
    
    const { data: userTracksData, error: userTracksError, count: totalCount } = await supabase
      .from('user_tracks')
      .select('id, track_id, personal_rating, tags, source, play_count, last_played_at, created_at', { count: 'exact' })
      .eq('user_id', user.id)
      .limit(10000); // Fetch all tracks (max 10k supported by Supabase)
    
    console.log(`📊 Fetched ${userTracksData?.length || 0} user tracks (total count: ${totalCount})`);
    
    if (userTracksError) {
      throw userTracksError;
    }
    
    if (!userTracksData || userTracksData.length === 0) {
      return NextResponse.json({
        success: true,
        tracks: [],
        count: 0,
        totalCount: 0,
        hasMore: false,
        filters,
      });
    }
    
    const trackIds = userTracksData.map(ut => ut.track_id);
    console.log(`Fetching ${trackIds.length} tracks in chunks...`);
    
    // Fetch tracks WITHOUT nested relations to avoid fetch errors
    const CHUNK_SIZE = 200; // Smaller chunks
    let allTracksData: any[] = [];
    
    for (let i = 0; i < trackIds.length; i += CHUNK_SIZE) {
      const chunk = trackIds.slice(i, i + CHUNK_SIZE);
      console.log(`Fetching chunk ${Math.floor(i / CHUNK_SIZE) + 1}/${Math.ceil(trackIds.length / CHUNK_SIZE)} (${chunk.length} tracks)...`);
      
      const { data: chunkData, error: chunkError } = await supabase
        .from('tracks')
        .select('id, title, duration_ms, bpm, key, camelot_key, energy_level, version_type, version_info, song_id, release_id')
        .in('id', chunk);
      
      if (chunkError) {
        console.error('Supabase query error:', JSON.stringify(chunkError, null, 2));
        throw new Error(`Supabase error: ${chunkError.message} - ${chunkError.details || chunkError.hint || 'No details'}`);
      }
      
      if (chunkData) {
        allTracksData = allTracksData.concat(chunkData);
      }
    }
    
    console.log(`Fetched ${allTracksData.length} tracks`);
    
    // Debug: Check how many tracks have release_ids
    const tracksWithReleaseId = allTracksData.filter(t => t.release_id).length;
    const tracksWithoutReleaseId = allTracksData.filter(t => !t.release_id).length;
    console.log(`Tracks with release_id: ${tracksWithReleaseId}, without release_id: ${tracksWithoutReleaseId}`);
    
    // Collect unique song_ids and release_ids
    const songIds = [...new Set(allTracksData.map(t => t.song_id).filter(Boolean))];
    const releaseIds = [...new Set(allTracksData.map(t => t.release_id).filter(Boolean))];
    
    console.log(`Fetching ${songIds.length} songs and ${releaseIds.length} records...`);
    
    // Fetch songs separately in chunks
    let allSongsData: any[] = [];
    const SONG_CHUNK_SIZE = 300;
    for (let i = 0; i < songIds.length; i += SONG_CHUNK_SIZE) {
      const chunk = songIds.slice(i, i + SONG_CHUNK_SIZE);
      const { data: songsChunk } = await supabase
        .from('songs')
        .select('id, title, artist, genres, styles')
        .in('id', chunk);
      if (songsChunk) allSongsData = allSongsData.concat(songsChunk);
    }
    
    // Fetch records separately in chunks
    let allRecordsData: any[] = [];
    const RECORD_CHUNK_SIZE = 300;
    for (let i = 0; i < releaseIds.length; i += RECORD_CHUNK_SIZE) {
      const chunk = releaseIds.slice(i, i + RECORD_CHUNK_SIZE);
      const { data: recordsChunk } = await supabase
        .from('records')
        .select('id, title, artist, year, format, cover_image_url, label, collection_type, import_source')
        .in('id', chunk);
      if (recordsChunk) allRecordsData = allRecordsData.concat(recordsChunk);
    }
    
    console.log(`Fetched ${allSongsData.length} songs and ${allRecordsData.length} records`);
    
    // Debug: Check collection types in records
    const recordCollectionTypes = allRecordsData.reduce((acc: any, r) => {
      acc[r.collection_type || 'null'] = (acc[r.collection_type || 'null'] || 0) + 1;
      return acc;
    }, {});
    console.log('Record collection types:', JSON.stringify(recordCollectionTypes));
    console.log('Sample digital record:', JSON.stringify(allRecordsData.find(r => r.collection_type === 'digital'), null, 2));
    console.log('Sample physical record:', JSON.stringify(allRecordsData.find(r => r.collection_type === 'physical'), null, 2));
    
    // Create lookup maps
    const songsMap = new Map(allSongsData.map(s => [s.id, s]));
    const recordsMap = new Map(allRecordsData.map(r => [r.id, r]));
    const userTracksMap = new Map(userTracksData.map(ut => [ut.track_id, ut]));
    
    // Merge all data
    let tracks = allTracksData.map((track: any) => {
      const userTrack = userTracksMap.get(track.id);
      const song = songsMap.get(track.song_id);
      const record = recordsMap.get(track.release_id);
      
      return {
        ...track,
        songs: song || null,
        records: record || null,
        user_track_id: userTrack?.id,
        personal_rating: userTrack?.personal_rating,
        tags: userTrack?.tags,
        source: userTrack?.source,
        play_count: userTrack?.play_count,
        last_played_at: userTrack?.last_played_at,
        created_at: userTrack?.created_at,
      };
    });
    
    console.log('Tracks after mapping:', tracks.length);
    console.log('Tracks with records:', tracks.filter((t: any) => t.records).length);
    console.log('Tracks without records:', tracks.filter((t: any) => !t.records).length);
    console.log('Digital tracks:', tracks.filter((t: any) => t.records?.collection_type === 'digital').length);
    console.log('Physical tracks:', tracks.filter((t: any) => t.records?.collection_type === 'physical').length);
    console.log('Sample track:', JSON.stringify(tracks[0], null, 2));
    
    // Apply filters
    const filteredTracks = applyFilters(tracks, filters);
    
    // Sort
    const sortedTracks = sortTracks(filteredTracks, filters.sortBy!, filters.sortOrder!);
    
    // Paginate
    const paginatedTracks = sortedTracks.slice(offset, offset + limit);
    
    console.log(`Returning ${paginatedTracks.length} tracks (page ${page}, total filtered: ${sortedTracks.length}, total: ${totalCount})`);
    
    return NextResponse.json({
      success: true,
      tracks: paginatedTracks,
      count: sortedTracks.length, // Total after filters
      totalCount: totalCount || 0, // Total before filters
      page,
      limit,
      hasMore: offset + paginatedTracks.length < sortedTracks.length,
      filters,
    });
    
  } catch (error) {
    console.error('❌ Error fetching tracks:', error);
    console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        error: 'Failed to fetch tracks',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : String(error)
      },
      { status: 500 }
    );
  }
}

// ============================================
// FILTER LOGIC
// ============================================

function applyFilters(tracks: any[], filters: TrackFilters): any[] {
  let filtered = [...tracks];
  
  // BPM Filter (with ±6% pitch adjustment)
  if (filters.targetBpm) {
    const minBpm = filters.targetBpm * 0.94; // -6%
    const maxBpm = filters.targetBpm * 1.06; // +6%
    filtered = filtered.filter(t => 
      t.bpm && t.bpm >= minBpm && t.bpm <= maxBpm
    );
  } else if (filters.bpmMin || filters.bpmMax) {
    filtered = filtered.filter(t => {
      if (!t.bpm) return false;
      if (filters.bpmMin && t.bpm < filters.bpmMin) return false;
      if (filters.bpmMax && t.bpm > filters.bpmMax) return false;
      return true;
    });
  }
  
  // Key Filter (harmonic compatibility)
  if (filters.keys && filters.keys.length > 0) {
    filtered = filtered.filter(t => 
      t.camelot_key && filters.keys!.includes(t.camelot_key)
    );
  }
  
  // Genre Filter
  if (filters.genres && filters.genres.length > 0) {
    filtered = filtered.filter(t => {
      const trackGenres = t.songs?.genres || [];
      return filters.genres!.some(g => 
        trackGenres.some((tg: string) => 
          tg.toLowerCase().includes(g.toLowerCase())
        )
      );
    });
  }
  
  // Search Filter (artist, title, album, label)
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(t => {
      const artist = (t.songs?.artist || '').toLowerCase();
      const title = (t.title || '').toLowerCase();
      const album = (t.records?.title || '').toLowerCase();
      const label = (t.records?.label || '').toLowerCase();
      
      return artist.includes(searchLower) ||
             title.includes(searchLower) ||
             album.includes(searchLower) ||
             label.includes(searchLower);
    });
  }
  
  // Decade Filter
  if (filters.decade) {
    filtered = filtered.filter(t => {
      const year = t.records?.year;
      if (!year) return false;
      
      if (filters.decade === '70s') return year >= 1970 && year < 1980;
      if (filters.decade === '80s') return year >= 1980 && year < 1990;
      if (filters.decade === '90s') return year >= 1990 && year < 2000;
      if (filters.decade === '2000s') return year >= 2000 && year < 2010;
      if (filters.decade === '2010s') return year >= 2010 && year < 2020;
      if (filters.decade === '2020s') return year >= 2020;
      
      return true;
    });
  }
  
  // Format Filter
  if (filters.format && filters.format !== 'all') {
    console.log(`🔍 Applying format filter: ${filters.format}`);
    console.log(`Before filter: ${filtered.length} tracks`);
    console.log(`Tracks with records: ${filtered.filter(t => t.records).length}`);
    console.log(`Tracks with collection_type='digital': ${filtered.filter(t => t.records?.collection_type === 'digital').length}`);
    console.log(`Tracks with collection_type='physical': ${filtered.filter(t => t.records?.collection_type === 'physical').length}`);
    
    filtered = filtered.filter(t => {
      const collectionType = t.records?.collection_type;
      const format = t.records?.format?.toLowerCase() || '';
      
      if (filters.format === 'vinyl') {
        return format.includes('vinyl');
      } else if (filters.format === 'digital') {
        return collectionType === 'digital';
      }
      
      return true;
    });
    
    console.log(`After filter: ${filtered.length} tracks`);
  }
  
  return filtered;
}

// ============================================
// SORTING LOGIC
// ============================================

function sortTracks(tracks: any[], sortBy: string, sortOrder: string): any[] {
  const sorted = [...tracks].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'bpm':
        comparison = (a.bpm || 0) - (b.bpm || 0);
        break;
      case 'key':
        comparison = (a.camelot_key || '').localeCompare(b.camelot_key || '');
        break;
      case 'artist':
        comparison = (a.songs?.artist || '').localeCompare(b.songs?.artist || '');
        break;
      case 'title':
        comparison = (a.title || '').localeCompare(b.title || '');
        break;
      case 'dateAdded':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      default:
        comparison = 0;
    }
    
    return sortOrder === 'desc' ? -comparison : comparison;
  });
  
  return sorted;
}
