'use client';

/**
 * Rekordbox Import Component
 * 
 * Allows users to upload and import Rekordbox XML files
 * Shows progress and results
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';

interface ImportResult {
  success: boolean;
  result: {
    stats: {
      totalTracks: number;
      imported: number;
      matched: number;
      failed: number;
      duplicates: number;
    };
    errors: Array<{
      track: string;
      error: string;
    }>;
  };
  collectionStats: {
    totalTracks: number;
    totalDurationFormatted: string;
    tracksWithBpm: number;
    tracksWithKey: number;
    avgBpm: number;
    totalPlaylists: number;
  };
}

export function RekordboxImport() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState<string>('');
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string>('');

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.xml')) {
      setError('Please select a valid Rekordbox XML file');
      return;
    }

    setIsUploading(true);
    setError('');
    setResult(null);
    setProgress('Reading file...');

    try {
      // Read file content
      const content = await file.text();
      setProgress('Uploading and parsing...');

      // Upload to API
      const response = await fetch('/api/rekordbox/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          xmlContent: content,
          fileName: file.name,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to import');
      }

      const data = await response.json();
      setResult(data);
      setProgress('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setProgress('');
    } finally {
      setIsUploading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Import from Rekordbox</CardTitle>
          <CardDescription>
            Upload your Rekordbox XML export file to import your digital collection
            with BPM, key, cue points, and more.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Upload Section */}
          <div>
            <label htmlFor="rekordbox-file" className="cursor-pointer">
              <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors">
                <div className="text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="mt-2 text-sm text-gray-600">
                    <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Rekordbox XML file</p>
                </div>
              </div>
              <input
                id="rekordbox-file"
                type="file"
                accept=".xml"
                className="hidden"
                onChange={handleFileSelect}
                disabled={isUploading}
              />
            </label>
          </div>

          {/* How to Export */}
          <details className="text-sm text-gray-600">
            <summary className="cursor-pointer font-medium hover:text-gray-900">
              How to export from Rekordbox?
            </summary>
            <ol className="mt-2 ml-4 space-y-1 list-decimal">
              <li>Open Rekordbox</li>
              <li>Go to File → Export Collection in xml format</li>
              <li>Choose a location to save the file</li>
              <li>Upload the exported XML file here</li>
            </ol>
          </details>

          {/* Progress */}
          {progress && (
            <Alert>
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full" />
                <span>{progress}</span>
              </div>
            </Alert>
          )}

          {/* Error */}
          {error && (
            <Alert variant="destructive">
              <strong>Error:</strong> {error}
            </Alert>
          )}

          {/* Success Result */}
          {result && (
            <div className="space-y-4">
              <Alert>
                <strong>✓ Import Complete!</strong>
              </Alert>

              {/* Collection Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Collection Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <dt className="font-medium text-gray-500">Total Tracks</dt>
                      <dd className="text-2xl font-bold">{result.collectionStats.totalTracks}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-500">Total Duration</dt>
                      <dd className="text-2xl font-bold">{result.collectionStats.totalDurationFormatted}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-500">Tracks with BPM</dt>
                      <dd className="text-xl font-semibold text-green-600">
                        {result.collectionStats.tracksWithBpm}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-500">Tracks with Key</dt>
                      <dd className="text-xl font-semibold text-green-600">
                        {result.collectionStats.tracksWithKey}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-500">Average BPM</dt>
                      <dd className="text-xl font-semibold">{result.collectionStats.avgBpm}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-500">Playlists</dt>
                      <dd className="text-xl font-semibold">{result.collectionStats.totalPlaylists}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              {/* Import Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Import Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <dt className="font-medium text-gray-500">New Tracks Imported</dt>
                      <dd className="text-xl font-semibold text-blue-600">
                        {result.result.stats.imported}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-500">Matched to Existing</dt>
                      <dd className="text-xl font-semibold text-purple-600">
                        {result.result.stats.matched}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-500">Duplicates Skipped</dt>
                      <dd className="text-xl font-semibold text-gray-600">
                        {result.result.stats.duplicates}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-medium text-gray-500">Failed</dt>
                      <dd className="text-xl font-semibold text-red-600">
                        {result.result.stats.failed}
                      </dd>
                    </div>
                  </dl>

                  {/* Errors */}
                  {result.result.errors.length > 0 && (
                    <details className="mt-4">
                      <summary className="cursor-pointer font-medium text-red-600">
                        View Errors ({result.result.errors.length})
                      </summary>
                      <ul className="mt-2 space-y-2 text-sm">
                        {result.result.errors.map((err, idx) => (
                          <li key={idx} className="p-2 bg-red-50 rounded">
                            <strong>{err.track}</strong>: {err.error}
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button onClick={() => window.location.href = '/dashboard/collection'}>
                  View Collection
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setResult(null)}
                >
                  Import Another File
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">What gets imported?</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600">
            <ul className="space-y-1 list-disc list-inside">
              <li>Track metadata (title, artist, album)</li>
              <li>BPM and musical key</li>
              <li>Cue points and hot cues</li>
              <li>Track ratings and comments</li>
              <li>Play counts and playlists</li>
              <li>File format and quality info</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Smart Matching</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-600">
            <p>
              If you have the same track in both vinyl and digital format, we'll automatically
              match them and enrich your vinyl collection with BPM and key data from your
              digital files.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

