# Album Detail Drawer - Feature Guide

## 🎵 Overview

The Album Detail Drawer is a comprehensive view that allows you to manage track relationships, view recommendations, and build your DJ mixing knowledge base directly from your collection.

## ✨ Features

### 1. **Album Information**
- Cover art, artist, year, format, label
- Genre tags
- Relations toggle (enable/disable album from recommendations)

### 2. **Track List**
- All tracks from the album/EP
- Track position, title, duration
- BPM, Key, Energy level (when available)
- Click to select a track and see its relationships

### 3. **Related Tracks (Transitions)**
- View all tracks that mix well with the selected track
- See BPM, Key, and context for each transition
- 👍/👎 indicator for successful/unsuccessful mixes
- Delete relations you no longer want

### 4. **Add New Relations**
- Search for tracks by title, artist, or album
- Real-time autocomplete dropdown
- Add tracks with "Works" (👍) or "Doesn't Work" (👎) rating
- Instantly builds your mixing knowledge base

### 5. **Smart Recommendations**
- **BPM-based**: Finds tracks within ±5 BPM
- **Key-compatible**: Suggests harmonically compatible tracks
- **Genre-based**: Recommends similar styles
- **Same artist**: Other tracks by the same artist
- Match score and reason for each recommendation
- One-click to add recommendations as relations

### 6. **Relations Toggle**
- Disable albums from being included in recommendations
- Useful for excluding practice tracks, sound effects, etc.
- Persists across sessions

## 🚀 How to Use

### Opening the Drawer
1. Go to **Dashboard → Collection**
2. Click on any album card
3. The drawer slides in from the right

### Working with Tracks
1. Click a track in the list to select it
2. View its related tracks and recommendations
3. Search and add new relations using the search box
4. Rate transitions as successful (👍) or unsuccessful (👎)

### Building Your Mix Library
1. After DJing, add successful transitions:
   - Select the "from" track in its album
   - Search for the "to" track
   - Click "Works" to create a positive transition

2. Track unsuccessful mixes too:
   - Click "Doesn't" to remember what didn't work
   - Helps avoid repeating mixing mistakes

### Using Recommendations
1. Select a track
2. Scroll to "Recommended Tracks"
3. Review suggestions based on BPM, Key, Genre, Artist
4. Click "Add" to create a relation
5. Build your mixing knowledge automatically!

## 📊 Database Structure

### Track Transitions Table
```sql
CREATE TABLE track_transitions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  from_track_id UUID REFERENCES tracks(id),
  to_track_id UUID REFERENCES tracks(id),
  rating INTEGER,              -- Optional 1-5 rating
  worked_well BOOLEAN,          -- TRUE = works, FALSE = doesn't work
  context TEXT,                 -- e.g., "manual_add", "live_set", "bedroom_practice"
  bpm_diff DECIMAL(6,2),       -- Calculated BPM difference
  key_compatible BOOLEAN,       -- Are keys harmonically compatible?
  played_at TIMESTAMP,
  created_at TIMESTAMP
);
```

### Why This Structure?
- **Bidirectional**: Can query from → to or to → from
- **Context-aware**: Know where/when a transition worked
- **Rating system**: 1-5 scale for fine-grained feedback
- **Binary worked_well**: Quick yes/no for building recommendations
- **Metadata**: BPM diff and key compatibility for analysis

## 🎯 API Endpoints

### Get Album Details
```
GET /api/records/[id]
```
Returns album info + all tracks.

### Get Related Tracks
```
GET /api/tracks/[id]/related
```
Returns all tracks that the selected track transitions to.

### Get Recommendations
```
GET /api/tracks/[id]/recommendations
```
Returns smart recommendations based on BPM, Key, Genre, Artist.

### Search Tracks
```
GET /api/tracks/search?q=<query>
```
Search all user tracks by title, artist, or album.

### Create Transition
```
POST /api/tracks/transitions
{
  "from_track_id": "uuid",
  "to_track_id": "uuid",
  "worked_well": true,
  "context": "manual_add"
}
```

### Delete Transition
```
DELETE /api/tracks/transitions/[id]
```

### Toggle Album Relations
```
POST /api/records/[id]/toggle-relations
{ "enabled": false }
```

## 🎨 UI Components

### AlbumDetailDrawer
**Location**: `apps/web/components/albums/album-detail-drawer.tsx`

**Props**:
- `albumId: string | null` - Album to display
- `onClose: () => void` - Close callback

**Features**:
- Responsive (full width on mobile, 50% on desktop)
- Sticky header with close button
- Scrollable content area
- Loading states
- Error handling

## 🔑 Key Compatibility

The system includes basic harmonic mixing rules:

### Major Keys
- **C**: C, G, F, Am, Em, Dm
- **G**: G, D, C, Em, Bm, Am
- **D**: D, A, G, Bm, F#m, Em
- **A**: A, E, D, F#m, C#m, Bm
- **E**: E, B, A, C#m, G#m, F#m

### Minor Keys
- **Am**: Am, Em, Dm, C, G, F
- **Em**: Em, Bm, Am, G, D, C
- **Dm**: Dm, Am, Gm, F, C, Bb

You can expand this in:
- `apps/web/app/api/tracks/[id]/recommendations/route.ts`
- `apps/web/app/api/tracks/transitions/route.ts`

## 📝 Future Enhancements

### Short Term
- [ ] Camelot wheel notation (1A, 1B, 2A, etc.)
- [ ] Energy level matching
- [ ] Crate/folder organization
- [ ] Bulk import transitions from CSV
- [ ] Export transitions for rekordbox/Serato

### Medium Term
- [ ] AI-powered recommendations using OpenAI
- [ ] Audio analysis integration (Spotify API)
- [ ] Setlist builder using transition data
- [ ] Transition success rate analytics
- [ ] Heat map of most-used transitions

### Long Term
- [ ] Community transition sharing
- [ ] Genre-specific mixing rules
- [ ] Auto-detect BPM/Key from audio files
- [ ] Mobile app integration
- [ ] Live set recording & analysis

## 🐛 Troubleshooting

### "No tracks found" in drawer
- Run Migration 004 first
- Re-import your collection from Discogs
- Check that tracks table is populated

### Recommendations not showing
- Ensure tracks have BPM, Key, and Genre data
- Import from Discogs to get metadata
- Add metadata manually in the future

### Search not working
- Check that `user_tracks_detail` view exists
- Run Migration 004
- Verify tracks are owned by the logged-in user

### Transitions not saving
- Check that `track_transitions` table exists
- Verify both tracks exist in database
- Check browser console for errors

## 🎓 DJ Workflow Examples

### Example 1: Building a House Set
1. Open your favorite house track
2. Note the BPM (128) and Key (Am)
3. Check recommendations
4. Add tracks with similar BPM/Key as "Works"
5. Build a 2-hour set from transitions

### Example 2: Learning Key Mixing
1. Select a track in C major
2. Try recommended tracks in G, F, or Am
3. Mark which transitions sound good
4. Build knowledge of harmonic mixing
5. Reference later when building sets

### Example 3: Genre Exploration
1. Select a melodic techno track
2. View recommendations by genre
3. Discover new tracks in your collection
4. Create transitions to build bridges between genres

## 📚 Resources

- [Harmonic Mixing Guide](https://www.harmonic-mixing.com/)
- [Camelot Wheel](https://mixedinkey.com/camelot-wheel/)
- [DJ Transition Techniques](https://www.digitaldjtips.com/dj-mixing-techniques/)

---

**Built for DJs, by DJs.** Happy mixing! 🎧

