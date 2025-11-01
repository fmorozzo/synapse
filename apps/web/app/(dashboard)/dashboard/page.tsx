import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Music, Search, Sparkles, BarChart } from 'lucide-react';

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your music collection manager
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <Music className="w-8 h-8 mb-2 text-purple-600" />
            <CardTitle>My Collection</CardTitle>
            <CardDescription>View and manage your records</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/dashboard/collection">View Collection</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <Search className="w-8 h-8 mb-2 text-blue-600" />
            <CardTitle>Search Discogs</CardTitle>
            <CardDescription>Find new releases to add</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" variant="outline">
              <Link href="/dashboard/search">Search</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <Sparkles className="w-8 h-8 mb-2 text-pink-600" />
            <CardTitle>AI Insights</CardTitle>
            <CardDescription>Get recommendations</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" variant="outline">
              <Link href="/dashboard/insights">View Insights</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader>
            <BarChart className="w-8 h-8 mb-2 text-green-600" />
            <CardTitle>Analytics</CardTitle>
            <CardDescription>Collection statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full" variant="outline">
              <Link href="/dashboard/analytics">View Stats</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity / Stats */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Collection Overview</CardTitle>
            <CardDescription>Your collection at a glance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Records</span>
                <span className="font-bold text-2xl">0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Value</span>
                <span className="font-bold text-2xl">$0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Genres</span>
                <span className="font-bold text-2xl">0</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>Quick tips to get you started</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-purple-600">•</span>
                <span>Search for releases in the Discogs database</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600">•</span>
                <span>Add records to your collection with detailed information</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600">•</span>
                <span>Get AI-powered insights and recommendations</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-purple-600">•</span>
                <span>Track your collection's value and statistics</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

