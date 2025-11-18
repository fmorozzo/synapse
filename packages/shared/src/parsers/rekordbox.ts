/**
 * Rekordbox XML Parser
 * 
 * Parses Rekordbox XML files and extracts track metadata including:
 * - BPM, key, duration
 * - Cue points, hot cues, memory cues
 * - Ratings, comments, colors
 * - Playlists
 */

import { parseStringPromise } from 'xml2js';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface RekordboxTrack {
  trackId: string;
  name: string;
  artist: string;
  album?: string;
  genre?: string;
  
  // Technical metadata
  bpm: number;
  key?: string; // Rekordbox key notation (e.g., "5d" = Dm in Camelot)
  camelotKey?: string; // Converted to Camelot notation
  duration: number; // in seconds
  
  // File info
  fileType: string; // "MP3", "FLAC", "WAV", "AIFF", "AAC"
  filePath: string;
  bitrate?: number;
  sampleRate?: number;
  fileSize?: number;
  
  // User data
  rating?: number; // 0-5 stars
  color?: string; // Track color
  comment?: string;
  
  // Playback statistics
  playCount: number;
  lastPlayed?: Date;
  dateAdded?: Date;
  
  // DJ data
  cuePoints: CuePoint[];
  hotCues: HotCue[];
  memoryCues: MemoryCue[];
  
  // Metadata
  year?: number;
  label?: string;
  remixer?: string;
}

export interface CuePoint {
  name: string;
  type: number; // 0 = Cue, 1 = Fade In, 2 = Fade Out, 3 = Load, 4 = Loop
  position: number; // Position in seconds
  color?: string;
}

export interface HotCue {
  number: number; // 1-8 (or more on newer systems)
  name: string;
  position: number; // Position in seconds
  color?: string;
}

export interface MemoryCue {
  name: string;
  position: number;
  color?: string;
}

export interface RekordboxPlaylist {
  name: string;
  type: 'playlist' | 'folder';
  tracks: string[]; // Array of track IDs
  children?: RekordboxPlaylist[]; // For folders
}

export interface RekordboxCollection {
  tracks: RekordboxTrack[];
  playlists: RekordboxPlaylist[];
  totalTracks: number;
  exportDate?: Date;
  version?: string;
}

// ============================================
// CAMELOT WHEEL CONVERSION
// ============================================

/**
 * Rekordbox uses a notation like "5d" where:
 * - Number (1-12) represents the key
 * - Letter (d/m) represents major/minor
 * 
 * Camelot wheel uses:
 * - Numbers 1-12 with A (minor) or B (major)
 */
const REKORDBOX_TO_CAMELOT: Record<string, string> = {
  // Major keys (d = dur = major)
  '8d': '8B', '3d': '3B', '10d': '10B', '5d': '5B', '12d': '12B',
  '7d': '7B', '2d': '2B', '9d': '9B', '4d': '4B', '11d': '11B',
  '6d': '6B', '1d': '1B',
  
  // Minor keys (m = minor)
  '5m': '5A', '12m': '12A', '7m': '7A', '2m': '2A', '9m': '9A',
  '4m': '4A', '11m': '11A', '6m': '6A', '1m': '1A', '8m': '8A',
  '3m': '3A', '10m': '10A',
};

const REKORDBOX_TO_STANDARD_KEY: Record<string, string> = {
  // Major keys
  '1d': 'C', '2d': 'Db', '3d': 'D', '4d': 'Eb', '5d': 'E', '6d': 'F',
  '7d': 'F#', '8d': 'G', '9d': 'Ab', '10d': 'A', '11d': 'Bb', '12d': 'B',
  
  // Minor keys
  '1m': 'Cm', '2m': 'C#m', '3m': 'Dm', '4m': 'Ebm', '5m': 'Em', '6m': 'Fm',
  '7m': 'F#m', '8m': 'Gm', '9m': 'G#m', '10m': 'Am', '11m': 'Bbm', '12m': 'Bm',
};

function convertRekordboxKeyToCamelot(rbKey: string): string | undefined {
  return REKORDBOX_TO_CAMELOT[rbKey.toLowerCase()];
}

