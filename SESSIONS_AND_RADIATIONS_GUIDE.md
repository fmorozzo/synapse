# 🎵 Sessions & Radiations - Feature Guide

## Overview

Two powerful new features have been added to your DJ app:

1. **Radiations** - View all tracks with mixing relationships
2. **Sessions** - Create and manage playlists/DJ sets with drag-and-drop ordering

---

## 📻 Radiations

### What It Does
Shows all tracks that have at least one relationship (incoming or outgoing transitions).

### Features
- **Statistics Dashboard**
  - Total tracks with relations
  - Total number of relations
  - Average relations per track

- **Track List**
  - Search by track, artist, or album
  - Shows BPM and Key for each track
  - Displays:
    - **Outgoing count** (→) - Tracks this one mixes into
    - **Incoming count** (←) - Tracks that mix into this one
    - **Total relations**

### How to Access
Navigate to: **Dashboard → Radiations**

### Use Cases
- Find your most connected tracks
- Identify hub tracks that work with many others
- Discover underutilized tracks in your collection
- Build better mixing knowledge

---

## 🎧 Sessions (Playlists/Sets)

### What It Does
Create organized playlists and DJ sets with ordered track lists.

### Features

#### 1. Session Management
- Create multiple sessions
- Organize by status: Draft, Planned, Completed
- Add metadata:
  - Name & description
  - Date & venue
  - Duration
  - Track count

#### 2. Session Details
- **Add Tracks**
  - Search your entire collection
  - Add tracks with one click
  - Tracks automatically append to the end

- **Drag-and-Drop Reordering**
  - Grab the grip handle (☰) on the left
  - Drag tracks up or down
  - Visual feedback while dragging
  - Click "Save Order" to persist changes

- **Track Display**
  - Position number
  - Cover art
  - Track title & artist
  - BPM, Key, Duration
  - Remove button

- **Session Stats**
  - Total track count
  - Total estimated duration
  - Venue information

#### 3. Organization
- Mark sessions as favorites (⭐)
- Filter by status (Draft/Planned/Completed)
- Sort by creation date
- Delete sessions when done

### How to Access
Navigate to: **Dashboard → Sessions**

### Typical Workflow

#### Creating a Session
1. Click "New Session"
2. Enter name (e.g., "Friday Night Set")
3. Optionally add:
   - Description
   - Date/time
   - Venue name
4. Click "Create Session"
5. You're automatically taken to the session detail page

#### Building a Tracklist
1. Click "Add Track"
2. Search for tracks by title, artist, or album
3. Click "Add" next to each track you want
4. Repeat until your set is complete

#### Reordering Tracks
1. Grab the grip handle (☰) on any track
2. Drag it to the desired position
3. The list updates in real-time
4. Click "Save Order" when satisfied
5. Order is persisted to the database

#### Managing Sessions
- Click any session card to open it
- Click ⭐ to favorite/unfavorite
- Hover over a session to see the "Delete" button
- Sessions are sorted by creation date (newest first)

---

## 🗄️ Database Schema

### Sessions Table
```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  description TEXT,
  session_date TIMESTAMP WITH TIME ZONE,
  venue TEXT,
  duration_minutes INTEGER,
  tags TEXT[],
  is_favorite BOOLEAN DEFAULT false,
  color TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);
```

### Session Tracks Table
```sql
CREATE TABLE session_tracks (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  notes TEXT,
  cue_point_ms INTEGER,
  transition_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(session_id, position)
);
```

### Key Features
- **Cascade Deletion**: Deleting a session removes all its tracks
- **Position Management**: Automatic reordering when tracks are deleted
- **Conflict Prevention**: Triggers prevent position conflicts
- **RLS Policies**: Users can only access their own sessions

---

## 🚀 Setup Instructions

### Step 1: Run Migration 005
1. Open Supabase Dashboard → SQL Editor
2. Open file: `packages/supabase/src/migrations/005_add_sessions.sql`
3. Copy all contents
4. Paste in SQL Editor
5. Click **Run**
6. Wait for success message ✅

