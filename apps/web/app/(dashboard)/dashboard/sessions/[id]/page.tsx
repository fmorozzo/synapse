'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ArrowLeft,
  Loader2,
  Plus,
  Trash2,
  GripVertical,
  Search,
  Music2,
  Save,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface Track {
  id: string;
  track_id: string;
  position: number;
  notes: string | null;
  track: {
    id: string;
    title: string;
    duration_ms: number | null;
    bpm: number | null;
    key: string | null;
    song: {
      artist: string;
    };
    release: {
      title: string;
      cover_image_url: string | null;
    };
  };
}

interface Session {
  id: string;
  name: string;
  description: string | null;
  session_date: string | null;
  venue: string | null;
  status: string;
}

export default function SessionDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [draggedTrack, setDraggedTrack] = useState<Track | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSession();
  }, [params.id]);

  useEffect(() => {
    if (searchQuery.length >= 2) {
      searchTracks();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  async function loadSession() {
    try {
      setLoading(true);
      const response = await fetch(`/api/sessions/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setSession(data.session);
        setTracks(data.tracks || []);
      } else {
        setError('Failed to load session');
      }
    } catch (err) {
      console.error('Failed to load session:', err);
      setError('Failed to load session');
    } finally {
      setLoading(false);
    }
  }

  async function searchTracks() {
    try {
      const response = await fetch(`/api/tracks/search?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.tracks || []);
      }
    } catch (err) {
      console.error('Failed to search tracks:', err);
    }
  }

  async function addTrack(trackId: string) {
    try {
      const response = await fetch(`/api/sessions/${params.id}/tracks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ track_id: trackId }),
      });

      if (response.ok) {
        await loadSession();
        setSearchDialogOpen(false);
        setSearchQuery('');
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Failed to add track:', err);
      setError('Failed to add track');
    }
  }

  async function removeTrack(sessionTrackId: string) {
    if (!confirm('Remove this track from the session?')) return;

    try {
      const response = await fetch(`/api/sessions/${params.id}/tracks/${sessionTrackId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadSession();
      }
    } catch (err) {
      console.error('Failed to remove track:', err);
    }
  }

  async function saveOrder() {
    try {
      setSaving(true);
      const tracksToUpdate = tracks.map((track, index) => ({
        id: track.id,
        position: index,
      }));

      const response = await fetch(`/api/sessions/${params.id}/tracks`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tracks: tracksToUpdate }),
      });

      if (response.ok) {
        // Reload to get fresh data
        await loadSession();
      }
    } catch (err) {
      console.error('Failed to save order:', err);
      setError('Failed to save order');
    } finally {
      setSaving(false);
    }
  }

  function handleDragStart(track: Track) {
    setDraggedTrack(track);
  }

  function handleDragOver(e: React.DragEvent, targetTrack: Track) {
    e.preventDefault();
    
    if (!draggedTrack || draggedTrack.id === targetTrack.id) return;

    const newTracks = [...tracks];
    const draggedIndex = newTracks.findIndex(t => t.id === draggedTrack.id);
    const targetIndex = newTracks.findIndex(t => t.id === targetTrack.id);

    if (draggedIndex === -1 || targetIndex === -1) return;

    // Remove dragged track and insert at target position
    const [removed] = newTracks.splice(draggedIndex, 1);
    newTracks.splice(targetIndex, 0, removed);

    setTracks(newTracks);
  }

  function handleDragEnd() {
    setDraggedTrack(null);
  }

  function formatDuration(ms: number | null): string {
    if (!ms) return '-';
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  function calculateTotalDuration(): string {
    const totalMs = tracks.reduce((sum, t) => sum + (t.track.duration_ms || 0), 0);
    const minutes = Math.floor(totalMs / 60000);
    return `${minutes} min`;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-2">Session not found</h2>
        <Button onClick={() => router.push('/dashboard/sessions')}>
          Back to Sessions
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/dashboard/sessions')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{session.name}</h1>
            {session.description && (
              <p className="text-muted-foreground mt-1">{session.description}</p>
            )}
            <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
              <span>{tracks.length} tracks</span>
              <span>{calculateTotalDuration()}</span>
              {session.venue && <span>• {session.venue}</span>}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setSearchDialogOpen(true)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Track
          </Button>
          <Button
            onClick={saveOrder}
            disabled={saving}
            className="gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Order
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Track List */}
      {tracks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Music2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Tracks Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start building your session by adding tracks
            </p>
            <Button onClick={() => setSearchDialogOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Your First Track
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Track List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {tracks.map((track, index) => (
                <div
                  key={track.id}
                  draggable
                  onDragStart={() => handleDragStart(track)}
                  onDragOver={(e) => handleDragOver(e, track)}
                  onDragEnd={handleDragEnd}
                  className={`p-4 bg-muted rounded-lg flex items-center gap-4 hover:bg-muted/80 transition-colors cursor-move ${
                    draggedTrack?.id === track.id ? 'opacity-50' : ''
                  }`}
                >
                  {/* Drag Handle */}
                  <GripVertical className="w-5 h-5 text-muted-foreground flex-shrink-0" />

                  {/* Position */}
                  <div className="w-8 text-center font-semibold text-muted-foreground">
                    {index + 1}
                  </div>

                  {/* Cover Art */}
                  <div className="w-12 h-12 bg-background rounded overflow-hidden flex-shrink-0">
                    {track.track.release.cover_image_url ? (
                      <Image
                        src={track.track.release.cover_image_url}
                        alt={track.track.title}
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music2 className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Track Info */}
                  <div className="flex-1">
                    <div className="font-semibold">{track.track.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {track.track.song.artist} • {track.track.release.title}
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="flex gap-2 text-sm">
                    {track.track.bpm && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        {track.track.bpm} BPM
                      </span>
                    )}
                    {track.track.key && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                        {track.track.key}
                      </span>
                    )}
                    <span className="px-2 py-1 bg-muted-foreground/10 rounded">
                      {formatDuration(track.track.duration_ms)}
                    </span>
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTrack(track.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Dialog */}
      <Dialog open={searchDialogOpen} onOpenChange={setSearchDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Track to Session</DialogTitle>
            <DialogDescription>
              Search for tracks in your collection
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by title, artist, or album..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {searchResults.length > 0 && (
              <div className="border rounded-lg max-h-96 overflow-y-auto">
                {searchResults.map((result) => (
                  <div
                    key={result.track_id}
                    className="p-3 hover:bg-muted border-b last:border-b-0 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{result.track_title}</div>
                      <div className="text-sm text-muted-foreground">
                        {result.song_artist} • {result.release_title}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => addTrack(result.track_id)}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {searchQuery.length >= 2 && searchResults.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No tracks found
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

