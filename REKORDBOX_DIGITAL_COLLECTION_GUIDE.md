# 🎵 Rekordbox & Digital Collection Integration Guide

## 🎯 Overview

Your Synapse app now supports a **hybrid physical + digital collection system** with intelligent metadata management. This allows you to:

- ✅ Import Rekordbox XML files with BPM, key, cue points
- ✅ Maintain both physical (vinyl/CD) and digital collections
- ✅ Automatically match digital tracks to physical releases
- ✅ Use Spotify API as fallback for missing metadata
- ✅ Community-driven metadata pool (users contribute to shared knowledge)
- ✅ Filter collection by format type

---

## 🏗️ What Was Implemented

### 1. **Database Schema (Migration 006)**

New tables added:
- `track_metadata_sources` - Tracks where BPM/key data comes from (Rekordbox, Spotify, manual)
- `rekordbox_data` - Stores Rekordbox-specific data (cue points, hot cues, colors)
- `track_matches` - Links physical and digital versions of the same track

Enhanced tables:
- `records` - Now supports both physical and digital releases
  - New fields: `collection_type`, `import_source`, `file_format`, `bitrate`, `sample_rate`

### 2. **Rekordbox XML Parser**

Location: `packages/shared/src/parsers/rekordbox.ts`

Features:
- Parses Rekordbox XML exports
- Extracts: BPM, key, duration, cue points, hot cues, playlists
- Converts Rekordbox key notation to Camelot wheel
- Handles track ratings, colors, comments
- Supports all file formats (MP3, FLAC, WAV, AIFF)

### 3. **Track Matching Algorithm**

Location: `packages/shared/src/utils/track-matching.ts`

Features:
- Fuzzy matching using Jaro-Winkler similarity
- Handles different naming conventions
- Matches based on: title, artist, duration, album, year
- ISRC code matching (perfect match)
- Confidence scoring (0-100%)

### 4. **Spotify API Integration**

Location: `apps/web/lib/spotify/client.ts`

Features:
- Search tracks by artist, title, album
- Get audio features (BPM, key, energy, danceability)
- Batch enrichment support
- Automatic key conversion (Spotify → Standard → Camelot)
- Rate limiting built-in

### 5. **API Endpoints**

**POST /api/rekordbox/import**
- Imports Rekordbox XML file
- Creates songs, releases, tracks
- Matches to existing physical tracks
- Returns detailed import stats

**POST /api/tracks/enrich**
- Enriches tracks with Spotify metadata
- Supports single track or batch
- Adds metadata source for tracking

### 6. **UI Components**

**Import Page**: `/dashboard/import`
- Upload Rekordbox XML
- View import progress
- See detailed results and stats
- Error handling

**Collection Page**: `/dashboard/collection`
- Format filters (All, Physical, Digital, Vinyl, CD, MP3, FLAC)
- Format badges on cards
- Counts per format type

---

## 🚀 Setup Instructions

### Step 1: Run Database Migration

```bash
# Go to Supabase Dashboard → SQL Editor
# Copy and paste the contents of:
packages/supabase/src/migrations/006_add_digital_collection_support.sql

# Click "Run"
```

### Step 2: Install Dependencies

```bash
# From project root
pnpm install

# This will install:
# - xml2js (for parsing Rekordbox XML)
# - @types/xml2js
```

### Step 3: Configure Spotify API (Optional but Recommended)

```bash
# 1. Go to: https://developer.spotify.com/dashboard
# 2. Create an app
# 3. Get Client ID and Client Secret
# 4. Add to .env file:

# apps/web/.env.local
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
```

### Step 4: Build Packages

```bash
pnpm build
```

---

## 📖 How to Use

### Import Rekordbox Collection

1. **Export from Rekordbox:**
   - Open Rekordbox
   - Go to: File → Export Collection in xml format
   - Save the file (e.g., `rekordbox.xml`)

2. **Import to Synapse:**
   - Go to `/dashboard/import`
   - Click the Rekordbox tab
   - Upload your XML file
   - Wait for import to complete

3. **Review Results:**
   - Total tracks imported
   - Tracks matched to existing vinyl
   - BPM/key statistics
   - Any errors

### Filter Your Collection

Go to `/dashboard/collection` and use the filter buttons:

- **All** - Show everything
- **Physical** - Only vinyl and CDs
- **Digital** - Only digital files
- **Vinyl** - Only vinyl records
- **CD** - Only CDs
- **MP3** - Only MP3 files
- **FLAC** - Only FLAC files

### Enrich Tracks with Spotify

If some tracks don't have BPM/key:

```bash
# Call the enrich endpoint for a single track
POST /api/tracks/enrich
{
  "trackId": "uuid-here"
}

# Or batch enrich multiple tracks
POST /api/tracks/enrich
{
  "trackIds": ["uuid1", "uuid2", "uuid3"]
}
```

---

## 🔄 How Matching Works

### Scenario 1: Same Track in Vinyl + Digital

**Vinyl:** "Daft Punk - Get Lucky (feat. Pharrell Williams)"
**Digital:** "Get Lucky - Daft Punk.mp3"

**Result:** ✅ Matched (85% confidence)
- Your vinyl now has BPM and key from Rekordbox!

### Scenario 2: Only Digital

**Digital:** "Underground track.mp3"
**Physical:** Not in collection

**Result:** New digital release created

### Scenario 3: Different Versions

**Vinyl:** "Song Title (Original Mix)"
**Digital:** "Song Title (Remaster)"

