import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Music, Database, Sparkles, Smartphone } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Synapse
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Your intelligent music collection manager
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/auth/sign-up">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/auth/sign-in">Sign In</Link>
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card>
            <CardHeader>
              <Music className="w-8 h-8 mb-2 text-purple-600" />
              <CardTitle>Discogs Integration</CardTitle>
              <CardDescription>
                Access millions of releases from the world's largest music database
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Database className="w-8 h-8 mb-2 text-blue-600" />
              <CardTitle>Collection Management</CardTitle>
              <CardDescription>
                Organize, track, and manage your music collection effortlessly
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Sparkles className="w-8 h-8 mb-2 text-pink-600" />
              <CardTitle>AI Insights</CardTitle>
              <CardDescription>
                Get personalized recommendations and collection analytics
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Smartphone className="w-8 h-8 mb-2 text-green-600" />
              <CardTitle>Multi-Platform</CardTitle>
              <CardDescription>
                Access your collection on web and mobile devices
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl text-white mb-2">
              Ready to organize your collection?
            </CardTitle>
            <CardDescription className="text-purple-100 text-lg">
              Start managing your music collection with AI-powered insights today
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild size="lg" variant="secondary">
              <Link href="/dashboard">Start Free</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

