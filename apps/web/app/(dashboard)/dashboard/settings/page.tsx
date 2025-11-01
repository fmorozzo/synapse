'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { User, Music2, CheckCircle, ExternalLink, Link as LinkIcon, XCircle } from 'lucide-react';

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Profile state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  
  // Discogs state
  const [discogsUsername, setDiscogsUsername] = useState('');
  const [discogsConnected, setDiscogsConnected] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);

  useEffect(() => {
    loadProfile();
    
    // Check for OAuth callback status
    const discogsStatus = searchParams.get('discogs');
    const errorParam = searchParams.get('error');
    const errorDetails = searchParams.get('details');
    
    if (discogsStatus === 'connected') {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } else if (errorParam) {
      const errorMessage = errorDetails 
        ? `Failed to connect to Discogs: ${errorDetails}` 
        : 'Failed to connect to Discogs. Please try again.';
      setError(errorMessage);
      setTimeout(() => setError(''), 10000);
    }
  }, [searchParams]);

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

  function handleConnectDiscogs() {
    // Redirect to OAuth initiation endpoint
    window.location.href = '/api/discogs/oauth/initiate';
  }

  async function handleDisconnectDiscogs() {
    if (!confirm('Are you sure you want to disconnect your Discogs account?')) {
      return;
    }

    setError('');
    setDisconnecting(true);

    try {
      const response = await fetch('/api/discogs/oauth/disconnect', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to disconnect Discogs');
      }

      setDiscogsConnected(false);
      setDiscogsUsername('');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDisconnecting(false);
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
                Connect your Discogs account to import and sync your collection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {!discogsConnected ? (
                // Not Connected State
                <>
                  <Alert className="bg-blue-50 border-blue-200">
                    <LinkIcon className="h-4 w-4 text-blue-600" />
                    <AlertTitle className="text-blue-900">Quick & Secure Connection</AlertTitle>
                    <AlertDescription className="text-blue-800">
                      Click the button below to securely connect your Discogs account. You'll be redirected to Discogs to authorize this app, then brought back here automatically.
                    </AlertDescription>
                  </Alert>

                  <div className="flex flex-col items-center justify-center py-8 px-4 space-y-6">
                    <div className="text-center space-y-2">
                      <Music2 className="w-16 h-16 text-muted-foreground mx-auto" />
                      <h3 className="text-xl font-semibold">Connect to Discogs</h3>
                      <p className="text-muted-foreground max-w-md">
                        Link your Discogs account to import your collection, sync your wantlist, and get personalized recommendations.
                      </p>
                    </div>

                    <Button 
                      size="lg" 
                      onClick={handleConnectDiscogs}
                      className="gap-2"
                    >
                      <LinkIcon className="w-4 h-4" />
                      Connect with Discogs
                    </Button>

                    <div className="text-sm text-muted-foreground text-center max-w-md">
                      <p>
                        Don't have a Discogs account?{' '}
                        <a 
                          href="https://www.discogs.com/users/create" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:underline font-medium"
                        >
                          Create one free
                          <ExternalLink className="w-3 h-3 inline ml-1" />
                        </a>
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">What you'll be able to do:</h4>
                    <ul className="text-sm text-muted-foreground space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Import your entire Discogs collection with one click</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Sync your wantlist and track new additions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Get AI-powered insights about your music taste</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>Search and browse your collection offline</span>
                      </li>
                    </ul>
                  </div>
                </>
              ) : (
                // Connected State
                <>
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertTitle className="text-green-900">Successfully Connected!</AlertTitle>
                    <AlertDescription className="text-green-800">
                      Your Discogs account is linked and ready to use.
                    </AlertDescription>
                  </Alert>

                  <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center">
                        <Music2 className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">Connected Account</p>
                        <p className="text-sm text-muted-foreground">
                          {discogsUsername}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDisconnectDiscogs}
                      disabled={disconnecting}
                      className="gap-2"
                    >
                      <XCircle className="w-4 h-4" />
                      {disconnecting ? 'Disconnecting...' : 'Disconnect'}
                    </Button>
                  </div>

                  <Separator />

                  <div className="bg-muted p-4 rounded-lg space-y-3">
                    <h4 className="font-medium">What's Next?</h4>
                    <p className="text-sm text-muted-foreground">
                      Now that your Discogs account is connected, you can:
                    </p>
                    <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-2">
                      <li>Import your Discogs collection to Synapse</li>
                      <li>Sync your wantlist automatically</li>
                      <li>Search and browse your collection offline</li>
                      <li>Get AI-powered recommendations based on your taste</li>
                    </ul>
                    <div className="pt-2">
                      <Button 
                        variant="default" 
                        onClick={() => window.location.href = '/dashboard/collection'}
                        className="gap-2"
                      >
                        Go to Collection
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

