# 🚀 Quick Start: Sessions & Radiations

## What's New?

You now have two powerful new features:

1. **Radiations** - See all your tracks that have mixing relationships
2. **Sessions** - Create playlists and DJ sets with drag-and-drop ordering

Plus: **Bidirectional Relationships** - When you relate Track A → Track B, both tracks now show the connection!

---

## ⚡ Setup (5 minutes)

### Step 1: Run Migration 005

1. Open Supabase Dashboard → SQL Editor
2. Open file: `packages/supabase/src/migrations/005_add_sessions.sql`
3. Copy **all contents** (331 lines)
4. Paste in SQL Editor
5. Click **Run** ▶️
6. Wait for success ✅

### Step 2: Verify

Run this in SQL Editor:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('sessions', 'session_tracks');
```

Should return 2 tables.

---

## 🎯 Try It Out

### Test Radiations
1. Navigate to **Dashboard → Radiations**
2. You should see all your tracks that have relations
3. Stats show: total tracks, total relations, average
4. Each track shows incoming (←) and outgoing (→) counts

### Test Sessions
1. Navigate to **Dashboard → Sessions**
2. Click **"New Session"**
3. Enter name: "Test Set"
4. Click **"Create Session"**
5. You're taken to the session detail page

### Test Drag-and-Drop
1. In your session, click **"Add Track"**
2. Search for a track
3. Click **"Add"** (repeat for 3-4 tracks)
4. Grab the grip handle (**☰**) on the left of any track
5. Drag it up or down to reorder
6. Click **"Save Order"**
7. Refresh the page - order is persisted! ✨

---

## 📁 What Changed

### Navigation
- ✅ "Insights" → "Radiations" (with Radio icon)
- ✅ "Analytics" → "Sessions" (with ListMusic icon)

### New Pages
- ✅ `/dashboard/radiations` - Tracks with relations
- ✅ `/dashboard/sessions` - Sessions list
- ✅ `/dashboard/sessions/[id]` - Session detail with drag-and-drop

### New API Endpoints
- ✅ `GET /api/tracks/with-relations` - Tracks with relation counts
- ✅ `GET/POST /api/sessions` - List/create sessions
- ✅ `GET/PATCH/DELETE /api/sessions/[id]` - Session CRUD
- ✅ `POST /api/sessions/[id]/tracks` - Add tracks to session
- ✅ `PUT /api/sessions/[id]/tracks` - Reorder tracks
- ✅ `DELETE /api/sessions/[id]/tracks/[trackId]` - Remove track

### Database Tables
- ✅ `sessions` - Session metadata
- ✅ `session_tracks` - Ordered list of tracks in each session

### Bug Fixes
- ✅ **Bidirectional relationships** - Now when you relate Track A → Track B:
  - Track A shows Track B in related (outgoing →)
  - Track B shows Track A in related (incoming ←)
  - Works perfectly both ways! 🔄

---

## 🎨 UI Features

### Radiations
- Search bar for filtering
- Color-coded relation counts (green/blue)
- BPM and Key badges
- Sortable by relation count

### Sessions List
- Create/delete sessions
- Favorite toggle (⭐)
- Grouped by status (Draft/Planned/Completed)
- Shows track count and duration
- Date and venue info

### Session Detail
- **Drag-and-drop** reordering (grab the ☰ handle)
- Add tracks with search
- Remove tracks with delete button
- Position numbers (1, 2, 3...)
- Cover art thumbnails
- BPM, Key, Duration badges
- Total track count and duration
- Save button to persist order

---

## 📝 Typical Workflow

### Building a DJ Set

1. **Create Session**
   - Dashboard → Sessions → New Session
   - Name: "Friday Night - Techno"
   - Date: 2024-11-08 22:00
   - Venue: "Club XYZ"

2. **Add Tracks**
   - Click "Add Track"
   - Search: "techno"
   - Add 20-30 tracks

3. **Reorder**
   - Drag tracks to optimal order
   - Consider: BPM progression, key flow, energy curve
   - Save order

4. **Reference Later**
   - View on desktop before gig
   - Check on mobile during set
   - Mark as "Completed" after playing

### Using Radiations

1. **Find Connected Tracks**
   - Navigate to Radiations
   - See which tracks have most relations
   - Identify "hub" tracks

2. **Build Sets Around Hubs**
   - Find tracks with 5+ relations
   - Use these as anchors in your sessions
   - Build tracks around them

3. **Discover Underutilized Tracks**
   - Find tracks with 0-1 relations
   - Try them in practice sessions
   - Build new connections

---

## 🎯 Key Features

### ✅ Drag-and-Drop
- Native HTML5 drag-and-drop
- Visual feedback while dragging
- Real-time position updates
- Persists to database on save

### ✅ Bidirectional Relations
- When you create A → B, both tracks show it
- Green arrow (→) = outgoing
- Blue arrow (←) = incoming
- No more one-way relationships!

### ✅ Search
- Fast autocomplete
- Searches title, artist, album
- Works across all your tracks

### ✅ Statistics
- Track counts
- Duration calculations
- Relation analytics

---

## 📚 Documentation

**Detailed Guides:**
- `SESSIONS_AND_RADIATIONS_GUIDE.md` - Complete feature guide
- `ALBUM_DETAIL_FEATURE.md` - Album drawer with relations
- `TRACKS_IMPLEMENTATION_GUIDE.md` - Track management

**Setup:**
- `packages/supabase/src/migrations/005_add_sessions.sql` - Database schema

---

## 🐛 Troubleshooting

**Radiations shows no tracks**
→ Create track relations first (Album drawer → Add related tracks)

**Can't create sessions**
→ Run Migration 005

**Drag-and-drop not working**
→ Grab the ☰ grip handle, not the track itself
→ Click "Save Order" after reordering

**Search shows no results**
→ Verify Migration 004 was run
→ Re-import your collection

---

## 🎉 What's Next?

### Ready to Use:
- ✅ Radiations page
- ✅ Sessions with drag-and-drop
- ✅ Bidirectional relationships
- ✅ All API endpoints

### Still Need to Run:
- ⏳ Migration 005 (sessions)

### Then You Can:
1. Build your first DJ set
2. Organize tracks into sessions
3. Reorder with drag-and-drop
4. View relation analytics in Radiations
5. Plan gigs with proper playlists

---

**All code is ready! Just run Migration 005 and start building sets! 🎧**

