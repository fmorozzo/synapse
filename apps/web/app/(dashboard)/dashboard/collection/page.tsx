'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Plus, Download, Music2, CheckCircle, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface Record {
  id: string;
  title: string;
  artist: string;
  year: number | null;
  format: string | null;
  cover_image_url: string | null;
  genres: string[] | null;
  label: string | null;
}

export default function CollectionPage() {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [importStats, setImportStats] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCollection();
  }, []);

  async function loadCollection() {
    try {
      setLoading(true);
      const response = await fetch('/api/records');
      if (response.ok) {
        const data = await response.json();
        setRecords(data.records || []);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Collection</h1>
          <p className="text-muted-foreground">
            {records.length > 0 
              ? `${records.length} record${records.length !== 1 ? 's' : ''} in your collection`
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
            Successfully imported {importStats.imported} records. 
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
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {records.map((record) => (
            <Card key={record.id} className="overflow-hidden hover:shadow-lg transition-shadow">
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
    </div>
  );
}

