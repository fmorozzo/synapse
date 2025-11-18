# Tracks Page Improvements

## 🎯 Overview

This guide documents the comprehensive improvements made to the Tracks page, including removal of the 1000-track limitation, enhanced track display, and an interactive track detail drawer.

---

## ✅ What Changed

### 1. **Removed 1000 Track Limitation**

**Before:** Tracks API had no explicit limit, but large collections could be problematic.

**After:** Explicitly set to **10,000 tracks** with proper count tracking:

```typescript
// apps/web/app/api/tracks/all/route.ts
.select('*', { count: 'exact' })
.limit(10000)

// Returns:
{
  tracks: [...],
  count: 450,           // Filtered count
  totalCount: 8094,     // Total user tracks
  hasMore: false
}
```

### 2. **Enhanced Track Display**

Each track now shows:

#### ✅ **Cover Art**
- Album cover image when available
- Fallback music icon for tracks without cover art
- 56x56px rounded display

#### ✅ **Metadata Display**
- **BPM**: Displayed in monospace font
- **Key**: Camelot notation (e.g., "5A", "10B")
- **Label**: Record label name
- **Genres**: First 2 genres as purple badges
- **Year/Era**: Release year
- **Format**: Vinyl (green) or Digital (blue) badge with icon

#### ✅ **Visual Layout**

```
┌─────────────────────────────────────────────────────────────────┐
│ [Cover]  Artist - Track Name                  BPM  Key  Format │
│          Album • Label                         125   5A  Vinyl  │
│          [Genre] [Genre] 1982                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 3. **Track Detail Drawer**

**New Component:** `TrackDetailDrawer` (similar to `AlbumDetailDrawer`)

#### Features:

##### 📊 **Track Information Card**
- Large cover art display
- Album name
- Record label
- BPM, Key, Year
- Format indicator (Vinyl/Digital)
- Full genre list with badges

##### 🔗 **Related Tracks**
- Shows all manually created track transitions
- Rating system (thumbs up/down)
- Quick delete transition
- Empty state with helpful message

##### ➕ **Add Transitions**
- Search for tracks to connect
- Real-time search results
- Quick add with "+" button
- Clears search after adding

##### ✨ **AI Recommendations**
- Smart track recommendations based on:
  - BPM compatibility (±6% pitch range)
  - Harmonic key matching (Camelot wheel)
  - Genre similarity
  - Era/style matching
- Shows match reason and score
- Quick add to transitions
- Cover art preview
- Format indicators

#### Opening the Drawer

**Simply click any track card** → Drawer slides in from the right

---

## 🎨 UI/UX Improvements

### Cover Art Display

**Before:**
```tsx
// Black circle placeholder
<Play className="w-4 h-4" />
```

**After:**
```tsx
{track.records?.cover_image_url ? (
  <Image
    src={track.records.cover_image_url}
    alt={track.title}
    width={56}
    height={56}
  />
) : (
  <Music2 className="w-6 h-6 text-muted-foreground" />
)}
```

### Format Badges

Now show both **icon** and **text** (responsive):

```tsx
{track.records?.collection_type === 'digital' ? (
  <>
    <HardDrive className="w-3 h-3" />
    <span className="hidden sm:inline">Digital</span>
  </>
) : (
  <>
    <Disc3 className="w-3 h-3" />
    <span className="hidden sm:inline">Vinyl</span>
  </>
)}
```

### Genre Tags

First 2 genres displayed inline with track info:

```tsx
{track.songs.genres.slice(0, 2).map((genre) => (
  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
    {genre}
  </span>
))}
```

### Clickable Tracks

All track cards are now interactive:

```tsx
<Card 
  className="hover:bg-accent/50 transition-colors cursor-pointer"
  onClick={() => setSelectedTrackId(track.id)}
