# Server-Side Filtering & Collection Improvements

## 🎯 Overview

This guide documents the server-side filtering improvements to the collection page, addressing the 1000-record limitation and improving performance.

---

## ✅ What Changed

### 1. **Server-Side Filtering (Fixed 1000 Record Limit)**

**Before:** All records were loaded client-side (max 1000 due to Supabase default limit), then filtered in the browser.

**After:** Filtering, sorting, and genre matching happen server-side, supporting up to **10,000 records** with proper database queries.

```typescript
// API now supports query parameters
GET /api/records?source=discogs&genres=House,Techno&genreMode=any&sortBy=artist&sortOrder=asc
```

### 2. **Default to Discogs (Vinyl Collection)**

- **Source filter now defaults to `discogs`** instead of "All"
- Aligns with the primary use case: browsing physical vinyl collection
- Users can easily toggle to view "All" or "Rekordbox" digital tracks

### 3. **Genre Filter: AND/OR Mode**

Added toggle to control genre matching logic:

- **Match ANY**: Records with at least one of the selected genres (inclusive, OR logic)
- **Match ALL**: Records that have all selected genres (exclusive, AND logic)

```typescript
// Database query uses proper PostgreSQL operators
genreMode === 'all' 
  ? dbQuery.contains('genres', genres)      // ALL genres must match
  : dbQuery.overlaps('genres', genres)      // ANY genre can match
```

### 4. **Improved Performance**

- Supabase handles filtering, sorting, and genre matching
- Only matching records are returned (not all 8,000+)
- Pagination-ready architecture (can add infinite scroll later)
- Source counts are fetched once on mount

---

## 🗄️ Database Query Features

### Supported Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `source` | `all \| discogs \| rekordbox` | `discogs` | Filter by import source |
| `genres` | `string` (comma-separated) | - | Filter by genres (e.g., `House,Techno`) |
| `genreMode` | `any \| all` | `any` | Genre matching logic (OR vs AND) |
| `sortBy` | `album \| artist \| year \| dateAdded` | `dateAdded` | Sort field |
| `sortOrder` | `asc \| desc` | `desc` | Sort order |

### Example Queries

```bash
# Get all Discogs vinyl records
GET /api/records?source=discogs

# Get records with House OR Techno
GET /api/records?genres=House,Techno&genreMode=any

# Get records with BOTH House AND Techno
GET /api/records?genres=House,Techno&genreMode=all

# Get Discogs records, sorted by artist A-Z
GET /api/records?source=discogs&sortBy=artist&sortOrder=asc
```

---

## 📊 UI/UX Improvements

### 1. **Source Filter Buttons**

```tsx
<Button variant={sourceFilter === 'discogs' ? 'default' : 'outline'}>
  <Disc3 className="w-4 h-4" />
  Discogs ({sourceCounts.discogs})
</Button>
```

- Shows counts for each source
- Icons: 🔵 Disc3 (Discogs), 💿 HardDrive (Rekordbox)
- Default selected: **Discogs**

### 2. **Genre Filter with AND/OR Toggle**

When 2+ genres are selected, a toggle appears:

```tsx
{selectedGenres.length > 1 && (
  <div className="flex gap-1">
    <Button variant={genreMode === 'any' ? 'default' : 'outline'}>
      Match ANY
    </Button>
    <Button variant={genreMode === 'all' ? 'default' : 'outline'}>
      Match ALL
    </Button>
  </div>
)}
```

**Use Cases:**
- **Match ANY**: Find all records that are "House" or "Techno" (broader search)
- **Match ALL**: Find records that are both "House" AND "Electronic" (narrower, specific)

### 3. **Reset Filters Button**

- Resets to **Discogs** (not "All")
- Clears all genre selections
- Resets genre mode to "ANY"

---

## 🔧 Technical Implementation

### Backend: `/api/records/route.ts`

