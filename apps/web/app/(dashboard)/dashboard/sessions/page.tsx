'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  ListMusic, 
  Plus, 
  Calendar, 
  Clock, 
  MapPin, 
  Loader2,
  Star,
  Trash2
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Session {
  id: string;
  name: string;
  description: string | null;
  session_date: string | null;
  venue: string | null;
  duration_minutes: number | null;
  status: string;
  is_favorite: boolean;
  track_count?: number;
  estimated_duration_minutes?: number;
  created_at: string;
}

export default function SessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState('');
  
  // Form state
  const [newSession, setNewSession] = useState({
    name: '',
    description: '',
    session_date: '',
    venue: '',
  });

  useEffect(() => {
    loadSessions();
  }, []);

  async function loadSessions() {
    try {
      setLoading(true);
      const response = await fetch('/api/sessions');
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      }
    } catch (err) {
      console.error('Failed to load sessions:', err);
      setError('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateSession() {
    if (!newSession.name.trim()) {
      setError('Session name is required');
      return;
    }

    try {
      setCreating(true);
      setError('');
      
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSession.name,
          description: newSession.description || null,
          session_date: newSession.session_date || null,
          venue: newSession.venue || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create session');
      }

      const data = await response.json();
      
      // Reset form and close dialog
      setNewSession({ name: '', description: '', session_date: '', venue: '' });
      setDialogOpen(false);
      
      // Reload sessions
      await loadSessions();
      
      // Navigate to the new session
      router.push(`/dashboard/sessions/${data.session.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  }

  async function handleDeleteSession(id: string) {
    if (!confirm('Are you sure you want to delete this session?')) return;

    try {
      const response = await fetch(`/api/sessions/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadSessions();
      }
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  }

  async function toggleFavorite(id: string, isFavorite: boolean) {
    try {
      const response = await fetch(`/api/sessions/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_favorite: !isFavorite }),
      });

      if (response.ok) {
        await loadSessions();
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  }

  function formatDate(dateString: string | null): string {
    if (!dateString) return 'No date set';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  // Group sessions by status
  const draftSessions = sessions.filter(s => s.status === 'draft');
  const plannedSessions = sessions.filter(s => s.status === 'planned');
  const completedSessions = sessions.filter(s => s.status === 'completed');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <ListMusic className="w-8 h-8" />
            Sessions
          </h1>
          <p className="text-muted-foreground">
            Create and manage your DJ sessions, playlists, and sets
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Session
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Session</DialogTitle>
              <DialogDescription>
                Create a new DJ session, playlist, or set
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Session Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Friday Night Set"
                  value={newSession.name}
                  onChange={(e) => setNewSession({ ...newSession, name: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Optional notes about this session..."
                  value={newSession.description}
                  onChange={(e) => setNewSession({ ...newSession, description: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="session_date">Date</Label>
                <Input
                  id="session_date"
                  type="datetime-local"
                  value={newSession.session_date}
                  onChange={(e) => setNewSession({ ...newSession, session_date: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="venue">Venue</Label>
                <Input
                  id="venue"
                  placeholder="e.g., Club Name"
                  value={newSession.venue}
                  onChange={(e) => setNewSession({ ...newSession, venue: e.target.value })}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateSession} disabled={creating}>
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Session'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : sessions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ListMusic className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Sessions Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first session to start building playlists and sets!
            </p>
            <Button onClick={() => setDialogOpen(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Create Your First Session
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Draft Sessions */}
          {draftSessions.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-3">Draft Sessions ({draftSessions.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {draftSessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    onDelete={handleDeleteSession}
                    onToggleFavorite={toggleFavorite}
                    onClick={() => router.push(`/dashboard/sessions/${session.id}`)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Planned Sessions */}
          {plannedSessions.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-3">Planned Sessions ({plannedSessions.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plannedSessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    onDelete={handleDeleteSession}
                    onToggleFavorite={toggleFavorite}
                    onClick={() => router.push(`/dashboard/sessions/${session.id}`)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Completed Sessions */}
          {completedSessions.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-3">Completed Sessions ({completedSessions.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completedSessions.map((session) => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    onDelete={handleDeleteSession}
                    onToggleFavorite={toggleFavorite}
                    onClick={() => router.push(`/dashboard/sessions/${session.id}`)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface SessionCardProps {
  session: Session;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string, isFavorite: boolean) => void;
  onClick: () => void;
}

function SessionCard({ session, onDelete, onToggleFavorite, onClick }: SessionCardProps) {
  function formatDate(dateString: string | null): string {
    if (!dateString) return 'No date set';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
      <div onClick={onClick}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg">{session.name}</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(session.id, session.is_favorite);
              }}
              className="h-8 w-8"
            >
              <Star
                className={`w-4 h-4 ${
                  session.is_favorite ? 'fill-yellow-400 text-yellow-400' : ''
                }`}
              />
            </Button>
          </div>
          {session.description && (
            <CardDescription className="line-clamp-2">
              {session.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            {session.session_date && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {formatDate(session.session_date)}
              </div>
            )}
            {session.venue && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {session.venue}
              </div>
            )}
            <div className="flex items-center gap-2">
              <ListMusic className="w-4 h-4" />
              {session.track_count || 0} tracks
            </div>
            {session.estimated_duration_minutes && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {Math.round(session.estimated_duration_minutes)} min
              </div>
            )}
          </div>
        </CardContent>
      </div>
      <div className="px-6 pb-4 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(session.id);
          }}
          className="text-destructive hover:text-destructive"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Delete
        </Button>
      </div>
    </Card>
  );
}