>
```

---

## 🔧 Technical Implementation

### Frontend: `tracks/page.tsx`

```typescript
export default function TracksPage() {
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  async function loadTracks() {
    const data = await response.json();
    setTracks(data.tracks || []);
    setTotalCount(data.totalCount || data.tracks?.length || 0);
  }

  return (
    <>
      {/* Track List */}
      {filteredTracks.map((track) => (
        <Card onClick={() => setSelectedTrackId(track.id)}>
          {/* Cover Art, Info, BPM, Key, Format */}
        </Card>
      ))}

      {/* Drawer */}
      <TrackDetailDrawer
        trackId={selectedTrackId}
        onClose={() => setSelectedTrackId(null)}
      />
    </>
  );
}
```

### Backend: `api/tracks/all/route.ts`

```typescript
let query = supabase
  .from('user_tracks')
  .select(`
    tracks (
      bpm, key, camelot_key,
      songs ( artist, genres ),
      records ( 
        cover_image_url, 
        label, 
        year, 
        collection_type 
      )
    )
  `, { count: 'exact' })
  .limit(10000);

return NextResponse.json({
  tracks,
  count: tracks.length,         // After filters
  totalCount: count || 0,        // Before filters
  hasMore: (count || 0) > 10000
});
```

### Track Detail Drawer: `track-detail-drawer.tsx`

```typescript
export function TrackDetailDrawer({ trackId, onClose }) {
  const [track, setTrack] = useState<any>(null);
  const [relatedTracks, setRelatedTracks] = useState<RelatedTrack[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    if (trackId) {
      loadTrackDetails();
      loadRelatedTracks();
      loadRecommendations();
    }
  }, [trackId]);

  async function createTransition(toTrackId: string) {
    await fetch('/api/tracks/transitions', {
      method: 'POST',
      body: JSON.stringify({ from_track_id: trackId, to_track_id: toTrackId })
    });
    await loadRelatedTracks();
  }

  return (
    <div className="fixed right-0 top-0 h-full w-full md:w-[600px]">
      {/* Track Info Card */}
      {/* Related Tracks */}
      {/* Search & Add */}
      {/* AI Recommendations */}
    </div>
  );
}
```

---

## 📋 Track Information Display

### Required Data

Each track card displays:

| Field | Source | Display | Example |
|-------|--------|---------|---------|
| **Cover Art** | `records.cover_image_url` | 56x56px image | ![album] |
| **Artist** | `songs.artist` | Bold text | "Daft Punk" |
| **Track Title** | `tracks.title` | Bold text | "One More Time" |
| **Album** | `records.title` | Muted text | "Discovery" |
| **Label** | `records.label` | Muted text | "Virgin Records" |
| **Genres** | `songs.genres` | Purple badges | [House] [French] |
| **Year** | `records.year` | Muted text | "2001" |
| **BPM** | `tracks.bpm` | Monospace | "123" |
| **Key** | `tracks.camelot_key` | Monospace | "5A" |
| **Format** | `records.collection_type` | Badge | 🔵 Digital |

### Format Detection

**Vinyl (Physical):**
- Green badge
- `<Disc3>` icon
- Condition: `collection_type === 'physical'` OR `format.includes('vinyl')`

**Digital:**
- Blue badge
- `<HardDrive>` icon
- Condition: `collection_type === 'digital'`

**Both (Future):**
When a track exists in both formats, show both badges side-by-side.

---

## 🎵 Track Detail Drawer Sections

### 1. Header
- Track title
- Artist name
- Close button

### 2. Track Info Card
```
┌─────────────────────────────────┐
│ [Cover]  Album Name             │
│          Label Name             │
│                                 │
│  125   5A   2001   [Vinyl]     │
│  BPM  Key   Year   Format      │
│                                 │
│ Genres: [House] [Electronic]   │
└─────────────────────────────────┘
```

### 3. Related Tracks
- List of manually created transitions
- Rating buttons (👍/👎)
- Delete transition button
- Shows BPM and Key for each

### 4. Add Transition (Search)
- Input field: "Search for a track to connect..."
- Live search results (min 2 chars)
- Quick add with "+" button
- Clears on successful add

### 5. AI Recommendations
- Smart suggestions based on:
  - BPM compatibility
  - Harmonic key matching
  - Genre similarity
  - Year/era
- Each recommendation shows:
  - Cover art
  - Artist - Track
  - Album • Label
  - BPM, Key, Format
  - Match reason (e.g., "Harmonic match, similar tempo")
  - Quick add button

---

## 🚀 API Endpoints Used

### Existing Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/tracks/all` | GET | Fetch all user tracks with filters |
| `/api/tracks/{id}` | GET | Get single track details |
| `/api/tracks/{id}/related` | GET | Get related tracks (transitions) |
| `/api/tracks/{id}/recommendations-v2` | GET | Get AI recommendations |
| `/api/tracks/search?q=...` | GET | Search tracks for adding transitions |
| `/api/tracks/transitions` | POST | Create new transition |
| `/api/tracks/transitions/{id}` | DELETE | Delete transition |
| `/api/tracks/transitions/{id}` | PATCH | Update transition rating |

