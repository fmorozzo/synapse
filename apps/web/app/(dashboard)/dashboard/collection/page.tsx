'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Plus, Download, Music2, CheckCircle, Loader2, Disc3, HardDrive, Disc } from 'lucide-react';
import Image from 'next/image';
import { AlbumDetailDrawer } from '@/components/albums/album-detail-drawer';

interface Record {
  id: string;
  title: string;
  artist: string;
  year: number | null;
  format: string | null;
  cover_image_url: string | null;
  genres: string[] | null;
  label: string | null;
  collection_type: 'physical' | 'digital';
  import_source: string;
  file_format: string | null;
}

type SourceFilter = 'all' | 'discogs' | 'rekordbox';
type SortBy = 'album' | 'artist' | 'year' | 'dateAdded';
type GenreMode = 'any' | 'all';

export default function CollectionPage() {
  const [records, setRecords] = useState<Record[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [importStats, setImportStats] = useState<any>(null);
  const [error, setError] = useState('');
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('discogs'); // Default to discogs
  const [sortBy, setSortBy] = useState<SortBy>('dateAdded');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [genreMode, setGenreMode] = useState<GenreMode>('any'); // 'any' or 'all'
  const [allGenres, setAllGenres] = useState<string[]>([]);

  // Load collection when filters change
  useEffect(() => {
    loadCollection();
  }, [sourceFilter, sortBy, sortOrder, selectedGenres, genreMode]);

  async function loadCollection() {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams();
      params.append('source', sourceFilter);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);
      if (selectedGenres.length > 0) {
        params.append('genres', selectedGenres.join(','));
        params.append('genreMode', genreMode);
      }
      
      const response = await fetch(`/api/records?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setRecords(data.records || []);
        setTotalCount(data.count || 0);
        
        // Extract unique genres from all records
        const genres = Array.from(
          new Set(data.records.flatMap((r: Record) => r.genres || []))
        ).sort() as string[];
        setAllGenres(genres);
      }
    } catch (err) {
      console.error('Failed to load collection:', err);
      setError('Failed to load collection');
    } finally {
      setLoading(false);
    }
  }

  async function handleImportFromDiscogs() {
    try {
      setImporting(true);
      setError('');
      setImportSuccess(false);

      const response = await fetch('/api/discogs/import-collection', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import collection');
      }

      setImportSuccess(true);
      setImportStats(data.statistics);
      
      // Reload collection after import
      await loadCollection();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setImporting(false);
    }
  }

  // Fetch source counts (these will be shown in the buttons)
  const [sourceCounts, setSourceCounts] = useState({
    all: 0,
    discogs: 0,
    rekordbox: 0,
  });

  // Load source counts on mount
  useEffect(() => {
    async function loadSourceCounts() {
      try {
        // Fetch all records count
        const allResponse = await fetch('/api/records?source=all');
        const allData = await allResponse.json();
        
        // Fetch discogs count
        const discogsResponse = await fetch('/api/records?source=discogs');
        const discogsData = await discogsResponse.json();
        
        // Fetch rekordbox count
        const rekordboxResponse = await fetch('/api/records?source=rekordbox');
        const rekordboxData = await rekordboxResponse.json();
        
        setSourceCounts({
          all: allData.count || 0,
          discogs: discogsData.count || 0,
          rekordbox: rekordboxData.count || 0,
        });
      } catch (err) {
        console.error('Failed to load source counts:', err);
      }
    }
    loadSourceCounts();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Collection</h1>
          <p className="text-muted-foreground">
            {loading ? 'Loading...' : records.length > 0
              ? `Showing ${records.length} of ${totalCount} records`
              : totalCount > 0 
                ? 'No records match your filters'
                : 'Manage and organize your music collection'
            }
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={handleImportFromDiscogs}
            disabled={importing}
          >
            {importing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Import from Discogs
              </>
            )}
          </Button>
          <Button className="gap-2" onClick={() => window.location.href = '/dashboard/search'}>
            <Plus className="w-4 h-4" />
            Add Record
          </Button>
        </div>
      </div>

      {importSuccess && importStats && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Import Completed!</AlertTitle>
          <AlertDescription className="text-green-700">
            Successfully imported {importStats.imported} releases
            {importStats.tracksCreated > 0 && ` with ${importStats.tracksCreated} tracks`}. 
            {importStats.skipped > 0 && ` ${importStats.skipped} already existed.`}
            {importStats.errors > 0 && ` ${importStats.errors} errors.`}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters & Sorting */}
      {records.length > 0 && (
        <Card>
          <CardContent className="p-4 space-y-4">
            {/* Source Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Source</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={sourceFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSourceFilter('all')}
                >
                  All ({sourceCounts.all})
                </Button>
                
                {sourceCounts.discogs > 0 && (
                  <Button
                    variant={sourceFilter === 'discogs' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSourceFilter('discogs')}
                    className="gap-2"
                  >
                    <Disc3 className="w-4 h-4" />
                    Discogs ({sourceCounts.discogs})
                  </Button>
                )}
                
                {sourceCounts.rekordbox > 0 && (
                  <Button
                    variant={sourceFilter === 'rekordbox' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSourceFilter('rekordbox')}
                    className="gap-2"
                  >
                    <HardDrive className="w-4 h-4" />
                    Rekordbox ({sourceCounts.rekordbox})
                  </Button>
                )}
              </div>
            </div>

            {/* Genre Filter */}
            {allGenres.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium">Genre</label>
                  {selectedGenres.length > 1 && (
                    <div className="flex gap-1">
                      <Button
                        variant={genreMode === 'any' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setGenreMode('any')}
                        className="h-6 text-xs px-2"
                      >
                        Match ANY
                      </Button>
                      <Button
                        variant={genreMode === 'all' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setGenreMode('all')}
                        className="h-6 text-xs px-2"
                      >
                        Match ALL
                      </Button>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {allGenres.slice(0, 20).map(genre => (
                    <Button
                      key={genre}
                      variant={selectedGenres.includes(genre) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setSelectedGenres(prev =>
                          prev.includes(genre)
                            ? prev.filter(g => g !== genre)
                            : [...prev, genre]
                        );
                      }}
                    >
                      {genre}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Sort Controls */}
            <div>
              <label className="text-sm font-medium mb-2 block">Sort by</label>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={sortBy === 'album' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('album')}
                >
                  Album
                </Button>
                <Button
                  variant={sortBy === 'artist' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('artist')}
                >
                  Artist
                </Button>
                <Button
                  variant={sortBy === 'year' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSortBy('year')}
                >
                  Year
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
            </div>

            {/* Clear Filters */}
            {(sourceFilter !== 'discogs' || selectedGenres.length > 0) && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setSourceFilter('discogs');
                  setSelectedGenres([]);
                  setGenreMode('any');
                }}
              >
                Reset Filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : records.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Your Records</CardTitle>
            <CardDescription>
              You haven't added any records yet. Import from Discogs or search for releases!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 space-y-4">
              <Music2 className="w-16 h-16 text-muted-foreground mx-auto" />
              <p className="text-muted-foreground mb-4">
                Your collection is empty
              </p>
              <div className="flex gap-2 justify-center">
                <Button 
                  variant="default" 
                  onClick={handleImportFromDiscogs}
                  disabled={importing}
                  className="gap-2"
                >
                  {importing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      Import from Discogs
                    </>
                  )}
                </Button>
                <Button variant="outline" asChild>
                  <a href="/dashboard/search">Search for Records</a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : records.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Music2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No records match your filters.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4"
                onClick={() => {
                  setSourceFilter('discogs');
                  setSelectedGenres([]);
                  setGenreMode('any');
                }}
              >
                Reset Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {records.map((record) => (
            <Card 
              key={record.id} 
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedAlbumId(record.id)}
            >
              <div className="aspect-square relative bg-muted">
                {record.cover_image_url ? (
                  <Image
                    src={record.cover_image_url}
                    alt={record.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Music2 className="w-12 h-12 text-muted-foreground" />
                  </div>
                )}
                
                {/* Format Badge */}
                <div className="absolute top-2 right-2">
                  <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${
                    record.collection_type === 'digital' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {record.collection_type === 'digital' ? (
                      <>
                        <HardDrive className="w-3 h-3" />
                        Digital
                      </>
                    ) : (
                      <>
                        <Disc3 className="w-3 h-3" />
                        Physical
                      </>
                    )}
                  </span>
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="font-semibold line-clamp-1 mb-1">{record.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                  {record.artist}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {record.year && <span>{record.year}</span>}
                  {record.year && record.format && <span>•</span>}
                  {record.format && <span>{record.format}</span>}
                </div>
                {record.genres && record.genres.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {record.genres.slice(0, 2).map((genre) => (
                      <span
                        key={genre}
                        className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Album Detail Drawer */}
      <AlbumDetailDrawer
        albumId={selectedAlbumId}
        onClose={() => setSelectedAlbumId(null)}
      />
    </div>
  );
}

