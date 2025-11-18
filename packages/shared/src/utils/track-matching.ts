/**
 * Track Matching Utilities
 * 
 * Provides fuzzy matching algorithms to match tracks across different sources:
 * - Physical releases (Discogs) vs Digital files (Rekordbox)
 * - Different naming conventions
 * - Different versions/remixes
 */

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface TrackIdentity {
  title: string;
  artist: string;
  duration?: number; // in milliseconds
  isrc?: string; // International Standard Recording Code
  album?: string;
  year?: number;
}

export interface MatchResult {
  confidence: number; // 0-100
  method: 'isrc' | 'exact' | 'fuzzy_text' | 'fuzzy_duration' | 'manual';
  reason?: string;
}

export interface TrackMatch {
  sourceTrack: TrackIdentity;
  matchedTrack: TrackIdentity;
  result: MatchResult;
}

// ============================================
// NORMALIZATION FUNCTIONS
// ============================================

/**
 * Normalize a string for comparison
 * - Lowercase
 * - Remove punctuation
 * - Remove common articles (a, an, the)
 * - Trim whitespace
 * - Remove common suffixes/prefixes
 */
export function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .replace(/\s*\([^)]*\)\s*/g, '') // Remove parenthetical content
    .replace(/\s*\[[^\]]*\]\s*/g, '') // Remove bracketed content
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\bthe\b|\ban\b|\ba\b/gi, '') // Remove articles
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Normalize artist name
 * - Handle "feat.", "ft.", "featuring"
 * - Remove "& " and "and"
 * - Take only the main artist
 */
export function normalizeArtist(artist: string): string {
  return artist
    .split(/feat\.|ft\.|featuring|,|&|and/i)[0] // Take only main artist
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Normalize title
 * - Remove version info (Original Mix, Extended, Remaster, etc.)
 * - Remove remix info
 */
export function normalizeTitle(title: string): string {
  const versionPatterns = [
    /\s*-?\s*(original\s+mix)/gi,
    /\s*-?\s*(extended\s+mix)/gi,
    /\s*-?\s*(radio\s+edit)/gi,
    /\s*-?\s*(club\s+mix)/gi,
    /\s*-?\s*(dub\s+mix)/gi,
    /\s*-?\s*\d{4}\s+remaster/gi,
    /\s*-?\s*remaster(ed)?/gi,
    /\s*-?\s*\d+\s+edit/gi,
    /\s*-?\s*(.*?)\s+remix/gi,
  ];
  
  let normalized = title;
  for (const pattern of versionPatterns) {
    normalized = normalized.replace(pattern, '');
  }
  
  return normalizeString(normalized);
}

// ============================================
// STRING SIMILARITY ALGORITHMS
// ============================================

/**
 * Calculate Levenshtein distance between two strings
 * Returns the minimum number of edits needed to transform one string into another
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  
  // Create a matrix
  const matrix: number[][] = Array(len1 + 1)
    .fill(null)
    .map(() => Array(len2 + 1).fill(0));
  
  // Initialize first column and row
  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;
  
  // Fill the matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  
  return matrix[len1][len2];
}

/**
 * Calculate similarity ratio between two strings (0-1)
 * Based on Levenshtein distance
 */
export function similarityRatio(str1: string, str2: string): number {
  const distance = levenshteinDistance(str1, str2);
  const maxLen = Math.max(str1.length, str2.length);
  
  if (maxLen === 0) return 1.0;
  
  return 1 - distance / maxLen;
}

/**
 * Jaro-Winkler similarity (better for short strings and typos)
 * Returns a value between 0 and 1
 */
export function jaroWinklerSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1.0;
  
  const len1 = str1.length;
  const len2 = str2.length;
  
  if (len1 === 0 || len2 === 0) return 0.0;
  
  const matchWindow = Math.max(len1, len2) / 2 - 1;
  const str1Matches = new Array(len1).fill(false);
  const str2Matches = new Array(len2).fill(false);
  
  let matches = 0;
  let transpositions = 0;
  
  // Find matches
  for (let i = 0; i < len1; i++) {
    const start = Math.max(0, i - matchWindow);
    const end = Math.min(i + matchWindow + 1, len2);
    
    for (let j = start; j < end; j++) {
      if (str2Matches[j] || str1[i] !== str2[j]) continue;
      str1Matches[i] = true;
      str2Matches[j] = true;
      matches++;
      break;
    }
  }
  
  if (matches === 0) return 0.0;
  
  // Find transpositions
  let k = 0;
  for (let i = 0; i < len1; i++) {
    if (!str1Matches[i]) continue;
    while (!str2Matches[k]) k++;
    if (str1[i] !== str2[k]) transpositions++;
    k++;
  }
  
  // Calculate Jaro similarity
  const jaro = (matches / len1 + matches / len2 + (matches - transpositions / 2) / matches) / 3;
  
  // Calculate Jaro-Winkler (with prefix bonus)
  let prefix = 0;
  for (let i = 0; i < Math.min(4, Math.min(len1, len2)); i++) {
    if (str1[i] !== str2[i]) break;
    prefix++;
  }
  
  return jaro + prefix * 0.1 * (1 - jaro);
}

