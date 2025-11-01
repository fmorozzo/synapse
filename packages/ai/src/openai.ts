import OpenAI from 'openai';
import type { DiscogsRelease, Record } from '@synapse/shared';

/**
 * Create OpenAI client
 */
export function createOpenAIClient(apiKey: string) {
  return new OpenAI({ apiKey });
}

/**
 * Analyze an album and provide insights
 */
export async function analyzeAlbum(
  client: OpenAI,
  release: DiscogsRelease
): Promise<string> {
  const completion = await client.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `You are a knowledgeable music expert and collector. Provide insightful analysis about albums, including historical context, musical significance, and collecting tips.`,
      },
      {
        role: 'user',
        content: `Analyze this album:
Title: ${release.title}
Artist: ${release.artists.map(a => a.name).join(', ')}
Year: ${release.year || 'Unknown'}
Genres: ${release.genres?.join(', ') || 'Unknown'}
Styles: ${release.styles?.join(', ') || 'Unknown'}

Please provide:
1. Historical context and significance
2. Musical characteristics
3. Why this album is valuable to collectors
4. Interesting facts or trivia`,
      },
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  return completion.choices[0]?.message?.content || 'No analysis available.';
}

/**
 * Get personalized album recommendations
 */
export async function getRecommendations(
  client: OpenAI,
  userRecords: Record[],
  preferences?: string
): Promise<string> {
  // Get top genres and artists from user's collection
  const genreCount = new Map<string, number>();
  const artistCount = new Map<string, number>();

  userRecords.forEach((record) => {
    record.genres?.forEach((genre) => {
      genreCount.set(genre, (genreCount.get(genre) || 0) + 1);
    });
    artistCount.set(record.artist, (artistCount.get(record.artist) || 0) + 1);
  });

  const topGenres = Array.from(genreCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([genre]) => genre);

  const topArtists = Array.from(artistCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([artist]) => artist);

  const completion = await client.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `You are a music recommendation expert specializing in vinyl records and physical media. Provide thoughtful recommendations based on the user's collection.`,
      },
      {
        role: 'user',
        content: `Based on a collection of ${userRecords.length} records with these characteristics:

Top Genres: ${topGenres.join(', ')}
Top Artists: ${topArtists.join(', ')}
${preferences ? `Additional preferences: ${preferences}` : ''}

Please recommend 5 albums that would complement this collection. For each recommendation, include:
- Album title and artist
- Why it fits the collection
- What makes it special

Format as a numbered list.`,
      },
    ],
    temperature: 0.8,
    max_tokens: 800,
  });

  return completion.choices[0]?.message?.content || 'No recommendations available.';
}

/**
 * Generate collection insights
 */
export async function generateCollectionInsights(
  client: OpenAI,
  records: Record[]
): Promise<string> {
  // Calculate statistics
  const totalRecords = records.length;
  const genreDistribution = new Map<string, number>();
  const yearDistribution = new Map<number, number>();

  records.forEach((record) => {
    record.genres?.forEach((genre) => {
      genreDistribution.set(genre, (genreDistribution.get(genre) || 0) + 1);
    });
    if (record.year) {
      yearDistribution.set(record.year, (yearDistribution.get(record.year) || 0) + 1);
    }
  });

  const completion = await client.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `You are a music collection analyst. Provide interesting insights about music collections.`,
      },
      {
        role: 'user',
        content: `Analyze this music collection of ${totalRecords} records and provide insights:

Genre distribution: ${Array.from(genreDistribution.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10)
          .map(([genre, count]) => `${genre} (${count})`)
          .join(', ')}

Provide:
1. Overall collection personality
2. Interesting patterns or trends
3. Suggestions for diversification
4. Notable gaps or opportunities`,
      },
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  return completion.choices[0]?.message?.content || 'No insights available.';
}

/**
 * Smart search assistant
 */
export async function smartSearch(
  client: OpenAI,
  naturalQuery: string
): Promise<{ query: string; filters: Record<string, any> }> {
  const completion = await client.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `You are a search query parser for a music database. Convert natural language queries into structured search parameters. Return JSON with 'query' (search terms) and 'filters' (object with genre, year_min, year_max, format).`,
      },
      {
        role: 'user',
        content: `Parse this search query: "${naturalQuery}"`,
      },
    ],
    temperature: 0.3,
    response_format: { type: 'json_object' },
  });

  const result = JSON.parse(completion.choices[0]?.message?.content || '{}');
  return {
    query: result.query || naturalQuery,
    filters: result.filters || {},
  };
}