```typescript
export async function GET(request: NextRequest) {
  const sourceFilter = searchParams.get('source') || 'discogs';
  const genres = searchParams.get('genres')?.split(',').filter(Boolean) || [];
  const genreMode = searchParams.get('genreMode') || 'any';

  let dbQuery = supabase
    .from('records')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .limit(10000); // Increased from default 1000

  // Filter by source
  if (sourceFilter !== 'all') {
    dbQuery = dbQuery.eq('import_source', sourceFilter);
  }

  // Filter by genres
  if (genres.length > 0) {
    if (genreMode === 'all') {
      dbQuery = dbQuery.contains('genres', genres); // AND logic
    } else {
      dbQuery = dbQuery.overlaps('genres', genres); // OR logic
    }
  }

  return NextResponse.json({ 
    records: data,
    count: count || 0,
    hasMore: (count || 0) > 10000
  });
}
```

### Frontend: `collection/page.tsx`

```typescript
// Filters change → triggers useEffect → server-side query
useEffect(() => {
  loadCollection();
}, [sourceFilter, sortBy, sortOrder, selectedGenres, genreMode]);

async function loadCollection() {
  const params = new URLSearchParams();
  params.append('source', sourceFilter);
  params.append('sortBy', sortBy);
  if (selectedGenres.length > 0) {
    params.append('genres', selectedGenres.join(','));
    params.append('genreMode', genreMode);
  }
  
  const response = await fetch(`/api/records?${params.toString()}`);
  const data = await response.json();
  setRecords(data.records);
  setTotalCount(data.count);
}
```

---

## ❓ Cover Art from Rekordbox XML

**Question:** Can we extract cover art from Rekordbox XML files?

**Answer:** ❌ **NO**

Rekordbox XML files contain:
- ✅ Track metadata (BPM, key, artist, title)
- ✅ File paths
- ✅ Cue points, beatgrids, waveforms
- ❌ **NO cover art images**

### Why Not?

1. **Cover art is stored separately** with the audio files (embedded in MP3/FLAC metadata)
2. XML only has references/paths, not binary image data
3. File sizes would be massive if images were included

### Solutions for Cover Art

1. **Spotify API** (implemented): Fetch album art via search
2. **MusicBrainz API**: Open-source alternative
3. **File extraction**: Read from audio file metadata (requires file access - complex)
4. **Manual upload**: Allow users to upload images

Currently, we have the Spotify API solution available:

```typescript
// apps/web/lib/spotify/cover-art.ts
export async function fetchCoverArtForRecord(record: Record)

// apps/web/app/api/records/fetch-cover-art/route.ts
POST /api/records/fetch-cover-art
```

---

## 📝 Testing Checklist

- [x] API returns correct records for `source=discogs`
- [x] API defaults to `discogs` when no source specified
- [x] Genre filter with "Match ANY" returns inclusive results
- [x] Genre filter with "Match ALL" returns exclusive results
- [x] Sorting by album/artist/year/dateAdded works correctly
- [x] Source counts display correctly on mount
- [x] "Reset Filters" returns to Discogs default
- [x] Handles empty genre arrays gracefully
- [x] UI shows "Showing X of Y records" correctly
- [x] No 1000-record limitation

---

## 🚀 Future Enhancements

### 1. Infinite Scroll

Instead of loading 10,000 records at once, implement pagination:

```typescript
GET /api/records?source=discogs&page=1&limit=50
```

### 2. Search Across Fields

Add text search query parameter:

```typescript
GET /api/records?q=daft+punk&source=all
```

### 3. Combined Filters

Enable filtering by multiple dimensions:

```typescript
GET /api/records?source=discogs&genres=House&year=2000&format=vinyl
```

### 4. Cover Art Batch Fetching

Add a UI button to trigger:

```typescript
POST /api/records/fetch-cover-art
// Fetches missing cover art for all digital records
```

---

## 🎉 Summary

### Before
- ❌ Limited to 1000 records (client-side)
- ❌ All filtering happened in browser
- ❌ Genre filter was OR-only
- ❌ Defaulted to "All" sources

### After
- ✅ Supports up to 10,000 records
- ✅ Server-side filtering, sorting, genre matching
- ✅ Genre filter has AND/OR toggle
- ✅ Defaults to Discogs (vinyl collection)
- ✅ Performance optimized with database queries
- ✅ Pagination-ready architecture

**Result:** Faster, more scalable collection browsing with DJ-focused features! 🎧