// ============================================
// TRACK MATCHING FUNCTIONS
// ============================================

/**
 * Match two tracks and return confidence score
 */
export function matchTracks(track1: TrackIdentity, track2: TrackIdentity): MatchResult {
  // Level 1: ISRC match (perfect match)
  if (track1.isrc && track2.isrc && track1.isrc === track2.isrc) {
    return {
      confidence: 100,
      method: 'isrc',
      reason: 'ISRC codes match',
    };
  }
  
  // Level 2: Exact normalized match
  const norm1Title = normalizeTitle(track1.title);
  const norm1Artist = normalizeArtist(track1.artist);
  const norm2Title = normalizeTitle(track2.title);
  const norm2Artist = normalizeArtist(track2.artist);
  
  if (norm1Title === norm2Title && norm1Artist === norm2Artist) {
    return {
      confidence: 95,
      method: 'exact',
      reason: 'Exact match after normalization',
    };
  }
  
  // Level 3: Fuzzy text matching
  const titleSimilarity = jaroWinklerSimilarity(norm1Title, norm2Title);
  const artistSimilarity = jaroWinklerSimilarity(norm1Artist, norm2Artist);
  
  // Weight: Title 60%, Artist 40%
  let confidence = titleSimilarity * 60 + artistSimilarity * 40;
  
  // Bonus: Duration match (within 5 seconds)
  if (track1.duration && track2.duration) {
    const durationDiff = Math.abs(track1.duration - track2.duration);
    const durationMatch = Math.max(0, 1 - durationDiff / 5000); // 5 second tolerance
    confidence += durationMatch * 10; // Up to 10% bonus
  }
  
  // Bonus: Album match
  if (track1.album && track2.album) {
    const albumSimilarity = jaroWinklerSimilarity(
      normalizeString(track1.album),
      normalizeString(track2.album)
    );
    confidence += albumSimilarity * 5; // Up to 5% bonus
  }
  
  // Bonus: Year match
  if (track1.year && track2.year && Math.abs(track1.year - track2.year) <= 1) {
    confidence += 3; // 3% bonus for same/adjacent year
  }
  
  // Cap at 100
  confidence = Math.min(100, confidence);
  
  const method = confidence >= 85 ? 'fuzzy_text' : 'fuzzy_duration';
  const reason = `Title similarity: ${(titleSimilarity * 100).toFixed(1)}%, Artist similarity: ${(artistSimilarity * 100).toFixed(1)}%`;
  
  return {
    confidence: Math.round(confidence),
    method,
    reason,
  };
}

/**
 * Find best match for a track in a list of candidates
 */
