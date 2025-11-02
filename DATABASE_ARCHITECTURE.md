# Synapse Database Architecture

## 🎯 Overview

Synapse uses a **four-tier hierarchical architecture** to handle music data at the appropriate level of granularity for DJ use cases.

```
RELEASE (Album/EP) ← What you own physically
    ↓
TRACK (Specific version) ← What you actually play
    ↓
SONG (Canonical) ← The abstract composition
    ↓
TRANSITIONS ← How tracks work together
```

---

## 📊 Database Tables

### **1. `records` (Releases/Albums)**
**Purpose:** Physical or digital releases you own

**What it represents:** The album, EP, or single as a product

**Example:**
- Led Zeppelin IV (Original 1971 pressing)
- Led Zeppelin IV (2014 Remaster)
- These are TWO different records

**Key fields:**
- `discogs_release_id` - Unique to each pressing
- `title`, `artist`, `year`, `format`
- `cover_image_url`, `genres`, `styles`
- User-specific: `condition`, `purchase_price`, `location`

---

### **2. `tracks` (Specific Versions)**
**Purpose:** Individual tracks on releases (DJ-level granularity)

**What it represents:** The specific version you'll actually play

**Example:**
- "Stairway to Heaven" on Led Zeppelin IV (Original) - BPM: 82
- "Stairway to Heaven" on Led Zeppelin IV (Remaster) - BPM: 82.5
- These are TWO different tracks (might have different sound)

**Key fields:**
- `release_id` - Which record it's on
- `song_id` - Which canonical song it is
- `position` - Track position (A1, B2, etc.)
- **DJ-critical:** `bpm`, `key`, `camelot_key`, `energy_level`
- `duration_ms`, `version_type`, `version_info`

**Why separate from records?**
- You play **tracks**, not albums
- Different versions have different BPMs
- Enables track-to-track recommendations

---

### **3. `songs` (Canonical Songs)**
**Purpose:** The abstract composition/song (deduplication)

**What it represents:** The "idea" of the song, regardless of version

**Example:**
- "Stairway to Heaven" by Led Zeppelin
- All versions point to this ONE canonical song
- Used for:
  - "Have I already played this song?" (any version)
  - User similarity (comparing collections)
  - Statistics (most popular songs)

**Key fields:**
- `title`, `artist`
- `title_normalized`, `artist_normalized` - For matching
- `genres`, `styles`, `original_year`
- `play_count`, `transition_count` - Aggregated stats

**Why needed?**
- Prevents recommending the same song twice (different versions)
- Enables "Users with similar taste" feature
- Simplifies statistics and analytics

---

### **4. `user_tracks` (Your Collection)**
**Purpose:** Links users to tracks they have access to

**What it represents:** "I have this specific track available to play"

**Example:**
- User has "Stairway to Heaven" from Original pressing (vinyl)
- User has "Stairway to Heaven" from Remaster (digital)
- Two separate `user_tracks` entries

**Key fields:**
- `user_id`, `track_id`
- `source` - vinyl, digital, streaming, cd
- `location` - "Home crate", "Gig bag", "Laptop"
- `crate_name` - For organizing tracks
- `personal_rating`, `tags`, `notes`
- `play_count`, `last_played_at`

**Why needed?**
- Filters recommendations to only available tracks
- Supports multiple sources (vinyl + digital)
- Enables crate management (gig-specific collections)

---

### **5. `track_transitions` (Recommendation Data)**
**Purpose:** Records successful (or failed) track transitions

**What it represents:** "Track A → Track B worked well"

**Example:**
```
From: "Get Lucky" (Daft Punk) - BPM: 116, Key: F#m
To: "I Feel It Coming" (The Weeknd) - BPM: 93, Key: F#m
Rating: 5 stars
Context: "peak time", "indoor club"
Worked well: ✅
```

**Key fields:**
- `from_track_id`, `to_track_id`
- `rating` (1-5), `worked_well` (boolean)
- `context`, `vibe_tags` - When/where it worked
- `bpm_diff`, `key_compatible` - Technical compatibility
- `venue`, `event_name`, `played_at`
- `is_public` - Share with community?

**Why this is the core of recommendations:**
- Captures actual DJ behavior
- Learns from community wisdom
- Considers context (warm-up vs peak time)
- Tracks technical compatibility

---

## 🔄 How They Work Together

### **Example: Import from Discogs**

