'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Radio, Search } from 'lucide-react';

interface TrackWithRelations {
  track_id: string;
  track_title: string;
  song_artist: string;
  release_title: string;
  bpm: number | null;
  key: string | null;
  cover_image_url: string | null;
  outgoing_count: number;
  incoming_count: number;
  total_relations: number;
}

export default function RadiationsPage() {
  const [tracks, setTracks] = useState<TrackWithRelations[]>([]);
  const [filteredTracks, setFilteredTracks] = useState<TrackWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadTracksWithRelations();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredTracks(tracks);
    } else {
      const filtered = tracks.filter(track =>
        track.track_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        track.song_artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
        track.release_title.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTracks(filtered);
    }
  }, [searchTerm, tracks]);

  async function loadTracksWithRelations() {
    try {
      setLoading(true);
      const response = await fetch('/api/tracks/with-relations');
      if (response.ok) {
        const data = await response.json();
        setTracks(data.tracks || []);
        setFilteredTracks(data.tracks || []);
      } else {
        setError('Failed to load tracks with relations');
      }
    } catch (err) {
      console.error('Failed to load tracks:', err);
      setError('Failed to load tracks with relations');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <Radio className="w-8 h-8" />
            Radiations
          </h1>
          <p className="text-muted-foreground">
            Tracks with mixing relationships • {filteredTracks.length} track{filteredTracks.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search by track, artist, or album..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredTracks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Radio className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Radiations Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start creating track relationships in your collection to see them here!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Tracks with Relations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{tracks.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Relations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {tracks.reduce((sum, t) => sum + t.total_relations, 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Avg Relations per Track
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {tracks.length > 0
                    ? (tracks.reduce((sum, t) => sum + t.total_relations, 0) / tracks.length).toFixed(1)
                    : '0'}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tracks List */}
          <Card>
            <CardHeader>
              <CardTitle>Tracks with Relations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredTracks.map((track) => (
                  <div
                    key={track.track_id}
                    className="p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold">{track.track_title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {track.song_artist} • {track.release_title}
                        </p>
                        <div className="flex gap-2 mt-1 text-xs">
                          {track.bpm && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                              {track.bpm} BPM
                            </span>
                          )}
                          {track.key && (
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                              {track.key}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {track.outgoing_count}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Outgoing →
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {track.incoming_count}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ← Incoming
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold">
                            {track.total_relations}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Total
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

