/**
 * API client for making requests to the backend
 */

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  private async fetch(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || 'API request failed');
    }

    return response.json();
  }

  // Discogs
  async searchDiscogs(query: string, type?: string, page = 1) {
    const params = new URLSearchParams({ q: query, page: page.toString() });
    if (type) params.append('type', type);
    return this.fetch(`/discogs/search?${params}`);
  }

  async getRelease(id: number) {
    return this.fetch(`/discogs/release/${id}`);
  }

  // Records
  async getRecords(searchQuery?: string) {
    const params = searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : '';
    return this.fetch(`/records${params}`);
  }

  async getRecord(id: string) {
    return this.fetch(`/records/${id}`);
  }

  async createRecord(data: any) {
    return this.fetch('/records', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateRecord(id: string, data: any) {
    return this.fetch(`/records/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteRecord(id: string) {
    return this.fetch(`/records/${id}`, {
      method: 'DELETE',
    });
  }

  // AI
  async analyzeAlbum(release: any) {
    return this.fetch('/ai/analyze', {
      method: 'POST',
      body: JSON.stringify({ release }),
    });
  }

  async getRecommendations(preferences?: string) {
    return this.fetch('/ai/recommend', {
      method: 'POST',
      body: JSON.stringify({ preferences }),
    });
  }
}

// Singleton instance
export const apiClient = new ApiClient();