```
1. User imports "Random Access Memories" by Daft Punk

2. Create RECORD
   ↓
   records: {
     id: "abc-123",
     title: "Random Access Memories",
     discogs_release_id: 123456,
     ...
   }

3. Extract TRACKS
   ↓
   Track 1: "Give Life Back to Music"
   Track 2: "The Game of Love"  
   Track 3: "Giorgio by Moroder"
   ...

4. For each track:
   
   a) Find or Create SONG
      ↓
      songs: {
        id: "song-xyz",
        title: "Get Lucky",
        artist: "Daft Punk",
        ...
      }
   
   b) Create TRACK
      ↓
      tracks: {
        id: "track-456",
        song_id: "song-xyz",
        release_id: "abc-123",
        position: "A4",
        bpm: 116,
        key: "F#m",
        ...
      }
   
   c) Create USER_TRACK
      ↓
      user_tracks: {
        user_id: "user-789",
        track_id: "track-456",
        source: "vinyl",
        ...
      }
```

### **Example: Get Recommendations**

```
User is playing: "Get Lucky" (track_id: "track-456")

1. Find tracks with successful transitions FROM this track
   ↓
   track_transitions WHERE from_track_id = "track-456"
   AND rating >= 4

2. Filter to tracks user actually has
   ↓
   JOIN user_tracks WHERE user_id = current_user

3. Also find tracks with:
   - Similar BPM (116 ± 5)
   - Compatible key (F#m compatible keys)
   - Same genre/vibe

4. Rank by:
   - Community success rate (how many DJs used this)
   - BPM compatibility
   - Key compatibility
   - Context match

5. Return top 10 recommendations
```

---

## 🎯 Benefits of This Architecture

### **1. Handles Version Complexity**
✅ Same song, different versions (Original, Remaster, Live)
✅ Each version can have different BPM/Key
✅ Can recommend specific versions

### **2. Enables Deduplication**
✅ "Have I already played this?" (checks song_id)
✅ "Don't recommend same song twice" (different versions)
✅ Statistics work correctly (song-level aggregation)

### **3. Supports User Comparison**
✅ "Users with similar collections" (song-level match)
✅ "What do expert DJs play after this?" (track-level)
✅ Collaborative filtering

### **4. Flexible Recommendations**
✅ Song-level: "This song works well with..."
✅ Track-level: "This specific version is better"
✅ Context-aware: "This works for peak time"

### **5. Future-Proof**
✅ Can add audio analysis later (BPM detection)
✅ Can integrate multiple sources (Spotify, local files)
✅ Can build ML models from transition data
✅ Supports mobile/web/hardware integrations

---

## 📈 Data Flow

```
┌─────────────────┐
│  Discogs Import │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│    RECORDS      │ (What albums you own)
└────────┬────────┘
         │
         ├─────────────────────┐
         ▼                     ▼
┌─────────────────┐   ┌─────────────────┐
│     TRACKS      │   │      SONGS      │
│ (What you play) │   │  (Deduplication)│
└────────┬────────┘   └─────────────────┘
         │                     ▲
         │                     │
         │                     │ (links)
         ▼                     │
┌─────────────────┐            │
│  USER_TRACKS    │────────────┘
│ (Your available │
│     tracks)     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│    TRACK_TRANSITIONS         │
│ (Recommendation training     │
│        data)                 │
└──────────────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│   RECOMMENDATION ENGINE      │
│   (Suggests next track)      │
└──────────────────────────────┘
```

---

## 🚀 Implementation Status

- ✅ **Migration Created** - `004_add_tracks_and_songs.sql`
- ✅ **TypeScript Types** - Updated in `packages/supabase/src/types.ts`
- ⏳ **Import Logic** - Need to update to extract tracks
- ⏳ **API Endpoints** - Need to create track endpoints
- ⏳ **UI Components** - Need to show tracks in collection
- ⏳ **Recommendation Engine** - Need to implement algorithm

**Next Step:** Run the migration in Supabase, then update import logic!

---

## 📚 Related Documents

- **`004_add_tracks_and_songs.sql`** - The migration file
- **`TRACKS_IMPLEMENTATION_GUIDE.md`** - Step-by-step implementation
- **`RUN_MIGRATIONS.md`** - How to run migrations
- **`types.ts`** - TypeScript definitions

---

## 💡 Key Design Decisions

### **Why not just use Discogs track IDs?**
- Discogs tracks are release-specific
- Need canonical song for deduplication
- Your own tracks (not in Discogs) need IDs too

### **Why user_tracks table?**
- User might have same track from multiple sources
- Enables crate management
- Supports "available for this gig" filtering

### **Why track BPM and not song BPM?**
- Different versions can have different BPMs
- Remastered versions might be slightly different
- Live versions definitely different
- DJ needs exact BPM for each version

### **Why separate transitions table?**
- Core data for ML/recommendation engine
- Can be crowdsourced (public transitions)
- Rich context data (when, where, how well)
- Enables learning from expert DJs

---

This architecture provides the foundation for intelligent, context-aware DJ recommendations! 🎵

