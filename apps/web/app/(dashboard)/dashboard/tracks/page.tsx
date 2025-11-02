'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Search, Download, Music2 } from 'lucide-react';
import Image from 'next/image';

interface Track {
  user_track_id: string;
  track_id: string;
  track_title: string;
  position: string | null;
  bpm: number | null;
  key: string | null;
  camelot_key: string | null;
  energy_level: number | null;
  duration_ms: number | null;
  version_type: string | null;
  version_info: string | null;
  song_id: string;
  song_title: string;
  song_artist: string;
  genres: string[] | null;
  styles: string[] | null;
  release_id: string;
  release_title: string;
  cover_image_url: string | null;
  format: string | null;
  year: number | null;
  personal_rating: number | null;
  tags: string[] | null;
  source: string | null;
  location: string | null;
  crate_name: string | null;
  play_count: number;
  last_played_at: string | null;
}

export default function TracksPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [filteredTracks, setFilteredTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadTracks();
  }, []);

  useEffect(() => {
    filterTracks();
  }, [searchQuery, tracks]);

  async function loadTracks() {
    try {
      setLoading(true);
      const response = await fetch('/api/tracks/all');
      if (response.ok) {
        const data = await response.json();
        setTracks(data.tracks || []);
        setFilteredTracks(data.tracks || []);
      } else {
        throw new Error('Failed to load tracks');
      }
    } catch (err) {
      console.error('Failed to load tracks:', err);
      setError('Failed to load tracks');
    } finally {
      setLoading(false);
    }
  }

  function filterTracks() {
    if (!searchQuery.trim()) {
      setFilteredTracks(tracks);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = tracks.filter(track => 
      track.track_title.toLowerCase().includes(query) ||
      track.song_artist.toLowerCase().includes(query) ||
      track.release_title.toLowerCase().includes(query) ||
      track.genres?.some(g => g.toLowerCase().includes(query)) ||
      track.key?.toLowerCase().includes(query)
    );
    setFilteredTracks(filtered);
  }

  function formatDuration(ms: number | null): string {
    if (!ms) return '-';
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  function exportToCSV() {
    const headers = [
      'Track Title',
      'Artist',
      'Album',
      'Position',
      'BPM',
      'Key',
      'Camelot',
      'Energy',
      'Duration',
      'Year',
      'Format',
      'Genres',
      'Styles',
      'Version',
      'Source',
      'Location',
      'Crate',
      'Rating',
      'Play Count',
    ];

    const rows = filteredTracks.map(track => [
      track.track_title,
      track.song_artist,
      track.release_title,
      track.position || '',
      track.bpm || '',
      track.key || '',
      track.camelot_key || '',
      track.energy_level || '',
      formatDuration(track.duration_ms),
      track.year || '',
      track.format || '',
      track.genres?.join('; ') || '',
      track.styles?.join('; ') || '',
      track.version_info || track.version_type || '',
      track.source || '',
      track.location || '',
      track.crate_name || '',
      track.personal_rating || '',
      track.play_count,
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `synapse-tracks-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">All Tracks</h1>
          <p className="text-muted-foreground">
            {filteredTracks.length} track{filteredTracks.length !== 1 ? 's' : ''} 
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={exportToCSV}
            disabled={filteredTracks.length === 0}
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, artist, album, genre, or key..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

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
          <CardContent className="pt-12 pb-12 text-center">
            <Music2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-2">
              {searchQuery ? 'No tracks found matching your search' : 'No tracks in your collection yet'}
            </p>
            {!searchQuery && (
              <Button variant="outline" onClick={() => window.location.href = '/dashboard/collection'}>
                Import from Discogs
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Track Database</CardTitle>
            <CardDescription>
              All tracks with complete metadata
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">Cover</th>
                    <th className="text-left p-2 font-medium">Track</th>
                    <th className="text-left p-2 font-medium">Artist</th>
                    <th className="text-left p-2 font-medium">Album</th>
                    <th className="text-left p-2 font-medium">Pos</th>
                    <th className="text-left p-2 font-medium">BPM</th>
                    <th className="text-left p-2 font-medium">Key</th>
                    <th className="text-left p-2 font-medium">Camelot</th>
                    <th className="text-left p-2 font-medium">Energy</th>
                    <th className="text-left p-2 font-medium">Duration</th>
                    <th className="text-left p-2 font-medium">Year</th>
                    <th className="text-left p-2 font-medium">Format</th>
                    <th className="text-left p-2 font-medium">Genres</th>
                    <th className="text-left p-2 font-medium">Version</th>
                    <th className="text-left p-2 font-medium">Source</th>
                    <th className="text-left p-2 font-medium">Plays</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTracks.map((track) => (
                    <tr key={track.user_track_id} className="border-b hover:bg-muted/50">
                      <td className="p-2">
                        <div className="w-12 h-12 relative bg-muted rounded overflow-hidden flex-shrink-0">
                          {track.cover_image_url ? (
                            <Image
                              src={track.cover_image_url}
                              alt={track.release_title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Music2 className="w-6 h-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="font-medium max-w-xs truncate" title={track.track_title}>
                          {track.track_title}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="max-w-xs truncate" title={track.song_artist}>
                          {track.song_artist}
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="max-w-xs truncate text-muted-foreground" title={track.release_title}>
                          {track.release_title}
                        </div>
                      </td>
                      <td className="p-2 text-muted-foreground">
                        {track.position || '-'}
                      </td>
                      <td className="p-2">
                        {track.bpm ? (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                            {track.bpm}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-2">
                        {track.key ? (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                            {track.key}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-2 text-muted-foreground">
                        {track.camelot_key || '-'}
                      </td>
                      <td className="p-2">
                        {track.energy_level ? (
                          <span className="text-xs">
                            {'⚡'.repeat(Math.min(track.energy_level, 10))}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-2 text-muted-foreground">
                        {formatDuration(track.duration_ms)}
                      </td>
                      <td className="p-2 text-muted-foreground">
                        {track.year || '-'}
                      </td>
                      <td className="p-2">
                        {track.format ? (
                          <span className="text-xs bg-muted px-2 py-1 rounded">
                            {track.format}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-2">
                        {track.genres && track.genres.length > 0 ? (
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {track.genres.slice(0, 2).map((genre) => (
                              <span
                                key={genre}
                                className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded"
                              >
                                {genre}
                              </span>
                            ))}
                            {track.genres.length > 2 && (
                              <span className="text-xs text-muted-foreground">
                                +{track.genres.length - 2}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-2 text-muted-foreground text-xs">
                        {track.version_info || track.version_type || '-'}
                      </td>
                      <td className="p-2">
                        {track.source ? (
                          <span className="text-xs capitalize">{track.source}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="p-2 text-muted-foreground text-center">
                        {track.play_count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

