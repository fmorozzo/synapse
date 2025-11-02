'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  X, 
  Music2, 
  Plus, 
  Trash2, 
  ThumbsUp, 
  ThumbsDown,
  Sparkles,
  Link2,
  ToggleLeft,
  ToggleRight,
  ArrowRight,
  ArrowLeft,
  Loader2
} from 'lucide-react';
import Image from 'next/image';

interface Track {
  id: string;
  title: string;
  position: string | null;
  duration_ms: number | null;
  bpm: number | null;
  key: string | null;
  energy_level: number | null;
}

interface RelatedTrack {
  track_id: string;
  track_title: string;
  artist: string;
  album: string;
  bpm: number | null;
  key: string | null;
  rating: number | null;
  worked_well: boolean | null;
  context: string | null;
  transition_id: string;
  direction?: 'incoming' | 'outgoing';
}

interface Recommendation {
  track_id: string;
  track_title: string;
  artist: string;
  album: string;
  cover_image_url?: string;
  label?: string;
  year?: number;
  bpm: number | null;
  key: string | null;
  genres?: string[];
  styles?: string[];
  match_reason: string;
  match_score: number;
}

interface AlbumDetailDrawerProps {
  albumId: string | null;
  onClose: () => void;
}

export function AlbumDetailDrawer({ albumId, onClose }: AlbumDetailDrawerProps) {
  const [album, setAlbum] = useState<any>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
  const [relatedTracks, setRelatedTracks] = useState<RelatedTrack[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [isRelationsEnabled, setIsRelationsEnabled] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (albumId) {
      loadAlbumDetails();
    }
  }, [albumId]);

  useEffect(() => {
    if (selectedTrack) {
      // Clear previous data immediately
      setRelatedTracks([]);
      setRecommendations([]);
      setLoadingRecommendations(true);
      
      // Load new data
      loadRelatedTracks(selectedTrack);
      loadRecommendations(selectedTrack);
    }
  }, [selectedTrack]);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      searchTracks();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  async function loadAlbumDetails() {
    try {
      setLoading(true);
      const response = await fetch(`/api/records/${albumId}`);
      if (response.ok) {
        const data = await response.json();
        setAlbum(data.record);
        setTracks(data.tracks || []);
        if (data.tracks && data.tracks.length > 0) {
          setSelectedTrack(data.tracks[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load album:', err);
      setError('Failed to load album details');
    } finally {
      setLoading(false);
    }
  }

  async function loadRelatedTracks(trackId: string) {
    try {
      const response = await fetch(`/api/tracks/${trackId}/related`);
      if (response.ok) {
        const data = await response.json();
        setRelatedTracks(data.related || []);
      }
    } catch (err) {
      console.error('Failed to load related tracks:', err);
    }
  }

  async function loadRecommendations(trackId: string) {
    try {
      setLoadingRecommendations(true);
      const response = await fetch(`/api/tracks/${trackId}/recommendations`);
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || []);
      }
    } catch (err) {
      console.error('Failed to load recommendations:', err);
    } finally {
      setLoadingRecommendations(false);
    }
  }

  async function searchTracks() {
    try {
      // Only search from THIS album's tracks
      if (!tracks || tracks.length === 0) {
        setSearchResults([]);
        return;
      }

      // Filter tracks from current album only
      const query = searchQuery.toLowerCase();
      const filtered = tracks.filter(track => 
        track.id !== selectedTrack && // Exclude currently selected track
        track.title.toLowerCase().includes(query)
      );

      // Map to search result format
      const results = filtered.map(track => ({
        track_id: track.id,
        track_title: track.title,
        song_artist: album?.artist || 'Unknown',
        release_title: album?.title || 'Unknown',
        bpm: track.bpm,
        key: track.key,
      }));

      setSearchResults(results);
    } catch (err) {
      console.error('Failed to search tracks:', err);
    }
  }

  async function addRelation(toTrackId: string, workedWell: boolean) {
    if (!selectedTrack) return;

    try {
      const response = await fetch('/api/tracks/transitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_track_id: selectedTrack,
          to_track_id: toTrackId,
          worked_well: workedWell,
          context: 'manual_add',
        }),
      });

      if (response.ok) {
        await loadRelatedTracks(selectedTrack);
        setSearchQuery('');
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Failed to add relation:', err);
      setError('Failed to add relation');
    }
  }

  async function removeRelation(transitionId: string) {
    try {
      const response = await fetch(`/api/tracks/transitions/${transitionId}`, {
        method: 'DELETE',
      });

      if (response.ok && selectedTrack) {
        await loadRelatedTracks(selectedTrack);
      }
    } catch (err) {
      console.error('Failed to remove relation:', err);
    }
  }

  async function toggleRelationsEnabled() {
    if (!albumId) return;

    try {
      const response = await fetch(`/api/records/${albumId}/toggle-relations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !isRelationsEnabled }),
      });

      if (response.ok) {
        setIsRelationsEnabled(!isRelationsEnabled);
      }
    } catch (err) {
      console.error('Failed to toggle relations:', err);
    }
  }

  function formatDuration(ms: number | null): string {
    if (!ms) return '-';
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  if (!albumId) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full md:w-3/4 lg:w-2/3 xl:w-1/2 bg-background z-50 shadow-xl overflow-y-auto">
        <div className="sticky top-0 bg-background/95 backdrop-blur border-b z-10">
          <div className="flex items-center justify-between p-6">
            <h2 className="text-2xl font-bold">Album Details</h2>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <>
              {/* Album Info */}
              <div className="flex gap-6">
                <div className="w-48 h-48 relative bg-muted rounded-lg overflow-hidden flex-shrink-0">
                  {album?.cover_image_url ? (
                    <Image
                      src={album.cover_image_url}
                      alt={album.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music2 className="w-16 h-16 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <h3 className="text-2xl font-bold">{album?.title}</h3>
                  <p className="text-lg text-muted-foreground">{album?.artist}</p>
                  <div className="flex flex-wrap gap-2 text-sm">
                    {album?.year && (
                      <span className="px-2 py-1 bg-muted rounded">{album.year}</span>
                    )}
                    {album?.format && (
                      <span className="px-2 py-1 bg-muted rounded">{album.format}</span>
                    )}
                    {album?.label && (
                      <span className="px-2 py-1 bg-muted rounded">{album.label}</span>
                    )}
                  </div>
                  {album?.genres && album.genres.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {album.genres.map((genre: string) => (
                        <span
                          key={genre}
                          className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Relations Toggle */}
                  <div className="pt-4">
                    <Button
                      variant={isRelationsEnabled ? "default" : "outline"}
                      size="sm"
                      onClick={toggleRelationsEnabled}
                      className="gap-2"
                    >
                      {isRelationsEnabled ? (
                        <>
                          <ToggleRight className="w-4 h-4" />
                          Relations Enabled
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-4 h-4" />
                          Relations Disabled
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">
                      {isRelationsEnabled 
                        ? 'This album is used for recommendations'
                        : 'This album is excluded from recommendations'
                      }
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Track List */}
              <div className="space-y-2">
                <h4 className="font-semibold">Tracks</h4>
                {tracks.length === 0 ? (
                  <Alert>
                    <AlertDescription>
                      No tracks found. Import collection to populate tracks.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-1">
                    {tracks.map((track) => (
                      <button
                        key={track.id}
                        onClick={() => setSelectedTrack(track.id)}
                        className={`w-full p-3 rounded-lg text-left transition-colors ${
                          selectedTrack === track.id
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium">
                              {track.position && <span className="mr-2">{track.position}</span>}
                              {track.title}
                            </div>
                            <div className="text-sm opacity-80">
                              {formatDuration(track.duration_ms)}
                              {track.bpm && <span className="ml-2">• {track.bpm} BPM</span>}
                              {track.key && <span className="ml-2">• {track.key}</span>}
                              {track.energy_level && <span className="ml-2">• ⚡{track.energy_level}</span>}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selectedTrack && tracks.length > 0 && (
                <>
                  {/* Related Tracks - Only show if there are relations */}
                  {relatedTracks.length > 0 && (
                    <>
                      <Separator />
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold flex items-center gap-2">
                            <Link2 className="w-4 h-4" />
                            Related Tracks ({relatedTracks.length})
                          </h4>
                        </div>
                      <div className="space-y-2">
                        {relatedTracks.map((related) => (
                          <div
                            key={related.track_id}
                            className="p-3 bg-muted rounded-lg flex items-center justify-between"
                          >
                            <div className="flex items-center gap-2 flex-1">
                              {/* Direction indicator */}
                              {related.direction === 'incoming' ? (
                                <ArrowLeft className="w-4 h-4 text-blue-500 flex-shrink-0" title="This track mixes INTO the selected track" />
                              ) : (
                                <ArrowRight className="w-4 h-4 text-green-500 flex-shrink-0" title="Selected track mixes INTO this track" />
                              )}
                              
                              <div className="flex-1">
                                <div className="font-medium">{related.track_title}</div>
                                <div className="text-sm text-muted-foreground">
                                  {related.artist} • {related.album}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {related.bpm && <span>{related.bpm} BPM</span>}
                                  {related.key && <span className="ml-2">• {related.key}</span>}
                                  {related.context && <span className="ml-2">• {related.context}</span>}
                                  {related.direction && (
                                    <span className="ml-2">
                                      • {related.direction === 'incoming' ? 'Mixes into this' : 'This mixes into it'}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {related.worked_well !== null && (
                                <span className="text-lg">
                                  {related.worked_well ? '👍' : '👎'}
                                </span>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeRelation(related.transition_id)}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    </>
                  )}

                  <Separator />

                  {/* Add New Relation - From this album only */}
                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      Add Related Track (from this album)
                    </h4>

                    <div className="space-y-2">
                      <Label>Search tracks from "{album?.title}"</Label>
                      <Input
                        placeholder="Search by title, artist, or album..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />

                      {searchResults.length > 0 && (
                        <div className="border rounded-lg max-h-64 overflow-y-auto">
                          {searchResults.map((result) => (
                            <div
                              key={result.track_id}
                              className="p-3 hover:bg-muted border-b last:border-b-0"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="font-medium">{result.track_title}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {result.song_artist} • {result.release_title}
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => addRelation(result.track_id, true)}
                                    className="gap-1"
                                  >
                                    <ThumbsUp className="w-3 h-3" />
                                    Works
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => addRelation(result.track_id, false)}
                                    className="gap-1"
                                  >
                                    <ThumbsDown className="w-3 h-3" />
                                    Doesn't
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Recommendations */}
                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Recommended Tracks
                    </h4>

                    {loadingRecommendations ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                        <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
                      </div>
                    ) : recommendations.length === 0 ? (
                      <Alert>
                        <AlertDescription>
                          No recommendations yet. Add BPM, Key, and genres to get better recommendations!
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <div className="space-y-3">
                        {recommendations.map((rec) => {
                          // Parse tags from match_reason and data
                          const tags: string[] = [];
                          const reasons = rec.match_reason.split(' • ');
                          
                          // Helper: Get decade from year
                          const getDecade = (year: number): string => {
                            if (year < 1990) return '80s';
                            if (year < 2000) return '90s';
                            if (year < 2010) return '00s';
                            if (year < 2020) return '10s';
                            return '20s';
                          };

                          // 1. Add label/artist tags from match_reason
                          reasons.forEach(reason => {
                            if (reason.includes('Same label')) {
                              tags.push('Same Label');
                            } else if (reason.includes('Same artist')) {
                              tags.push('Same Artist');
                            } else if (reason.includes('Artist also on')) {
                              tags.push('Related Artist');
                            }
                          });

                          // 2. Add genre/style tags (split into individual tags)
                          const allStyles = [...(rec.styles || []), ...(rec.genres || [])];
                          const uniqueStyles = Array.from(new Set(allStyles))
                            .filter(s => !['Electronic', 'Dance'].includes(s)) // Skip generic
                            .slice(0, 2); // Max 2 genre tags
                          
                          uniqueStyles.forEach(style => tags.push(style));

                          // 3. Add decade if year < 1999
                          if (rec.year && rec.year < 1999) {
                            tags.push(getDecade(rec.year));
                          }

                          // 4. Add BPM if available
                          if (rec.bpm) {
                            tags.push(`${rec.bpm} BPM`);
                          }

                          // 5. Add Key if available
                          if (rec.key) {
                            tags.push(rec.key);
                          }

                          return (
                            <div
                              key={rec.track_id}
                              className="p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                            >
                              <div className="flex gap-3">
                                {/* Album Cover */}
                                <div className="w-16 h-16 bg-muted rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
                                  {rec.cover_image_url ? (
                                    <img
                                      src={rec.cover_image_url}
                                      alt={rec.album}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <Music2 className="w-8 h-8 text-muted-foreground" />
                                  )}
                                </div>

                                {/* Track Info */}
                                <div className="flex-1 min-w-0">
                                  {/* Album Name (prominent) */}
                                  <div className="font-semibold truncate">{rec.album}</div>
                                  
                                  {/* Artist and Song */}
                                  <div className="text-sm text-muted-foreground truncate">
                                    {rec.artist} - {rec.track_title}
                                  </div>
                                  
                                  {/* Tags */}
                                  {tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mt-1.5">
                                      {tags.slice(0, 5).map((tag, idx) => (
                                        <span
                                          key={idx}
                                          className="text-xs px-2 py-0.5 bg-blue-200 text-blue-800 rounded-full"
                                        >
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  )}

                                  {/* Score */}
                                  <div className="text-xs text-blue-700 mt-1">
                                    Score: {rec.match_score}
                                  </div>
                                </div>

                                {/* Add Button */}
                                <Button
                                  size="sm"
                                  onClick={() => addRelation(rec.track_id, true)}
                                  className="gap-1 flex-shrink-0"
                                >
                                  <Plus className="w-3 h-3" />
                                  Add
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </>
  );
}

