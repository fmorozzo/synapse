import type { DiscogsRelease, DiscogsSearchResult } from '@synapse/shared';

const DISCOGS_API_BASE = 'https://api.discogs.com';

export class DiscogsClient {
  private apiKey: string;
  private apiSecret: string;

  constructor(apiKey: string, apiSecret: string) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
  }

  private async fetch(endpoint: string, params: Record<string, string> = {}) {
    const url = new URL(`${DISCOGS_API_BASE}${endpoint}`);
    
    // Add authentication
    url.searchParams.append('key', this.apiKey);
    url.searchParams.append('secret', this.apiSecret);
    
    // Add other params
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'Synapse/1.0',
      },
    });

    if (!response.ok) {
      throw new Error(`Discogs API error: ${response.statusText}`);
    }

    return response.json();
  }

  async search(query: string, type?: string, page = 1, perPage = 20): Promise<{
    results: DiscogsSearchResult[];
    pagination: {
      page: number;
      pages: number;
      per_page: number;
      items: number;
    };
  }> {
    const params: Record<string, string> = {
      q: query,
      page: page.toString(),
      per_page: perPage.toString(),
    };

    if (type) {
      params.type = type;
    }

    return this.fetch('/database/search', params);
  }

  async getRelease(releaseId: number): Promise<DiscogsRelease> {
    return this.fetch(`/releases/${releaseId}`);
  }

  async getMaster(masterId: number) {
    return this.fetch(`/masters/${masterId}`);
  }

  async getArtist(artistId: number) {
    return this.fetch(`/artists/${artistId}`);
  }

  async getArtistReleases(artistId: number, page = 1, perPage = 50) {
    return this.fetch(`/artists/${artistId}/releases`, {
      page: page.toString(),
      per_page: perPage.toString(),
    });
  }
}

// Singleton instance
let discogsClient: DiscogsClient | null = null;

export function getDiscogsClient(): DiscogsClient {
  if (!discogsClient) {
    const apiKey = process.env.DISCOGS_API_KEY;
    const apiSecret = process.env.DISCOGS_API_SECRET;

    if (!apiKey || !apiSecret) {
      throw new Error('Discogs API credentials not configured');
    }

    discogsClient = new DiscogsClient(apiKey, apiSecret);
  }

  return discogsClient;
}

