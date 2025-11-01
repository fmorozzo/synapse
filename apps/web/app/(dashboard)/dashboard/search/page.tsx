import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export default function SearchPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Search Discogs</h1>
        <p className="text-muted-foreground">
          Search millions of releases from the Discogs database
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search for Music</CardTitle>
          <CardDescription>
            Search by artist, album, label, or catalog number
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Search for albums, artists, labels..."
              className="flex-1"
            />
            <Button className="gap-2">
              <Search className="w-4 h-4" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12 text-muted-foreground">
            Enter a search query to find releases
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

