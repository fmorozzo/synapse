/**
 * Spotify API Client
 * 
 * Provides access to Spotify Web API for enriching track metadata:
 * - Search for tracks
 * - Get audio features (BPM, key, energy, etc.)
 * - Fallback when Rekordbox data is not available
 */

// ============================================
// TYPES
// ============================================

export interface SpotifyTrackSearchResult {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    release_date: string;
  };
  duration_ms: number;
  isrc?: string;
  popularity: number;
}

export interface SpotifyAudioFeatures {
  id: string;
  tempo: number; // BPM
  key: number; // 0-11 (C, C#, D, etc.)
  mode: number; // 0 = minor, 1 = major
  time_signature: number;
  energy: number; // 0-1
  danceability: number; // 0-1
  valence: number; // 0-1 (positiveness)
  acousticness: number; // 0-1
  instrumentalness: number; // 0-1
  liveness: number; // 0-1
  loudness: number; // dB
  speechiness: number; // 0-1
}

export interface EnrichedTrackData {
  bpm: number;
  key: string; // Standard notation (C, C#m, etc.)
  camelotKey: string; // Camelot notation (1A, 8B, etc.)
  energy: number; // 1-10
  danceability: number; // 0-100
  spotifyTrackId: string;
  isrc?: string;
}

// ============================================
// KEY CONVERSION TABLES
// ============================================

const SPOTIFY_KEY_TO_STANDARD: Record<number, string[]> = {
  0: ['C', 'Cm'],
  1: ['C#', 'C#m'],
  2: ['D', 'Dm'],
  3: ['Eb', 'Ebm'],
  4: ['E', 'Em'],
  5: ['F', 'Fm'],
  6: ['F#', 'F#m'],
  7: ['G', 'Gm'],
  8: ['Ab', 'G#m'],
  9: ['A', 'Am'],
  10: ['Bb', 'Bbm'],
  11: ['B', 'Bm'],
};

const SPOTIFY_TO_CAMELOT: Record<string, string> = {
  // Major keys
  'C': '8B', 'Db': '3B', 'D': '10B', 'Eb': '5B', 'E': '12B', 'F': '7B',
  'F#': '2B', 'G': '9B', 'Ab': '4B', 'A': '11B', 'Bb': '6B', 'B': '1B',
  'C#': '3B',
  
  // Minor keys
  'Cm': '5A', 'C#m': '12A', 'Dm': '7A', 'Ebm': '2A', 'Em': '9A', 'Fm': '4A',
  'F#m': '11A', 'Gm': '6A', 'G#m': '1A', 'Am': '8A', 'Bbm': '3A', 'Bm': '10A',
};

// ============================================
// SPOTIFY CLIENT CLASS
// ============================================

class SpotifyClient {
  private clientId: string;
  private clientSecret: string;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;
  
  constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID || '';
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET || '';
    