export function findBestMatch(
  track: TrackIdentity,
  candidates: TrackIdentity[],
  minConfidence: number = 85
): { track: TrackIdentity; match: MatchResult } | null {
  let bestMatch: { track: TrackIdentity; match: MatchResult } | null = null;
  let bestConfidence = minConfidence;
  
  for (const candidate of candidates) {
    const match = matchTracks(track, candidate);
    
    if (match.confidence > bestConfidence) {
      bestConfidence = match.confidence;
      bestMatch = { track: candidate, match };
    }
  }
  
  return bestMatch;
}

/**
 * Find all potential matches above a threshold
 */
export function findAllMatches(
  track: TrackIdentity,
  candidates: TrackIdentity[],
  minConfidence: number = 70
): Array<{ track: TrackIdentity; match: MatchResult }> {
  const matches: Array<{ track: TrackIdentity; match: MatchResult }> = [];
  
  for (const candidate of candidates) {
    const match = matchTracks(track, candidate);
    
    if (match.confidence >= minConfidence) {
      matches.push({ track: candidate, match });
    }
  }
  
  // Sort by confidence (highest first)
  return matches.sort((a, b) => b.match.confidence - a.match.confidence);
}

/**
 * Batch match tracks (for importing large collections)
 */
export function batchMatchTracks(
  sourceTracks: TrackIdentity[],
  targetTracks: TrackIdentity[],
  minConfidence: number = 85
): TrackMatch[] {
  const matches: TrackMatch[] = [];
  
  for (const sourceTrack of sourceTracks) {
    const match = findBestMatch(sourceTrack, targetTracks, minConfidence);
    
    if (match) {
      matches.push({
        sourceTrack,
        matchedTrack: match.track,
        result: match.match,
      });
    }
  }
  
  return matches;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Check if two tracks are likely the same song
 */
export function areSameTrack(track1: TrackIdentity, track2: TrackIdentity): boolean {
  const match = matchTracks(track1, track2);
  return match.confidence >= 85;
}

/**
 * Get match confidence category
 */
export function getMatchCategory(confidence: number): 'perfect' | 'high' | 'medium' | 'low' | 'none' {
  if (confidence >= 95) return 'perfect';
  if (confidence >= 85) return 'high';
  if (confidence >= 70) return 'medium';
  if (confidence >= 50) return 'low';
  return 'none';
}

/**
 * Format match result for display
 */
export function formatMatchResult(match: MatchResult): string {
  const category = getMatchCategory(match.confidence);
  const emoji = {
    perfect: '✅',
    high: '✓',
    medium: '⚠️',
    low: '❓',
    none: '❌',
  }[category];
  
  return `${emoji} ${match.confidence}% confidence (${match.method})`;
}

/**
 * Create a fingerprint for quick lookup
 * Returns a simple hash-like string for exact matching
 */
export function createTrackFingerprint(track: TrackIdentity): string {
  const normalized = `${normalizeArtist(track.artist)}::${normalizeTitle(track.title)}`;
  return normalized;
}

/**
 * Group tracks by fingerprint (for finding duplicates)
 */
export function groupByFingerprint(tracks: TrackIdentity[]): Map<string, TrackIdentity[]> {
  const groups = new Map<string, TrackIdentity[]>();
  
  for (const track of tracks) {
    const fingerprint = createTrackFingerprint(track);
    const existing = groups.get(fingerprint) || [];
    existing.push(track);
    groups.set(fingerprint, existing);
  }
  
  return groups;
}

/**
 * Find duplicates in a track list
 */
export function findDuplicates(tracks: TrackIdentity[]): Map<string, TrackIdentity[]> {
  const groups = groupByFingerprint(tracks);
  const duplicates = new Map<string, TrackIdentity[]>();
  
  for (const [fingerprint, trackList] of groups.entries()) {
    if (trackList.length > 1) {
      duplicates.set(fingerprint, trackList);
    }
  }
  
  return duplicates;
}

