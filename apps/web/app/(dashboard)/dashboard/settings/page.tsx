'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { User, Music2, CheckCircle, ExternalLink } from 'lucide-react';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Profile state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  
  // Discogs state
  const [discogsUsername, setDiscogsUsername] = useState('');
  const [discogsToken, setDiscogsToken] = useState('');
  const [discogsConnected, setDiscogsConnected] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        setFullName(data.full_name || '');
        setEmail(data.email || '');
        setDiscogsUsername(data.discogs_username || '');
        setDiscogsConnected(data.discogs_connected || false);
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveDiscogs(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          discogs_username: discogsUsername,
          discogs_token: discogsToken,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save Discogs settings');
      }

      const data = await response.json();
      setDiscogsConnected(data.discogs_connected);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and integrations
        </p>
      </div>

      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Success!</AlertTitle>
          <AlertDescription className="text-green-700">
            Your settings have been saved.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="gap-2">
            <User className="w-4 h-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="discogs" className="gap-2">
            <Music2 className="w-4 h-4" />
            Discogs Integration
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed here. Contact support if needed.
                  </p>
                </div>

                <Separator />

                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Discogs Integration Tab */}
        <TabsContent value="discogs">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Discogs Integration
                {discogsConnected && (
                  <span className="inline-flex items-center gap-1 text-sm font-normal text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    Connected
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                Connect your Discogs account to import your collection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertTitle>How to get your Discogs credentials:</AlertTitle>
                <AlertDescription className="space-y-2 mt-2">
                  <p>1. Go to your Discogs settings: 
                    <a 
                      href="https://www.discogs.com/settings/developers" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-purple-600 hover:underline ml-1"
                    >
                      Developer Settings
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </p>
                  <p>2. Click "Generate new token"</p>
                  <p>3. Copy your username and token below</p>
                </AlertDescription>
              </Alert>

              <form onSubmit={handleSaveDiscogs} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="discogsUsername">Discogs Username</Label>
                  <Input
                    id="discogsUsername"
                    value={discogsUsername}
                    onChange={(e) => setDiscogsUsername(e.target.value)}
                    placeholder="your_discogs_username"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discogsToken">Personal Access Token</Label>
                  <Textarea
                    id="discogsToken"
                    value={discogsToken}
                    onChange={(e) => setDiscogsToken(e.target.value)}
                    placeholder="Your Discogs personal access token"
                    required
                    className="font-mono text-sm"
                    rows={3}
                  />
                  <p className="text-xs text-muted-foreground">
                    Your token is stored securely and never shared.
                  </p>
                </div>

                <Separator />

                <div className="flex items-center gap-4">
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : discogsConnected ? 'Update Connection' : 'Connect Discogs'}
                  </Button>
                  
                  {discogsConnected && (
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Connected as {discogsUsername}
                    </p>
                  )}
                </div>
              </form>

              {discogsConnected && (
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <h4 className="font-medium">What's Next?</h4>
                  <p className="text-sm text-muted-foreground">
                    Now that your Discogs account is connected, you can:
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-2">
                    <li>Import your Discogs collection</li>
                    <li>Sync your want list</li>
                    <li>Search your collection</li>
                    <li>Get AI insights on your music taste</li>
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

