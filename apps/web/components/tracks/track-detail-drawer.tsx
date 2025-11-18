'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  Loader2,
  Disc3,
  HardDrive
} from 'lucide-react';
import Image from 'next/image';

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
  collection_type?: 'physical' | 'digital';
}

interface TrackDetailDrawerProps {
  trackId: string | null;
  onClose: () => void;
}

export function TrackDetailDrawer({ trackId, onClose }: TrackDetailDrawerProps) {
  const [track, setTrack] = useState<any>(null);
  const [relatedTracks, setRelatedTracks] = useState<RelatedTrack[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (trackId) {
      loadTrackDetails();
      loadRelatedTracks();
      loadRecommendations();
    }
  }, [trackId]);

  async function loadTrackDetails() {
    try {
      setLoading(true);
      const response = await fetch(`/api/tracks/${trackId}`);
      if (response.ok) {
        const data = await response.json();
        setTrack(data.track);
      }
    } catch (err) {
      console.error('Failed to load track:', err);
    } finally {
      setLoading(false);
    }
  }

  async function loadRelatedTracks() {
    try {
      const response = await fetch(`/api/tracks/${trackId}/related`);
      if (response.ok) {
        const data = await response.json();
        setRelatedTracks(data.relatedTracks || []);
      }
    } catch (err) {
      console.error('Failed to load related tracks:', err);
    }
  }

  async function loadRecommendations() {
    try {
      setLoadingRecommendations(true);
      const response = await fetch(`/api/tracks/${trackId}/recommendations-v2`);
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

  async function searchTracks(query: string) {
    try {
      const response = await fetch(`/api/tracks/search?q=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.tracks || []);
      }
    } catch (err) {
      console.error('Failed to search tracks:', err);
    }
  }

  async function createTransition(toTrackId: string) {
    try {
      const response = await fetch('/api/tracks/transitions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from_track_id: trackId,
          to_track_id: toTrackId,
        }),
      });

      if (response.ok) {
        await loadRelatedTracks();
        setSearchQuery('');
        setSearchResults([]);
      } else {
        setError('Failed to create transition');
      }
    } catch (err) {
      console.error('Failed to create transition:', err);
      setError('Failed to create transition');
    }
  }

  async function deleteTransition(transitionId: string) {
    try {
      const response = await fetch(`/api/tracks/transitions/${transitionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadRelatedTracks();
      }
    } catch (err) {
      console.error('Failed to delete transition:', err);
    }
  }

  async function updateTransitionRating(transitionId: string, rating: number) {
    try {
      const response = await fetch(`/api/tracks/transitions/${transitionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating }),
      });

      if (!response.ok) {
        throw new Error('Failed to update rating');
      }

      await loadRelatedTracks();
    } catch (err) {
      console.error('Failed to update rating:', err);
    }
  }

  if (!trackId) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity ${
          trackId ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div 
        className={`fixed right-0 top-0 h-full w-full md:w-[600px] bg-background border-l shadow-xl z-50 transform transition-transform ${
          trackId ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-1">Track Details</h2>
                {track && (
                  <p className="text-muted-foreground">
                    {track.songs?.artist} - {track.title}
                  </p>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : track ? (
              <>
                {/* Track Info Card */}
                <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                  <div className="flex gap-4">
                    {/* Cover Art */}
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {track.records?.cover_image_url ? (
                        <Image
                          src={track.records.cover_image_url}
                          alt={track.title}
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Music2 className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>

                    {/* Metadata */}
                    <div className="flex-1 space-y-2">
                      <div>
                        <div className="text-sm text-muted-foreground">Album</div>
                        <div className="font-medium">{track.records?.title || 'Unknown'}</div>
                      </div>
                      {track.records?.label && (
                        <div>
                          <div className="text-sm text-muted-foreground">Label</div>
                          <div className="font-medium">{track.records.label}</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className="grid grid-cols-4 gap-3 pt-3 border-t border-border/50">
                    {track.bpm && (
                      <div className="text-center">
                        <div className="text-2xl font-bold font-mono">{track.bpm.toFixed(0)}</div>
                        <div className="text-xs text-muted-foreground">BPM</div>
                      </div>
                    )}
                    {track.camelot_key && (
                      <div className="text-center">
                        <div className="text-2xl font-bold font-mono">{track.camelot_key}</div>
                        <div className="text-xs text-muted-foreground">Key</div>
                      </div>
                    )}
                    {track.records?.year && (
                      <div className="text-center">
                        <div className="text-2xl font-bold">{track.records.year}</div>
                        <div className="text-xs text-muted-foreground">Year</div>
                      </div>
                    )}
                    <div className="text-center">
                      <div className="flex items-center justify-center h-8">
                        {track.records?.collection_type === 'digital' ? (
                          <HardDrive className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Disc3 className="w-5 h-5 text-green-600" />
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {track.records?.collection_type === 'digital' ? 'Digital' : 'Vinyl'}
                      </div>
                    </div>
                  </div>

                  {/* Genres */}
                  {track.songs?.genres && track.songs.genres.length > 0 && (
                    <div className="pt-3 border-t border-border/50">
                      <div className="text-sm text-muted-foreground mb-2">Genres</div>
                      <div className="flex flex-wrap gap-1">
                        {track.songs.genres.map((genre: string) => (
                          <span
                            key={genre}
                            className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Related Tracks Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Related Tracks</h3>
                    <span className="text-sm text-muted-foreground">
                      {relatedTracks.length} transitions
                    </span>
                  </div>

                  {relatedTracks.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Music2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No related tracks yet</p>
                      <p className="text-sm">Search below to add transitions</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {relatedTracks.map((related) => (
                        <div
                          key={related.transition_id}
                          className="bg-muted/30 rounded-lg p-3 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-medium">
                                {related.artist} - {related.track_title}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {related.album}
                              </div>
                              <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                                {related.bpm && <span>{related.bpm} BPM</span>}
                                {related.key && <span>{related.key}</span>}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {related.rating !== null && (
                                <div className="flex gap-1">
                                  <Button
                                    variant={related.rating > 0 ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => updateTransitionRating(related.transition_id, related.rating === 1 ? 0 : 1)}
                                  >
                                    <ThumbsUp className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    variant={related.rating < 0 ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => updateTransitionRating(related.transition_id, related.rating === -1 ? 0 : -1)}
                                  >
                                    <ThumbsDown className="w-3 h-3" />
                                  </Button>
                                </div>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteTransition(related.transition_id)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Search & Add Transitions */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Add Transition</h3>
                  <div className="space-y-3">
                    <Input
                      placeholder="Search for a track to connect..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        if (e.target.value.length >= 2) {
                          searchTracks(e.target.value);
                        } else {
                          setSearchResults([]);
                        }
                      }}
                    />

                    {searchResults.length > 0 && (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {searchResults.map((result) => (
                          <div
                            key={result.id}
                            className="bg-muted/30 rounded-lg p-3 flex items-center justify-between hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">
                                {result.songs?.artist} - {result.title}
                              </div>
                              <div className="text-sm text-muted-foreground truncate">
                                {result.records?.title}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => createTransition(result.id)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* AI Recommendations */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-5 h-5 text-purple-500" />
                    <h3 className="text-lg font-semibold">AI Recommendations</h3>
                  </div>

                  {loadingRecommendations ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : recommendations.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No recommendations available</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {recommendations.map((rec) => (
                        <div
                          key={rec.track_id}
                          className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex gap-3">
                            {/* Cover */}
                            <div className="w-16 h-16 rounded bg-muted flex-shrink-0 overflow-hidden">
                              {rec.cover_image_url ? (
                                <Image
                                  src={rec.cover_image_url}
                                  alt={rec.album}
                                  width={64}
                                  height={64}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Music2 className="w-6 h-6 text-muted-foreground" />
                                </div>
                              )}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold truncate">
                                {rec.artist} - {rec.track_title}
                              </div>
                              <div className="text-sm text-muted-foreground truncate">
                                {rec.album}
                                {rec.label && ` • ${rec.label}`}
                              </div>
                              <div className="flex gap-3 mt-1 text-xs">
                                {rec.bpm && (
                                  <span className="font-mono">{rec.bpm.toFixed(0)} BPM</span>
                                )}
                                {rec.key && (
                                  <span className="font-mono">{rec.key}</span>
                                )}
                                {rec.collection_type && (
                                  <span className="flex items-center gap-1">
                                    {rec.collection_type === 'digital' ? (
                                      <HardDrive className="w-3 h-3" />
                                    ) : (
                                      <Disc3 className="w-3 h-3" />
                                    )}
                                  </span>
                                )}
                              </div>
                              <div className="mt-2">
                                <span className="text-xs bg-white/80 px-2 py-1 rounded-full">
                                  {rec.match_reason}
                                </span>
                              </div>
                            </div>

                            {/* Add Button */}
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-shrink-0"
                              onClick={() => createTransition(rec.track_id)}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Music2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Track not found</p>
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