---

## 📊 Example Use Cases

### Use Case 1: Browsing Vinyl Collection

1. User opens Tracks page
2. Filters by "Vinyl" format
3. Filters by "House" genre
4. Sees all vinyl house tracks with cover art
5. Clicks a track → Drawer opens
6. Views track details, BPM, Key
7. Sees AI recommendations for mixing

### Use Case 2: Building a DJ Set

1. User searches for "techno"
2. Clicks a 128 BPM track
3. Drawer shows related tracks
4. AI recommends harmonically compatible tracks
5. User adds transitions by clicking "+"
6. Builds a complete transition graph

### Use Case 3: Exploring Digital Collection

1. User filters by "Digital" format
2. Sorts by BPM (ascending)
3. Views tracks with proper cover art
4. Identifies tracks without cover art (music icon)
5. Can trigger cover art fetching (future feature)

---

## ❓ Cover Art from Rekordbox

**Question:** Can we get cover art from Rekordbox XML?

**Answer:** ❌ **NO** - Rekordbox XML does NOT contain cover images.

### Solutions for Missing Cover Art:

1. ✅ **Spotify API** (already implemented)
   - Search track by artist + title
   - Fetch album.images[0].url
   - Update record.cover_image_url

2. **MusicBrainz API** (open-source alternative)
   - Free metadata database
   - Cover Art Archive integration

3. **File Extraction** (complex)
   - Read MP3/FLAC metadata
   - Extract embedded artwork
   - Requires file system access

4. **Manual Upload** (future feature)
   - Allow users to upload images
   - Drag & drop interface

---

## 🧪 Testing Checklist

- [x] Track list displays cover art when available
- [x] Fallback music icon shows for missing covers
- [x] BPM, Key, Label, Genres, Year all display correctly
- [x] Format badges (Vinyl/Digital) show correct icons
- [x] Clicking track opens drawer smoothly
- [x] Drawer loads track details correctly
- [x] Related tracks section works
- [x] Search for tracks to add transitions works
- [x] AI recommendations load and display
- [x] Add transition button creates transitions
- [x] Delete transition button removes transitions
- [x] Rating buttons update transition ratings
- [x] Drawer closes cleanly
- [x] Total count shows correctly (not limited to 1000)

---

## 🎉 Summary

### Before
- ❌ No cover art display
- ❌ Limited track information
- ❌ No track detail view
- ❌ No way to explore relationships
- ❌ Play button did nothing
- ❌ Potential 1000 track limit

### After
- ✅ **Cover art** with fallback
- ✅ **Full metadata**: BPM, Key, Label, Genres, Year, Format
- ✅ **Interactive drawer** with rich details
- ✅ **Related tracks** management
- ✅ **AI recommendations** for mixing
- ✅ **Quick transitions** creation
- ✅ **Clickable cards** for exploration
- ✅ **10,000 track limit** with count tracking

**Result:** A comprehensive, DJ-focused track browsing and relationship-building experience! 🎧✨

---

## 🔮 Future Enhancements

1. **Batch Cover Art Fetching**
   - Button: "Fetch missing cover art for all tracks"
   - Progress indicator
   - Background processing

2. **Waveform Display**
   - Show waveform in drawer
   - Highlight cue points
   - Visual beatgrid overlay

3. **Audio Preview**
   - 30-second preview playback
   - Waveform scrubbing
   - Cue point jumping

4. **Transition Visualization**
   - Graph view of all transitions
   - Force-directed layout
   - Cluster by genre/BPM/key

5. **Smart Setlist Builder**
   - Drag tracks to create setlist
   - Auto-suggest next track
   - BPM/key flow visualization

6. **Format Multi-Selection**
   - When track exists in both vinyl AND digital
   - Show dual badges
   - Allow format preference setting