### Step 2: Verify Setup
Check tables exist:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('sessions', 'session_tracks')
ORDER BY table_name;
```

Should return 2 tables.

### Step 3: Test Features
1. Navigate to **Dashboard → Sessions**
2. Click "New Session"
3. Create a test session
4. Add a few tracks
5. Try drag-and-drop reordering
6. Click "Save Order"
7. Navigate to **Dashboard → Radiations**
8. View your tracks with relations

---

## 📁 Files Created

### Navigation
- `apps/web/components/layouts/dashboard-nav.tsx` - Updated menu items

### Radiations Feature
- `apps/web/app/(dashboard)/dashboard/radiations/page.tsx` - Radiations page
- `apps/web/app/api/tracks/with-relations/route.ts` - API endpoint

### Sessions Feature
- `apps/web/app/(dashboard)/dashboard/sessions/page.tsx` - Sessions list
- `apps/web/app/(dashboard)/dashboard/sessions/[id]/page.tsx` - Session detail with drag-and-drop
- `apps/web/app/api/sessions/route.ts` - List & create sessions
- `apps/web/app/api/sessions/[id]/route.ts` - Get, update, delete session
- `apps/web/app/api/sessions/[id]/tracks/route.ts` - Add tracks & reorder
- `apps/web/app/api/sessions/[id]/tracks/[trackId]/route.ts` - Remove tracks

### Database
- `packages/supabase/src/migrations/005_add_sessions.sql` - Sessions schema

### Documentation
- `SESSIONS_AND_RADIATIONS_GUIDE.md` - This file!

---

## 🎯 Use Cases & Examples

### Use Case 1: Planning a DJ Set
1. Create a session called "House Night at Club XYZ"
2. Set date and venue
3. Search for your best house tracks
4. Add 20-30 tracks
5. Reorder them for optimal flow
6. Save order
7. Reference on mobile during your set

### Use Case 2: Building a Practice Mix
1. Create "Bedroom Practice - Techno"
2. Add tracks you want to practice with
3. Order them by BPM or energy level
4. Mark as "Draft" status
5. Update as you practice
6. Move to "Completed" when satisfied

### Use Case 3: Analyzing Your Mixing
1. After a successful set, create a session
2. Add all tracks you played (in order)
3. Later, go to Radiations
4. See which tracks have the most relations
5. Identify your "hub" tracks
6. Build future sets around successful patterns

### Use Case 4: Preparing for Different Venues
- Create session: "Peak Time - Warehouse"
- Create session: "Warm Up - Lounge Bar"
- Create session: "Closing Set - Festival"
- Each with appropriate tracks and ordering
- Reference before your gig

---

## 🎨 UI/UX Features

### Radiations Page
- **Clean Statistics**: Three key metrics at the top
- **Search Bar**: Real-time filtering
- **Color-Coded Counts**: Green for outgoing, Blue for incoming
- **Responsive Grid**: Adapts to screen size

### Sessions List
- **Grouped by Status**: Draft, Planned, Completed sections
- **Card Layout**: Visual and scannable
- **Hover Actions**: Delete button appears on hover
- **Quick Actions**: Favorite toggle with star icon
- **Metadata Display**: Date, venue, track count, duration

### Session Detail Page
- **Drag Handles**: Clear visual indicator (☰)
- **Real-Time Feedback**: Tracks move immediately while dragging
- **Position Numbers**: Always show current order
- **Cover Art**: Visual identification
- **Metadata Chips**: BPM, Key, Duration in colored badges
- **Save Button**: Persist changes to database

---

## 🔧 Advanced Features (Future)

### Planned Enhancements
- [ ] Export sessions to CSV/M3U
- [ ] Import sessions from rekordbox/Serato
- [ ] Share sessions with other users
- [ ] Session templates
- [ ] AI-powered track suggestions based on session
- [ ] Automatic BPM progression analysis
- [ ] Key flow visualization
- [ ] Energy curve graph
- [ ] Session notes with timestamps
- [ ] Collaboration (multiple DJs on one session)
- [ ] Mobile app with offline support

---

## 🐛 Troubleshooting

### Radiations shows no tracks
→ Create some track relations first in your collection
→ Click an album, select a track, add relations

### Can't create sessions
→ Run Migration 005 first
→ Check browser console for errors

### Drag-and-drop not working
→ Make sure you're grabbing the grip handle (☰)
→ Try clicking "Save Order" to refresh

### Tracks not appearing in search
→ Verify Migration 004 was run
→ Re-import your collection
→ Check that tracks exist in database

### Session not saving
→ Check browser console for errors
→ Verify RLS policies are set up correctly
→ Ensure you're logged in

---

## 💡 Pro Tips

1. **Use Descriptive Names**: "2024-11-02 - Club ABC" is better than "Set 1"
2. **Add Venue Info**: Helps you remember what worked where
3. **Favorite Important Sessions**: Quick access to your best sets
4. **Draft Status First**: Build sessions gradually, mark planned when ready
5. **Completed for Archive**: Move old sessions to completed to keep list clean
6. **Use Radiations**: Find your most versatile tracks for new sessions
7. **Save Order Often**: Don't lose your work!
8. **Search is Fast**: Type any part of track/artist/album name
9. **Duration Tracking**: Use estimated duration to plan set length
10. **Build Templates**: Create base sessions and duplicate for similar gigs

---

## 📊 Analytics You Can Do

### With Radiations:
- Which tracks have the most connections?
- Which tracks are underutilized?
- What's your average relations per track?
- Are you building enough mixing knowledge?

### With Sessions:
- How many sessions have you created?
- What's your average session length?
- Which venues do you play most?
- What's your most-used track across all sessions?
- What's your longest/shortest session?

---

## 🎓 Learning Resources

- **Mixing Theory**: Use sessions to practice harmonic mixing
- **Set Building**: Study your completed sessions for patterns
- **Track Discovery**: Use radiations to find new mixing opportunities
- **Flow Analysis**: Review BPM/key progression in completed sessions

---

**Happy mixing! 🎧✨**

---

*For more features, see:*
- `ALBUM_DETAIL_FEATURE.md` - Album drawer with relations
- `TRACKS_IMPLEMENTATION_GUIDE.md` - Track management
- `DATABASE_ARCHITECTURE.md` - Database design