function convertRekordboxKeyToStandard(rbKey: string): string | undefined {
  return REKORDBOX_TO_STANDARD_KEY[rbKey.toLowerCase()];
}

// ============================================
// PARSER FUNCTIONS
// ============================================

/**
 * Parse Rekordbox XML file from string content
 */
export async function parseRekordboxXML(xmlContent: string): Promise<RekordboxCollection> {
  try {
    const result = await parseStringPromise(xmlContent, {
      explicitArray: false,
      mergeAttrs: true,
      normalizeTags: true,
      trim: true,
    });
    
    console.log('Parsed XML result keys:', Object.keys(result));
    
    const djPlaylists = result.dj_playlists;
    
    if (!djPlaylists || !djPlaylists.product) {
      console.error('DJ_PLAYLISTS structure:', djPlaylists);
      throw new Error('Invalid Rekordbox XML format');
    }
    
    console.log('DJ_PLAYLISTS.product keys:', Object.keys(djPlaylists.product));
    console.log('DJ_PLAYLISTS.product:', JSON.stringify(djPlaylists.product, null, 2).substring(0, 500));
    
    const collection = djPlaylists.product.collection || djPlaylists.collection;
    const playlists = djPlaylists.product.playlists || djPlaylists.playlists;
    
    console.log('Collection:', collection ? `Found with ${collection.entries || 0} entries` : 'Not found');
    console.log('Collection keys:', collection ? Object.keys(collection) : 'N/A');
    console.log('Collection.track type:', collection?.track ? (Array.isArray(collection.track) ? 'Array' : 'Object') : 'undefined');
    console.log('Collection.track length:', Array.isArray(collection?.track) ? collection.track.length : 'not array');
    
    // Parse tracks
    const tracks = parseTracksFromCollection(collection);
    
    console.log('Parsed tracks count:', tracks.length);
    
    // Parse playlists
    const parsedPlaylists = parsePlaylistsFromNode(playlists);
    
    return {
      tracks,
      playlists: parsedPlaylists,
      totalTracks: tracks.length,
      version: djPlaylists.version,
    };
  } catch (error) {
    console.error('Parse error:', error);
    throw new Error(`Failed to parse Rekordbox XML: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Parse tracks from collection node
 */
function parseTracksFromCollection(collection: any): RekordboxTrack[] {
  if (!collection || !collection.track) {
    return [];
  }
  
  // Handle both single track and array of tracks
  const trackNodes = Array.isArray(collection.track) ? collection.track : [collection.track];
  
  return trackNodes.map(parseTrack).filter((track): track is RekordboxTrack => track !== null);
}

/**
 * Parse a single track node
 */
function parseTrack(trackNode: any): RekordboxTrack | null {
  try {
    // Handle both lowercase (normalized) and capitalized field names
    const trackId = trackNode.trackid || trackNode.TrackID;
    const name = trackNode.name || trackNode.Name;
    const artist = trackNode.artist || trackNode.Artist;
    
    if (!trackId || !name || !artist) {
      console.log('Skipping track - missing required fields:', { trackId, name, artist });
      return null; // Skip invalid tracks
    }
    
    // Parse BPM (can be "128.00" or "128")
    const bpm = parseFloat(trackNode.averagebpm || trackNode.AverageBpm || trackNode.tempo || trackNode.Tempo || '0');
    
    // Parse key (Rekordbox notation like "5d" or "5m")
    const rbKey = (trackNode.tonality || trackNode.Tonality)?.toLowerCase();
    const key = rbKey ? convertRekordboxKeyToStandard(rbKey) : undefined;
    const camelotKey = rbKey ? convertRekordboxKeyToCamelot(rbKey) : undefined;
    
    // Parse duration (in seconds)
    const duration = parseInt(trackNode.totaltime || trackNode.TotalTime || '0', 10);
    
    // Parse cue points
    const cuePoints = parsePositionMarks(trackNode.position_mark || trackNode.POSITION_MARK, 'cue');
    const hotCues = parsePositionMarks(trackNode.position_mark || trackNode.POSITION_MARK, 'hotcue');
    const memoryCues = parsePositionMarks(trackNode.position_mark || trackNode.POSITION_MARK, 'memory');
    
    // File info
    const location = trackNode.location || trackNode.Location || '';
    const fileType = (trackNode.kind || trackNode.Kind)?.replace(' File', '') || 'Unknown';
    
    // Parse dates
    const lastPlayed = (trackNode.lastplayed || trackNode.LastPlayed) ? new Date(trackNode.lastplayed || trackNode.LastPlayed) : undefined;
    const dateAdded = (trackNode.dateadded || trackNode.DateAdded) ? new Date(trackNode.dateadded || trackNode.DateAdded) : undefined;
    
    return {
      trackId,
      name,
      artist,
      album: trackNode.album || trackNode.Album,
      genre: trackNode.genre || trackNode.Genre,
      
      bpm,
      key,
      camelotKey,
      duration,
      
      fileType,
      filePath: decodeURIComponent(location.replace('file://localhost/', '')),
      bitrate: parseInt(trackNode.bitrate || trackNode.BitRate || '0', 10) || undefined,
      sampleRate: parseInt(trackNode.samplerate || trackNode.SampleRate || '0', 10) || undefined,
      fileSize: parseInt(trackNode.size || trackNode.Size || '0', 10) || undefined,
      
      rating: parseInt(trackNode.rating || trackNode.Rating || '0', 10) || undefined,
      color: trackNode.colour || trackNode.color || trackNode.Colour || trackNode.Color,
      comment: trackNode.comments || trackNode.Comments,
      
      playCount: parseInt(trackNode.playcount || trackNode.PlayCount || '0', 10),
      lastPlayed,
      dateAdded,
      
      cuePoints,
      hotCues,
      memoryCues,
      
      year: parseInt(trackNode.year || trackNode.Year || '0', 10) || undefined,
      label: trackNode.label || trackNode.Label,
      remixer: trackNode.remixer || trackNode.Remixer,
    };
  } catch (error) {
    console.error('Error parsing track:', error);
    return null;
  }
}

/**
 * Parse position marks (cue points, hot cues, memory cues)
 */
function parsePositionMarks(positionMarks: any, type: 'cue' | 'hotcue' | 'memory'): any[] {
  if (!positionMarks) {
    return [];
  }
  
  const marks = Array.isArray(positionMarks) ? positionMarks : [positionMarks];
  
  return marks
    .filter(mark => {
      const markType = parseInt(mark.type || mark.Type || '0', 10);
      const num = mark.num || mark.Num;
      
      if (type === 'hotcue') {
        return markType === 0 && num !== undefined && num !== '-1';
      } else if (type === 'cue') {
        return markType === 0 && (num === undefined || num === '-1');
      } else {
        return markType === 4; // Memory cue
      }
    })
    .map(mark => {
      const position = parseFloat(mark.start || mark.Start || '0');
      const name = mark.name || mark.Name;
      const num = mark.num || mark.Num;
      const markType = parseInt(mark.type || mark.Type || '0', 10);
      const red = mark.red || mark.Red;
      const green = mark.green || mark.Green;
      const blue = mark.blue || mark.Blue;
      
      if (type === 'hotcue') {
        return {
          number: parseInt(num || '0', 10),
          name: name || `Hot Cue ${num}`,
          position,
          color: red && green && blue 
            ? rgbToHex(parseInt(red), parseInt(green), parseInt(blue))
            : undefined,
        };
      } else {
        return {
          name: name || 'Cue Point',
          position,
          type: markType,
          color: red && green && blue 
            ? rgbToHex(parseInt(red), parseInt(green), parseInt(blue))
            : undefined,
        };
      }
    });
}

/**
 * Parse playlists from playlists node
 */
function parsePlaylistsFromNode(playlistsNode: any): RekordboxPlaylist[] {
  if (!playlistsNode || !playlistsNode.node) {
    return [];
  }
  
  const rootNode = Array.isArray(playlistsNode.node) ? playlistsNode.node[0] : playlistsNode.node;
  
  return parsePlaylistNode(rootNode);
}

/**
 * Recursively parse playlist nodes
 */
function parsePlaylistNode(node: any): RekordboxPlaylist[] {
  if (!node) {
    return [];
  }
  
  const playlists: RekordboxPlaylist[] = [];
  
  // Check if this node has child nodes (folders or playlists)
  if (node.node) {
    const children = Array.isArray(node.node) ? node.node : [node.node];
    
    for (const child of children) {
      const type = child.type === '0' ? 'folder' : 'playlist';
      const name = child.name;
      
      if (type === 'folder') {
        // Recursively parse folder
        const childPlaylists = parsePlaylistNode(child);
        playlists.push({
          name,
          type,
          tracks: [],
          children: childPlaylists,
        });
      } else {
        // Parse playlist tracks
        const tracks = parsePlaylistTracks(child);
        playlists.push({
          name,
          type,
          tracks,
        });
      }
    }
  }
  
  return playlists;
}

/**
 * Parse tracks from a playlist node
 */
function parsePlaylistTracks(playlistNode: any): string[] {
  if (!playlistNode.track) {
    return [];
  }
  
  const tracks = Array.isArray(playlistNode.track) ? playlistNode.track : [playlistNode.track];
  
  return tracks.map(track => track.key).filter(Boolean);
}

/**
 * Convert RGB to hex color
 */
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get track statistics from collection
 */
export function getCollectionStats(collection: RekordboxCollection) {
  const totalDuration = collection.tracks.reduce((sum, track) => sum + track.duration, 0);
  const tracksWithBpm = collection.tracks.filter(track => track.bpm > 0).length;
  const tracksWithKey = collection.tracks.filter(track => track.key).length;
  const avgBpm = collection.tracks.reduce((sum, track) => sum + track.bpm, 0) / tracksWithBpm || 0;
  
  return {
    totalTracks: collection.totalTracks,
    totalDuration,
    totalDurationFormatted: formatDuration(totalDuration),
    tracksWithBpm,
    tracksWithKey,
    avgBpm: Math.round(avgBpm * 100) / 100,
    totalPlaylists: collection.playlists.length,
  };
}

/**
 * Format duration in seconds to HH:MM:SS
 */
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Find duplicate tracks in collection (same artist + title)
 */
export function findRekordboxDuplicates(collection: RekordboxCollection): Map<string, RekordboxTrack[]> {
  const trackMap = new Map<string, RekordboxTrack[]>();
  
  for (const track of collection.tracks) {
    const key = `${track.artist.toLowerCase()}::${track.name.toLowerCase()}`;
    const existing = trackMap.get(key) || [];
    existing.push(track);
    trackMap.set(key, existing);
  }
  
  // Only return entries with duplicates
  const duplicates = new Map<string, RekordboxTrack[]>();
  for (const [key, tracks] of trackMap.entries()) {
    if (tracks.length > 1) {
      duplicates.set(key, tracks);
    }
  }
  
  return duplicates;
}

/**
 * Group tracks by genre
 */
export function groupByGenre(collection: RekordboxCollection): Map<string, RekordboxTrack[]> {
  const genreMap = new Map<string, RekordboxTrack[]>();
  
  for (const track of collection.tracks) {
    const genre = track.genre || 'Unknown';
    const existing = genreMap.get(genre) || [];
    existing.push(track);
    genreMap.set(genre, existing);
  }
  
  return genreMap;
}

/**
 * Group tracks by BPM range (useful for DJ selection)
 */
export function groupByBpmRange(collection: RekordboxCollection, rangeSize: number = 10): Map<string, RekordboxTrack[]> {
  const bpmMap = new Map<string, RekordboxTrack[]>();
  
  for (const track of collection.tracks) {
    if (track.bpm <= 0) continue;
    
    const rangeLow = Math.floor(track.bpm / rangeSize) * rangeSize;
    const rangeHigh = rangeLow + rangeSize;
    const key = `${rangeLow}-${rangeHigh} BPM`;
    
    const existing = bpmMap.get(key) || [];
    existing.push(track);
    bpmMap.set(key, existing);
  }
  
  return bpmMap;
}