    if (!this.clientId || !this.clientSecret) {
      console.warn('Spotify credentials not configured. Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET environment variables.');
    }
  }
  
  /**
   * Get access token using Client Credentials flow
   */
  private async getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (this.accessToken && Date.now() < this.tokenExpiry) {
      return this.accessToken;
    }
    
    const credentials = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get Spotify access token: ${response.statusText}`);
    }
    
    const data = await response.json();
    this.accessToken = data.access_token;
    this.tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000; // Refresh 1 minute before expiry
    
    return this.accessToken;
  }
  
  /**
   * Search for a track
   */
  async searchTrack(
    artist: string,
    title: string,
    options?: { album?: string; durationMs?: number; limit?: number }
  ): Promise<SpotifyTrackSearchResult[]> {
    const token = await this.getAccessToken();
    
    // Build search query
    let query = `artist:${artist} track:${title}`;
    if (options?.album) {
      query += ` album:${options.album}`;
    }
    
    const params = new URLSearchParams({
      q: query,
      type: 'track',
      limit: String(options?.limit || 5),
    });
    
    const response = await fetch(`https://api.spotify.com/v1/search?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Spotify search failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    const tracks: SpotifyTrackSearchResult[] = data.tracks.items;
    
    // If duration provided, sort by closest match
    if (options?.durationMs && tracks.length > 0) {
      tracks.sort((a, b) => {
        const diffA = Math.abs(a.duration_ms - options.durationMs!);
        const diffB = Math.abs(b.duration_ms - options.durationMs!);
        return diffA - diffB;
      });
    }
    
    return tracks;
  }
  
  /**
   * Get best matching track
   */
  async findBestMatch(
    artist: string,
    title: string,
    options?: { album?: string; durationMs?: number }
  ): Promise<SpotifyTrackSearchResult | null> {
    const tracks = await this.searchTrack(artist, title, { ...options, limit: 5 });
    
    if (tracks.length === 0) {
      return null;
    }
    
    // Return first result (most relevant or closest duration match)
    return tracks[0];
  }
  
  /**
   * Get audio features for a track
   */
  async getAudioFeatures(trackId: string): Promise<SpotifyAudioFeatures> {
    const token = await this.getAccessToken();
    
    const response = await fetch(`https://api.spotify.com/v1/audio-features/${trackId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get audio features: ${response.statusText}`);
    }
    
    return await response.json();
  }
  
  /**
   * Get audio features for multiple tracks (batch)
   */
  async getAudioFeaturesBatch(trackIds: string[]): Promise<SpotifyAudioFeatures[]> {
    const token = await this.getAccessToken();
    
    // Spotify allows up to 100 IDs per request
    const chunks: string[][] = [];
    for (let i = 0; i < trackIds.length; i += 100) {
      chunks.push(trackIds.slice(i, i + 100));
    }
    
    const results: SpotifyAudioFeatures[] = [];
    
    for (const chunk of chunks) {
      const params = new URLSearchParams({ ids: chunk.join(',') });
      
      const response = await fetch(`https://api.spotify.com/v1/audio-features?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get audio features: ${response.statusText}`);
      }
      
      const data = await response.json();
      results.push(...data.audio_features.filter(Boolean)); // Filter out null values
    }
    
    return results;
  }
  
  /**
   * Search and enrich track with audio features
   */
  async enrichTrack(
    artist: string,
    title: string,
    options?: { album?: string; durationMs?: number }
  ): Promise<EnrichedTrackData | null> {
    try {
      // Find matching track
      const track = await this.findBestMatch(artist, title, options);
      
      if (!track) {
        return null;
      }
      
      // Get audio features
      const features = await this.getAudioFeatures(track.id);
      
      // Convert to enriched data
      return this.convertToEnrichedData(features, track.id, track.external_ids?.isrc);
      
    } catch (error) {
      console.error('Error enriching track:', error);
      return null;
    }
  }
  
  /**
   * Convert Spotify audio features to our format
   */
  private convertToEnrichedData(
    features: SpotifyAudioFeatures,
    trackId: string,
    isrc?: string
  ): EnrichedTrackData {
    const key = this.convertSpotifyKey(features.key, features.mode);
    const camelotKey = SPOTIFY_TO_CAMELOT[key] || '';
    
    return {
      bpm: Math.round(features.tempo * 100) / 100,
      key,
      camelotKey,
      energy: Math.round(features.energy * 10), // Convert 0-1 to 1-10
      danceability: Math.round(features.danceability * 100),
      spotifyTrackId: trackId,
      isrc,
    };
  }
  
  /**
   * Convert Spotify key notation to standard (C, C#m, etc.)
   */
  private convertSpotifyKey(keyNumber: number, mode: number): string {
    const keys = SPOTIFY_KEY_TO_STANDARD[keyNumber];
    if (!keys) return 'Unknown';
    
    // mode: 0 = minor, 1 = major
    return keys[mode];
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

let spotifyClient: SpotifyClient | null = null;

export function getSpotifyClient(): SpotifyClient {
  if (!spotifyClient) {
    spotifyClient = new SpotifyClient();
  }
  return spotifyClient;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Check if Spotify integration is configured
 */
export function isSpotifyConfigured(): boolean {
  return !!(process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET);
}

/**
 * Enrich a single track (convenience function)
 */
export async function enrichTrackWithSpotify(
  artist: string,
  title: string,
  options?: { album?: string; durationMs?: number }
): Promise<EnrichedTrackData | null> {
  if (!isSpotifyConfigured()) {
    console.warn('Spotify not configured, skipping enrichment');
    return null;
  }
  
  const client = getSpotifyClient();
  return await client.enrichTrack(artist, title, options);
}

/**
 * Search for track on Spotify (convenience function)
 */
export async function searchSpotify(
  artist: string,
  title: string,
  options?: { album?: string; durationMs?: number; limit?: number }
): Promise<SpotifyTrackSearchResult[]> {
  if (!isSpotifyConfigured()) {
    return [];
  }
  
  const client = getSpotifyClient();
  return await client.searchTrack(artist, title, options);
}

