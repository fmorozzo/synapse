import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function CollectionPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">My Collection</h1>
          <p className="text-muted-foreground">
            Manage and organize your music collection
          </p>
        </div>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Record
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Records</CardTitle>
          <CardDescription>
            You haven't added any records yet. Start by searching for releases!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              Your collection is empty
            </p>
            <Button asChild variant="outline">
              <a href="/dashboard/search">Search for Records</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

