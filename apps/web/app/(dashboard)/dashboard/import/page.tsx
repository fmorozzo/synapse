/**
 * Import Page
 * 
 * Allows users to import their collection from various sources:
 * - Discogs (already implemented)
 * - Rekordbox
 * - Traktor (future)
 * - Serato (future)
 */

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RekordboxImport } from '@/components/imports/rekordbox-import';

export default function ImportPage() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Import Collection</h1>
        <p className="text-gray-600 mt-2">
          Import your music collection from various sources
        </p>
      </div>

      <Tabs defaultValue="rekordbox" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="discogs">Discogs</TabsTrigger>
          <TabsTrigger value="rekordbox">Rekordbox</TabsTrigger>
          <TabsTrigger value="other" disabled>Other DJ Software</TabsTrigger>
        </TabsList>

        <TabsContent value="discogs" className="mt-6">
          <div className="rounded-lg border p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Import from Discogs</h3>
            <p className="text-gray-600 mb-4">
              Connect your Discogs account to import your physical vinyl and CD collection.
            </p>
            <a 
              href="/dashboard/settings" 
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Go to Settings → Discogs Integration
            </a>
          </div>
        </TabsContent>

        <TabsContent value="rekordbox" className="mt-6">
          <RekordboxImport />
        </TabsContent>

        <TabsContent value="other" className="mt-6">
          <div className="rounded-lg border p-6 text-center">
            <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
            <p className="text-gray-600">
              Support for Traktor, Serato, and Denon Engine Prime is coming soon!
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

