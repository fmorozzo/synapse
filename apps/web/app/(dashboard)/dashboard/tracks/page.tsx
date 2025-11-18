'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Music2, Search, Disc3, HardDrive } from 'lucide-react';
import { getCompatibleKeys } from '@synapse/shared';
import { TrackDetailDrawer } from '@/components/tracks/track-detail-drawer';
import Image from 'next/image';

interface Track {
  id: string;
  title: string;
  bpm: number | null;
  key: string | null;
  camelot_key: string | null;
  duration_ms: number | null;
  energy_level: number | null;
  songs: {
    artist: string;
    genres: string[];
  };
  records: {
    title: string;
    year: number | null;
    format: string | null;
    cover_image_url: string | null;
    collection_type: 'physical' | 'digital';
    label: string | null;
  };
  personal_rating: number | null;
  play_count: number;
}

type FormatFilter = 'all' | 'vinyl' | 'digital';
type SortBy = 'bpm' | 'key' | 'artist' | 'title' | 'dateAdded';

export default function TracksPage() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [filteredCount, setFilteredCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  
  // Filters
  const [search, setSearch] = useState('');
  const [formatFilter, setFormatFilter] = useState<FormatFilter>('all');
  const [bpmValue, setBpmValue] = useState<number | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedDecades, setSelectedDecades] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<SortBy>('artist'); // Default to alphabetical
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    setPage(1);
    loadTracks(1, true); // Reset to page 1 when filters change
  }, [formatFilter, bpmValue, selectedKey, selectedGenres, selectedDecades, sortBy, sortOrder, search]);

  async function loadTracks(pageNum: number = 1, replace: boolean = false) {
    try {
      if (replace) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      // Build query params
      const params = new URLSearchParams();
      params.append('page', pageNum.toString());
      params.append('limit', '50');
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);
      
      if (formatFilter !== 'all') {
        params.append('format', formatFilter);
      }
      if (search) {
        params.append('search', search);
      }
      if (bpmValue) {
        params.append('targetBpm', bpmValue.toString());
      }
      if (selectedKey && compatibleKeys.length > 0) {
        params.append('keys', compatibleKeys.join(','));
      }
      if (selectedGenres.length > 0) {
        params.append('genres', selectedGenres.join(','));
      }
      if (selectedDecades.length > 0) {
        params.append('decade', selectedDecades.join(','));
      }
      
      const response = await fetch(`/api/tracks/all?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Loaded tracks:', data.tracks?.length, 'tracks (page', pageNum, ')');
        
        if (replace) {
          setTracks(data.tracks || []);
        } else {
          setTracks(prev => [...prev, ...(data.tracks || [])]);
        }
        
        setTotalCount(data.totalCount || 0);
        setFilteredCount(data.count || 0);
        setHasMore(data.hasMore || false);
        setPage(pageNum);
      } else {
        setError('Failed to load tracks');
      }
    } catch (err) {
      console.error('Failed to load tracks:', err);
      setError('Failed to load tracks');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }
  
  function loadMore() {
    if (!loadingMore && hasMore) {
      loadTracks(page + 1, false);
    }
  }

  // Calculate compatible keys when a key is selected
  const compatibleKeys = useMemo(() => {
    if (!selectedKey) return [];
    return getCompatibleKeys(selectedKey).map(k => k.key);
  }, [selectedKey]);

  // Get unique genres from tracks
  const availableGenres = useMemo(() => {
    const genres = new Set<string>();
    tracks.forEach(t => {
      t.songs?.genres?.forEach(g => genres.add(g));
    });
    return Array.from(genres).sort();
  }, [tracks]);

  const toggleDecade = (decade: string) => {
    setSelectedDecades(prev =>
      prev.includes(decade)
        ? prev.filter(d => d !== decade)
        : [...prev, decade]
    );
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const clearFilters = () => {
    setSearch('');
    setFormatFilter('all');
    setBpmValue(null);
    setSelectedKey(null);
    setSelectedGenres([]);
    setSelectedDecades([]);
  };

  const hasActiveFilters = search || formatFilter !== 'all' || bpmValue || selectedKey ||
    selectedGenres.length > 0 || selectedDecades.length > 0;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tracks</h1>
          <p className="text-muted-foreground mt-1">
            {loading ? 'Loading...' : filteredCount > 0 
              ? `Showing ${tracks.length} of ${filteredCount} tracks${hasActiveFilters ? ' (filtered)' : ''}`
              : `${totalCount} tracks total`
            }
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search artist, track, album, label..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Format & BPM */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Format Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Format</label>
              <div className="flex gap-2">
                <Button
                  variant={formatFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFormatFilter('all')}
                >
                  All
                </Button>
                <Button
                  variant={formatFilter === 'vinyl' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFormatFilter('vinyl')}
                  className="gap-2"
                >
                  <Disc3 className="w-4 h-4" />
                  Vinyl
                </Button>
                <Button
                  variant={formatFilter === 'digital' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFormatFilter('digital')}
                  className="gap-2"
                >
                  <HardDrive className="w-4 h-4" />
                  Digital
                </Button>
              </div>
            </div>

            {/* BPM Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                BPM (±6% pitch range)
              </label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Target BPM..."
                  value={bpmValue || ''}
                  onChange={(e) => setBpmValue(e.target.value ? parseFloat(e.target.value) : null)}
                  className="w-32"
                />
                {bpmValue && (
                  <span className="text-sm text-muted-foreground self-center">
                    {(bpmValue * 0.94).toFixed(1)} - {(bpmValue * 1.06).toFixed(1)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Key Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Key (Camelot Wheel)
            </label>
            <div className="space-y-2">
              <div className="flex gap-2 flex-wrap">
                {['1A', '2A', '3A', '4A', '5A', '6A', '7A', '8A', '9A', '10A', '11A', '12A'].map(key => (
                  <Button
                    key={key}
                    variant={selectedKey === key ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedKey(selectedKey === key ? null : key)}
                    className="w-12"
                  >
                    {key}
                  </Button>
                ))}
              </div>
              <div className="flex gap-2 flex-wrap">
                {['1B', '2B', '3B', '4B', '5B', '6B', '7B', '8B', '9B', '10B', '11B', '12B'].map(key => (
                  <Button
                    key={key}
                    variant={selectedKey === key ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedKey(selectedKey === key ? null : key)}
                    className="w-12"
                  >
                    {key}
                  </Button>
                ))}
              </div>
              {selectedKey && (
                <div className="text-sm text-muted-foreground">
                  Compatible: {compatibleKeys.join(', ')}
                </div>
              )}
            </div>
          </div>

          {/* Decades */}
          <div>
            <label className="text-sm font-medium mb-2 block">Era</label>
            <div className="flex gap-2 flex-wrap">
              {['70s', '80s', '90s', '2000s', '2010s', '2020s'].map(decade => (
                <Button
                  key={decade}
                  variant={selectedDecades.includes(decade) ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleDecade(decade)}
                >
                  {decade}
                </Button>
              ))}
            </div>
          </div>

          {/* Genres */}
          {availableGenres.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-2 block">Genre</label>
              <div className="flex gap-2 flex-wrap max-h-32 overflow-y-auto">
                {availableGenres.slice(0, 20).map(genre => (
                  <Button
                    key={genre}
                    variant={selectedGenres.includes(genre) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => toggleGenre(genre)}
                  >
                    {genre}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear All Filters
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Sort Controls */}
      <div className="flex gap-2 items-center">
        <span className="text-sm font-medium">Sort by:</span>
        <Button
          variant={sortBy === 'bpm' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSortBy('bpm')}
        >
          BPM
        </Button>
        <Button
          variant={sortBy === 'key' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSortBy('key')}
        >
          Key
        </Button>
        <Button
          variant={sortBy === 'artist' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSortBy('artist')}
        >
          Artist
        </Button>
        <Button
          variant={sortBy === 'dateAdded' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSortBy('dateAdded')}
        >
          Recently Added
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
        >
          {sortOrder === 'asc' ? '↑' : '↓'}
        </Button>
      </div>

      {/* Track List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : tracks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            {hasActiveFilters ? 'No tracks match your filters' : 'No tracks found'}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2">
            {tracks.map((track) => (
            <Card 
              key={track.id} 
              className="hover:bg-accent/50 transition-colors cursor-pointer"
              onClick={() => setSelectedTrackId(track.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Cover Art */}
                  <div className="w-14 h-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {track.records?.cover_image_url ? (
                      <Image
                        src={track.records.cover_image_url}
                        alt={track.title}
                        width={56}
                        height={56}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music2 className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Track Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="font-semibold truncate">
                      {track.songs?.artist} - {track.title}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {track.records?.title}
                      {track.records?.label && ` • ${track.records.label}`}
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                      {/* Genres */}
                      {track.songs?.genres && track.songs.genres.length > 0 && (
                        <>
                          {track.songs.genres.slice(0, 2).map((genre) => (
                            <span
                              key={genre}
                              className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full"
                            >
                              {genre}
                            </span>
                          ))}
                        </>
                      )}
                      {/* Year/Era */}
                      {track.records?.year && (
                        <span className="text-xs text-muted-foreground">
                          {track.records.year}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* BPM */}
                  {track.bpm && (
                    <div className="text-center min-w-[60px]">
                      <div className="text-sm font-mono font-semibold">{track.bpm.toFixed(0)}</div>
                      <div className="text-xs text-muted-foreground">BPM</div>
                    </div>
                  )}

                  {/* Key */}
                  {track.camelot_key && (
                    <div className="text-center min-w-[50px]">
                      <div className="text-sm font-mono font-semibold">{track.camelot_key}</div>
                      <div className="text-xs text-muted-foreground">Key</div>
                    </div>
                  )}

                  {/* Format Badge */}
                  <div className="text-center min-w-[60px]">
                    <div className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
                      track.records?.collection_type === 'digital'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {track.records?.collection_type === 'digital' ? (
                        <>
                          <HardDrive className="w-3 h-3" />
                          <span className="hidden sm:inline">Digital</span>
                        </>
                      ) : (
                        <>
                          <Disc3 className="w-3 h-3" />
                          <span className="hidden sm:inline">Vinyl</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          </div>
          
          {/* Load More Button */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={loadMore}
                disabled={loadingMore}
                className="gap-2"
              >
                {loadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading more...
                  </>
                ) : (
                  <>
                    Load More ({filteredCount - tracks.length} remaining)
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Track Detail Drawer */}
      <TrackDetailDrawer
        trackId={selectedTrackId}
        onClose={() => setSelectedTrackId(null)}
      />
    </div>
  );
}