**Result:** ⚠️ Matched with lower confidence
- User can confirm or reject match
- Stores both versions separately if needed

---

## 📊 Metadata Sources & Confidence Scores

The system tracks where each BPM/key value comes from:

| Source | Confidence | When Used |
|--------|-----------|-----------|
| Manual Entry | 90-100 | User manually sets value |
| Rekordbox Analysis | 80-90 | From audio file analysis |
| Spotify API | 70-80 | From streaming service |
| MusicBrainz | 60-70 | Community database |
| Estimated | 0-40 | Calculated values |

### Consensus Algorithm

If multiple sources provide different values:
- **BPM:** Weighted average based on confidence
- **Key:** Most common value (highest confidence wins)
- **Manual entries always override**

---

## 🎨 UI Features

### Collection View

- **Format Badges:** Each card shows if it's Physical or Digital
- **Smart Filters:** Only shows filters for formats you actually have
- **Counts:** See how many of each format type
- **Empty State:** Clear message when filter returns no results

### Import Progress

- Real-time progress updates
- Detailed statistics:
  - Total tracks in XML
  - New tracks imported
  - Matched to existing
  - Duplicates skipped
  - Failed imports with reasons

---

## 🔧 Troubleshooting

### Import Fails

**Error:** "Invalid Rekordbox XML format"
- Make sure you exported from Rekordbox (not iTunes or other software)
- File must be `.xml` extension
- Try re-exporting from Rekordbox

**Error:** "Failed to create track"
- Check Supabase logs for details
- Ensure migration 006 ran successfully
- Verify database permissions

### Matching Issues

**Too Many Duplicates**
- Lower the confidence threshold (default 85%)
- Use manual matching for edge cases
- Check for typos in track names

**No Matches Found**
- Track names might be too different
- Use manual entry for BPM/key
- Try Spotify enrichment as fallback

### Spotify Not Working

**Error:** "Spotify not configured"
- Add `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` to `.env.local`
- Restart dev server
- Check credentials are correct

**Rate Limiting**
- Free tier: 500 requests/day
- Batch operations wait 200ms between requests
- Consider manual entry for large collections

---

## 🎯 Best Practices

### 1. Import Strategy

**Recommended Order:**
1. Import physical collection from Discogs first
2. Then import Rekordbox (matches to existing)
3. Use Spotify for remaining gaps

**Why?** This maximizes matching and enriches your vinyl with digital metadata.

### 2. File Organization

Keep your Rekordbox library organized:
- Use consistent naming (Artist - Title)
- Fill in album names
- Analyze all tracks for BPM/key

### 3. Metadata Management

- Review matches with < 85% confidence
- Manually verify key values (Rekordbox can be wrong)
- Add personal notes and ratings
- Keep playlists updated

### 4. Performance

- Import in batches (50 tracks at a time)
- Don't re-import entire collection frequently
- Use "Import Another File" for new additions only

---

## 🔮 Future Enhancements

Planned features:
- [ ] Traktor NML support
- [ ] Serato library import
- [ ] Denon Engine Prime support
- [ ] Audio fingerprinting (AcoustID)
- [ ] Waveform visualization
- [ ] Cue point management UI
- [ ] Playlist sync back to Rekordbox
- [ ] Duplicate detection and merge

---

## 📚 API Reference

### Import Rekordbox

```typescript
POST /api/rekordbox/import

Body:
{
  xmlContent: string;  // XML file content
  fileName?: string;   // Original filename
}

Response:
{
  success: boolean;
  result: {
    stats: {
      totalTracks: number;
      imported: number;
      matched: number;
      failed: number;
      duplicates: number;
    };
    errors: Array<{ track: string; error: string }>;
  };
  collectionStats: {
    totalTracks: number;
    totalDurationFormatted: string;
    tracksWithBpm: number;
    tracksWithKey: number;
    avgBpm: number;
    totalPlaylists: number;
  };
}
```

### Enrich Track

```typescript
POST /api/tracks/enrich

Body (single):
{
  trackId: string;
}

Body (batch):
{
  trackIds: string[];
}

Response:
{
  success: boolean;
  result: {
    status: 'enriched' | 'already_enriched' | 'not_found';
    track?: Track;
  };
}
```

---

## 🤝 Contributing

To add support for other DJ software:

1. Create parser in `packages/shared/src/parsers/`
2. Follow Rekordbox parser structure
3. Add API endpoint in `apps/web/app/api/`
4. Add UI tab in `/dashboard/import`
5. Update TypeScript types

---

## 💡 Tips & Tricks

### Keyboard Shortcuts (Future)
- `V` - Filter to vinyl only
- `D` - Filter to digital only
- `A` - Show all formats
- `/` - Focus search

### Smart Playlists (Future)
- "Vinyl with BPM > 120"
- "Digital tracks not played in 3 months"
- "Matched tracks (same song, different formats)"

### Export Options (Future)
- Export collection as CSV
- Sync changes back to Rekordbox
- Share collection with friends

---

## 🆘 Support

If you encounter issues:

1. Check Supabase logs
2. Check browser console
3. Verify migration ran successfully
4. Test with a small XML file first
5. Open an issue with:
   - Error message
   - Steps to reproduce
   - Sample data (anonymized)

---

## 🎉 You're Ready!

Your Synapse app now has:
- ✅ Hybrid physical + digital collection
- ✅ Rekordbox import with BPM/key
- ✅ Spotify API fallback
- ✅ Intelligent track matching
- ✅ Format filtering
- ✅ Community metadata pool

Enjoy your enhanced DJ collection management! 🎧

