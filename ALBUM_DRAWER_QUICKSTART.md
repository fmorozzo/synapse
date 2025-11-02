# 🎵 Album Detail Drawer - Quick Start

## What's New?

You can now click on any album in your collection to open a detailed drawer that shows:

1. **All tracks** on the album/EP
2. **Related tracks** that mix well together
3. **Add new relations** with autocomplete search
4. **Smart recommendations** based on BPM, Key, Genre, Artist
5. **Relations toggle** to exclude albums from recommendations

## 🚀 Setup (First Time)

### Step 1: Run Database Migration

1. Open Supabase Dashboard → SQL Editor
2. Run the **cleanup script** first:
   - File: `packages/supabase/src/migrations/004_cleanup_and_run.sql`
   - Copy and paste all contents
   - Click **Run**

3. Run the **main migration**:
   - File: `packages/supabase/src/migrations/004_add_tracks_and_songs.sql`
   - Copy and paste all contents (452 lines)
   - Click **Run**

### Step 2: Import Your Collection

1. Go to **Dashboard → Collection**
2. Click **"Import from Discogs"**
3. Wait for import to complete (this will now import individual tracks!)
4. You should see: `Successfully imported X releases with Y tracks`

## 🎯 How to Use

### Opening the Drawer

1. Go to **Dashboard → Collection**
2. **Click on any album card**
3. The drawer opens from the right side! ✨

### Viewing Track Details

1. In the drawer, you'll see all tracks listed
2. **Click on a track** to select it
3. See:
   - Related tracks (tracks you've marked as mixing well)
   - Recommendations (smart suggestions)

### Adding Track Relations

1. Select a track
2. Scroll to **"Add Related Track"**
3. Start typing in the search box
4. Select a track from dropdown
5. Click **"Works"** (👍) or **"Doesn't"** (👎)

### Using Recommendations

1. Select a track
2. Scroll to **"Recommended Tracks"**
3. See suggestions with match reasons:
   - Similar BPM (±5)
   - Compatible Key
   - Similar Genre
   - Same Artist
4. Click **"Add"** to create a relation

### Toggling Relations

1. In the drawer, find **"Relations Enabled"** toggle
2. Click to disable if you want to exclude this album from recommendations
3. Useful for sound effects, practice tracks, etc.

## 📁 New Files Created

### Components
- `apps/web/components/albums/album-detail-drawer.tsx` - Main drawer component

### API Routes
- `apps/web/app/api/records/[id]/route.ts` - Get album + tracks
- `apps/web/app/api/tracks/[id]/related/route.ts` - Get related tracks
- `apps/web/app/api/tracks/[id]/recommendations/route.ts` - Smart recommendations
- `apps/web/app/api/tracks/search/route.ts` - Search all tracks
- `apps/web/app/api/tracks/transitions/route.ts` - Create transitions
- `apps/web/app/api/tracks/transitions/[id]/route.ts` - Delete transitions
- `apps/web/app/api/records/[id]/toggle-relations/route.ts` - Toggle relations

### Updated Files
- `apps/web/app/(dashboard)/dashboard/collection/page.tsx` - Added drawer integration

### Database
- `packages/supabase/src/migrations/004_cleanup_and_run.sql` - Cleanup script
- `packages/supabase/src/migrations/004_add_tracks_and_songs.sql` - Already created

### Documentation
- `ALBUM_DETAIL_FEATURE.md` - Comprehensive feature guide
- `ALBUM_DRAWER_QUICKSTART.md` - This file!

## 🎬 Demo Workflow

### Scenario: Building a House Music Set

1. **Open your favorite house track**
   - Click on an album in your collection
   - Select a track (e.g., "Track 1 - 128 BPM, Am")

2. **Check recommendations**
   - Scroll to "Recommended Tracks"
   - See tracks with similar BPM (123-133)
   - See tracks with compatible keys (C, G, F, etc.)

3. **Add successful transitions**
   - Search for a track you know mixes well
   - Click "Works" (👍)
   - Now it appears in "Related Tracks"

4. **Build your knowledge base**
   - Keep adding transitions as you discover them
   - Next time you open this track, you'll see all your relations
   - Use this to plan DJ sets!

## ✅ Verification

After setup, verify everything works:

1. **Check tracks imported**:
   - Go to Dashboard → Tracks
   - Should see individual tracks, not just albums

2. **Test drawer**:
   - Click an album
   - Drawer should open with track list

3. **Test recommendations**:
   - Select a track with BPM/Key data
   - Should see recommendations

4. **Test search**:
   - Type in "Add Related Track" search box
   - Should see autocomplete results

## 🐛 Troubleshooting

### Drawer opens but shows no tracks
→ Re-import your collection from Discogs

### No recommendations showing
→ Tracks need BPM, Key, Genre data (comes from Discogs)

### Search not working
→ Verify migration 004 ran successfully

### Can't add relations
→ Check browser console for errors, verify both tracks exist

## 🎓 Pro Tips

1. **Build as you DJ**: After each set, add successful transitions
2. **Rate everything**: Use 👍/👎 to build accurate data
3. **Use recommendations**: Great for discovering tracks in your collection
4. **Toggle wisely**: Disable sound effects/practice albums from recommendations
5. **Search is fast**: Type any part of title, artist, or album name

---

## 🆘 Need Help?

- See `ALBUM_DETAIL_FEATURE.md` for detailed documentation
- Check `DATABASE_ARCHITECTURE.md` for database schema
- See `TRACKS_IMPLEMENTATION_GUIDE.md` for implementation details

---

**Ready to start?** Run the migration scripts and import your collection! 🚀

