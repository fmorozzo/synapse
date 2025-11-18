/**
 * Spotify Cover Art Helper
 * 
 * Fetches album cover art from Spotify for releases without images
 */

import { getSpotifyClient } from './client';

/**
 * Search for album cover art on Spotify
 * @param artist - Artist name
 * @param album - Album name
 * @returns Cover art URL or null
 */
export async function fetchCoverArt(artist: string, album: string): Promise<string | null> {
  try {
    const client = getSpotifyClient();
    
    // Search for album
    const token = await (client as any).getAccessToken();
    const query = `artist:${artist} album:${album}`;
    
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=album&limit=1`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
    
    if (!response.ok) {
      console.error('Spotify search failed:', response.statusText);
      return null;
    }
    
    const data = await response.json();
    const albums = data.albums?.items || [];
    
    if (albums.length === 0) {
      return null;
    }
    
    // Get the largest available image
    const images = albums[0].images || [];
    if (images.length === 0) {
      return null;
    }
    
    // Images are sorted by size (largest first)
    return images[0].url;
    
  } catch (error) {
    console.error('Error fetching cover art:', error);
    return null;
  }
}

/**
 * Batch fetch cover art for multiple records
 * @param records - Array of records missing cover art
 * @returns Map of record ID to cover art URL
 */
export async function batchFetchCoverArt(
  records: Array<{ id: string; artist: string; title: string }>
): Promise<Map<string, string>> {
  const coverArtMap = new Map<string, string>();
  
  // Process in batches to respect rate limits
  const BATCH_SIZE = 5;
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    
    await Promise.all(
      batch.map(async (record) => {
        const coverUrl = await fetchCoverArt(record.artist, record.title);
        if (coverUrl) {
          coverArtMap.set(record.id, coverUrl);
        }
      })
    );
    
    // Rate limiting: wait 200ms between batches
    if (i + BATCH_SIZE < records.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  return coverArtMap;
}

