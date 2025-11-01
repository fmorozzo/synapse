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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { User, Music2, CheckCircle, ExternalLink, HelpCircle, ArrowRight } from 'lucide-react';

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
              {/* Help Section */}
              <Accordion type="single" collapsible className="w-full border rounded-lg">
                <AccordionItem value="help" className="border-none">
                  <AccordionTrigger className="px-4 hover:no-underline hover:bg-muted/50">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-purple-600" />
                      <span className="font-semibold">How to get your Discogs token (click to expand)</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-4 text-sm">
                      <Alert className="bg-blue-50 border-blue-200">
                        <AlertDescription className="text-blue-900">
                          <strong>Don't have a Discogs account?</strong> Create one first at{' '}
                          <a 
                            href="https://www.discogs.com/users/create" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="underline font-medium"
                          >
                            discogs.com/users/create
                          </a>
                        </AlertDescription>
                      </Alert>

                      <div className="space-y-3">
                        <h4 className="font-semibold text-base">Step-by-Step Guide:</h4>
                        
                        {/* Step 1 */}
                        <div className="flex gap-3 p-3 bg-muted rounded-lg">
                          <div className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            1
                          </div>
                          <div className="space-y-2 flex-1">
                            <p className="font-medium">Go to Discogs Developer Settings</p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="gap-2"
                              onClick={() => window.open('https://www.discogs.com/settings/developers', '_blank')}
                            >
                              Open Discogs Developer Settings
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                            <p className="text-xs text-muted-foreground">
                              This will open in a new tab. You may need to log in to Discogs first.
                            </p>
                          </div>
                        </div>

                        {/* Step 2 */}
                        <div className="flex gap-3 p-3 bg-muted rounded-lg">
                          <div className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            2
                          </div>
                          <div className="space-y-2 flex-1">
                            <p className="font-medium">Find "Personal Access Tokens" section</p>
                            <p className="text-muted-foreground">
                              Scroll down the page until you see the "Personal Access Tokens" heading.
                            </p>
                          </div>
                        </div>

                        {/* Step 3 */}
                        <div className="flex gap-3 p-3 bg-muted rounded-lg">
                          <div className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            3
                          </div>
                          <div className="space-y-2 flex-1">
                            <p className="font-medium">Generate a new token</p>
                            <p className="text-muted-foreground">
                              Click the <strong>"Generate new token"</strong> button.
                            </p>
                            <p className="text-muted-foreground">
                              Give it a name like: <code className="bg-background px-2 py-1 rounded">Synapse App</code>
                            </p>
                          </div>
                        </div>

                        {/* Step 4 */}
                        <div className="flex gap-3 p-3 bg-muted rounded-lg">
                          <div className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            4
                          </div>
                          <div className="space-y-2 flex-1">
                            <p className="font-medium">Copy your token</p>
                            <p className="text-muted-foreground">
                              A long string of characters will appear. Click to copy it - you'll only see this once!
                            </p>
                            <div className="bg-yellow-50 border border-yellow-200 p-2 rounded text-xs">
                              ⚠️ <strong>Important:</strong> Copy it immediately! You can't view it again later.
                            </div>
                          </div>
                        </div>

                        {/* Step 5 */}
                        <div className="flex gap-3 p-3 bg-muted rounded-lg">
                          <div className="flex-shrink-0 w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            5
                          </div>
                          <div className="space-y-2 flex-1">
                            <p className="font-medium">Get your Discogs username</p>
                            <p className="text-muted-foreground">
                              Your username is in your profile URL: <code className="bg-background px-2 py-1 rounded">discogs.com/user/YOUR_USERNAME</code>
                            </p>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="gap-2"
                              onClick={() => window.open('https://www.discogs.com/settings/profile', '_blank')}
                            >
                              View My Profile
                              <ExternalLink className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Step 6 */}
                        <div className="flex gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex-shrink-0 w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                            6
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-green-900">Paste both below and connect!</p>
                            <p className="text-green-700 text-xs mt-1">
                              Fill in the form below with your username and token, then click "Connect Discogs"
                            </p>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div className="text-xs text-muted-foreground space-y-1">
                        <p><strong>Need help?</strong> Watch this video tutorial: 
                          <a 
                            href="https://support.discogs.com/hc/en-us/articles/360009114953-How-To-Generate-A-Personal-Access-Token" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-purple-600 hover:underline ml-1"
                          >
                            Discogs Official Guide
                            <ExternalLink className="w-3 h-3 inline ml-1" />
                          </a>
                        </p>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

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

