# Track-Level Architecture Implementation Guide

This guide explains how to implement and use the new track-level database architecture for Synapse.

## 📋 Table of Contents

1. [Database Schema Overview](#database-schema-overview)
2. [Running the Migration](#running-the-migration)
3. [Populating from Discogs](#populating-from-discogs)
4. [API Endpoints to Create](#api-endpoints-to-create)
5. [Query Examples](#query-examples)
6. [UI Components to Build](#ui-components-to-build)

---

## 🗄️ Database Schema Overview

### **Four Core Tables**

```
┌──────────┐
│  SONGS   │ ← Canonical songs (abstract composition)
└────┬─────┘
     │
     ▼ (1:many)
┌──────────┐       ┌──────────┐
│  TRACKS  │◄──────┤ RECORDS  │ ← Releases/Albums you own
└────┬─────┘       └──────────┘
     │
     ▼ (1:many)
┌──────────────┐
│ USER_TRACKS  │ ← What tracks you have access to
└──────────────┘

┌───────────────────┐
│ TRACK_TRANSITIONS │ ← Recommendation data
└───────────────────┘
```

### **Key Relationships**

- **1 Song** → **Many Tracks** (e.g., "Stairway to Heaven" → Original, Remaster, Live)
- **1 Release** → **Many Tracks** (e.g., Album → Track 1, Track 2, Track 3)
- **1 Track** → **1 Song** (Each specific version points to its canonical song)
- **1 User** → **Many User Tracks** (Your collection)

---

## 🚀 Running the Migration

### **Step 1: Run in Supabase SQL Editor**

1. Go to your Supabase Dashboard
2. Open SQL Editor
3. Copy the contents of `packages/supabase/src/migrations/004_add_tracks_and_songs.sql`
4. Click "Run"

### **Step 2: Verify Tables Created**

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('songs', 'tracks', 'user_tracks', 'track_transitions');

-- Should return 4 rows
```

### **Step 3: Verify Indexes**

```sql
SELECT indexname 
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('songs', 'tracks', 'user_tracks', 'track_transitions');

-- Should return ~25 indexes
```

---

## 📥 Populating from Discogs

### **Strategy: Import Release → Extract Tracks**

When a user imports their Discogs collection, you need to:

1. ✅ Create/update the **release** (records table) - *you already do this*
2. 🆕 Extract **tracks** from the release
3. 🆕 Find or create **canonical songs**
4. 🆕 Link tracks to songs
5. 🆕 Create **user_tracks** entries

### **Updated Import Flow**

```typescript
// File: apps/web/app/api/discogs/import-collection/route.ts

export async function POST(request: NextRequest) {
  // ... existing auth code ...

  for (const release of allReleases) {
    const basicInfo = release.basic_information;
    
    // 1. Create the release (existing code) ✅
    const { data: releaseRecord } = await supabase
      .from('records')
      .insert({
        user_id: user.id,
        discogs_release_id: basicInfo.id,
        title: basicInfo.title,
        artist: basicInfo.artists?.[0]?.name || 'Unknown Artist',
        // ... other release data
      })
      .select()
      .single();

    // 2. 🆕 Fetch full release details to get tracklist
    const fullRelease = await oauthClient.makeRequest(
      `https://api.discogs.com/releases/${basicInfo.id}`,
      profile.discogs_token,
      profile.discogs_token_secret,
      'GET'
    );

    // 3. 🆕 Process each track
    if (fullRelease.tracklist && fullRelease.tracklist.length > 0) {
      for (const discogsTrack of fullRelease.tracklist) {
        // Skip non-track items (headings, etc.)
        if (discogsTrack.type_ !== 'track') continue;

        // 4. Find or create canonical song
        const song = await findOrCreateSong({
          title: discogsTrack.title,
          artist: discogsTrack.artists?.[0]?.name || basicInfo.artists[0].name,
          genres: basicInfo.genres,
          styles: basicInfo.styles,
          year: basicInfo.year,
        });

        // 5. Create the track
        const { data: track } = await supabase
          .from('tracks')
          .insert({
            song_id: song.id,
            release_id: releaseRecord.id,
            position: discogsTrack.position,
            title: discogsTrack.title,
            duration_ms: parseDuration(discogsTrack.duration),
            // BPM and key can be added later manually or via API
          })
          .select()
          .single();

        // 6. Create user_track entry
        await supabase
          .from('user_tracks')
          .insert({
            user_id: user.id,
            track_id: track.id,
            source: 'vinyl', // or detect from format
          });
      }
    }
  }
}
```

### **Helper: Find or Create Song**

```typescript
// File: apps/web/lib/services/songs.ts

async function findOrCreateSong(data: {
  title: string;
  artist: string;
  genres?: string[];
  styles?: string[];
  year?: number;
}) {
  const supabase = await createServerSupabaseClient();

  // Normalize for matching
  const titleNorm = normalizeText(data.title);
  const artistNorm = normalizeText(data.artist);

  // Try exact match first
  const { data: existing } = await supabase
    .from('songs')
    .select('*')
    .eq('title_normalized', titleNorm)
    .eq('artist_normalized', artistNorm)
    .single();

  if (existing) {
    return existing;
  }

  // Create new song
  const { data: newSong } = await supabase
    .from('songs')
    .insert({
      title: data.title,
      artist: data.artist,
      original_year: data.year,
      genres: data.genres,
      styles: data.styles,
    })
    .select()
    .single();

  return newSong;
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ')    // Normalize whitespace
    .trim();
}

function parseDuration(duration: string): number | null {
  // Parse "3:45" → 225000 milliseconds
  if (!duration) return null;
  const parts = duration.split(':');
  if (parts.length !== 2) return null;
  const minutes = parseInt(parts[0]);
  const seconds = parseInt(parts[1]);
  return (minutes * 60 + seconds) * 1000;
}
```

---

## 🌐 API Endpoints to Create

### **1. GET /api/tracks**

Get user's tracks with full details.

```typescript
// apps/web/app/api/tracks/route.ts

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: tracks } = await supabase
    .from('user_tracks_detail') // Use the view
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return NextResponse.json({ tracks });
}
```

### **2. POST /api/tracks/[id]/play**

Record when a track is played.

```typescript
// apps/web/app/api/tracks/[id]/play/route.ts

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Update user_track play count
  await supabase
    .from('user_tracks')
    .update({
      play_count: supabase.raw('play_count + 1'),
      last_played_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)
    .eq('track_id', params.id);

  return NextResponse.json({ success: true });
}
```

### **3. POST /api/tracks/transitions**

Record a transition between tracks.

```typescript
// apps/web/app/api/tracks/transitions/route.ts

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const body = await request.json();
  const { from_track_id, to_track_id, rating, context, worked_well } = body;

  // Get track details for BPM diff calculation
  const { data: fromTrack } = await supabase
    .from('tracks')
    .select('bpm, key')
    .eq('id', from_track_id)
    .single();

  const { data: toTrack } = await supabase
    .from('tracks')
    .select('bpm, key')
    .eq('id', to_track_id)
    .single();

  const bpmDiff = fromTrack.bpm && toTrack.bpm 
    ? Math.abs(fromTrack.bpm - toTrack.bpm) 
    : null;

  const keyCompatible = fromTrack.key && toTrack.key
    ? checkKeyCompatibility(fromTrack.key, toTrack.key)
    : null;

  await supabase
    .from('track_transitions')
    .insert({
      user_id: user.id,
      from_track_id,
      to_track_id,
      rating,
      worked_well,
      context,
      bpm_diff: bpmDiff,
      key_compatible: keyCompatible,
    });

  return NextResponse.json({ success: true });
}
```

### **4. GET /api/recommendations**

Get track recommendations based on current track.

```typescript
// apps/web/app/api/recommendations/route.ts

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const searchParams = request.nextUrl.searchParams;
  const currentTrackId = searchParams.get('track_id');

  // Get current track details
  const { data: currentTrack } = await supabase
    .from('tracks')
    .select('*, songs(*)')
    .eq('id', currentTrackId)
    .single();

  // Get recommendations based on:
  // 1. Successful transitions from this track
  // 2. BPM compatibility
  // 3. Key compatibility
  // 4. Similar genre

  const { data: recommendations } = await supabase.rpc(
    'get_recommendations',
    {
      p_user_id: user.id,
      p_track_id: currentTrackId,
      p_bpm: currentTrack.bpm,
      p_key: currentTrack.key,
      p_genres: currentTrack.songs.genres,
    }
  );

  return NextResponse.json({ recommendations });
}
```

---

## 🔍 Query Examples

### **Find Users with Similar Collections**

```sql
SELECT 
  p.id,
  p.full_name,
  COUNT(DISTINCT s.id) as shared_songs
FROM profiles p
JOIN user_tracks ut ON p.id = ut.user_id
JOIN tracks t ON ut.track_id = t.id
JOIN songs s ON t.song_id = s.id
WHERE s.id IN (
  -- Songs the current user has
  SELECT DISTINCT t2.song_id
  FROM user_tracks ut2
  JOIN tracks t2 ON ut2.track_id = t2.id
  WHERE ut2.user_id = $current_user_id
)
AND p.id != $current_user_id
GROUP BY p.id, p.full_name
HAVING COUNT(DISTINCT s.id) >= 10 -- At least 10 shared songs
ORDER BY shared_songs DESC
LIMIT 20;
```

### **Get Most Popular Transitions**

```sql
SELECT 
  t1.title as from_track,
  t2.title as to_track,
  COUNT(*) as times_played,
  AVG(tt.rating) as avg_rating,
  COUNT(DISTINCT tt.user_id) as unique_users
FROM track_transitions tt
JOIN tracks t1 ON tt.from_track_id = t1.id
JOIN tracks t2 ON tt.to_track_id = t2.id
WHERE tt.worked_well = true
GROUP BY t1.id, t1.title, t2.id, t2.title
HAVING COUNT(*) >= 5
ORDER BY times_played DESC, avg_rating DESC
LIMIT 50;
```

### **Find Tracks by BPM Range and Key**

```sql
SELECT 
  t.*,
  s.title as song_title,
  s.artist,
  r.cover_image_url
FROM user_tracks ut
JOIN tracks t ON ut.track_id = t.id
JOIN songs s ON t.song_id = s.id
JOIN records r ON t.release_id = r.id
WHERE ut.user_id = $user_id
  AND t.bpm BETWEEN 125 AND 130
  AND t.camelot_key IN ('8A', '9A', '7A') -- Compatible keys
ORDER BY ABS(t.bpm - 128); -- Closest to 128 BPM first
```

---

## 🎨 UI Components to Build

### **1. Track List in Collection View**

Update your collection page to show tracks instead of just albums:

```tsx
<Card>
  <CardHeader>
    <Image src={album.cover_image_url} />
    <h3>{album.title}</h3>
    <p>{album.artist}</p>
  </CardHeader>
  <CardContent>
    {album.tracks.map((track) => (
      <div key={track.id} className="track-row">
        <span>{track.position}</span>
        <span>{track.title}</span>
        <span>{track.bpm} BPM</span>
        <span>{track.key}</span>
        <Button onClick={() => setNowPlaying(track)}>
          Set as Now Playing
        </Button>
      </div>
    ))}
  </CardContent>
</Card>
```

### **2. Now Playing Component**

```tsx
{nowPlaying && (
  <div className="now-playing-bar">
    <div className="track-info">
      <strong>{nowPlaying.title}</strong>
      <span>{nowPlaying.artist}</span>
    </div>
    <div className="track-meta">
      <Badge>{nowPlaying.bpm} BPM</Badge>
      <Badge>{nowPlaying.key}</Badge>
      <Badge>Energy: {nowPlaying.energy_level}/10</Badge>
    </div>
    <Button onClick={showRecommendations}>
      Show Recommendations
    </Button>
  </div>
)}
```

### **3. Recommendations Panel**

```tsx
<div className="recommendations-panel">
  <h3>Recommended Next Tracks</h3>
  {recommendations.map((rec) => (
    <div key={rec.track_id} className="recommendation-card">
      <div className="track-info">
        <strong>{rec.title}</strong>
        <span>{rec.artist}</span>
      </div>
      <div className="compatibility">
        <Badge variant={rec.bpm_diff < 3 ? 'success' : 'warning'}>
          BPM: {rec.bpm} ({rec.bpm_diff > 0 ? '+' : ''}{rec.bpm_diff})
        </Badge>
        <Badge variant={rec.key_compatible ? 'success' : 'default'}>
          Key: {rec.key}
        </Badge>
      </div>
      <div className="actions">
        <Button onClick={() => playTransition(nowPlaying, rec)}>
          Play Transition
        </Button>
        <Button variant="outline" onClick={() => rateTransition(rec, 'good')}>
          👍
        </Button>
      </div>
    </div>
  ))}
</div>
```

---

## ✅ Implementation Checklist

### **Phase 1: Database** (Do First!)
- [ ] Run migration 004 in Supabase
- [ ] Verify all tables created
- [ ] Test RLS policies work

### **Phase 2: Backend**
- [ ] Update Discogs import to extract tracks
- [ ] Implement `findOrCreateSong()` logic
- [ ] Create `/api/tracks` endpoint
- [ ] Create `/api/tracks/[id]/play` endpoint
- [ ] Create `/api/tracks/transitions` endpoint

### **Phase 3: Frontend**
- [ ] Update collection page to show tracks
- [ ] Add "Now Playing" component
- [ ] Add BPM/Key display
- [ ] Add "Set as Now Playing" buttons

### **Phase 4: Recommendations**
- [ ] Build basic BPM/Key matching algorithm
- [ ] Create recommendations endpoint
- [ ] Build recommendations UI panel
- [ ] Add transition rating (👍/👎)

### **Phase 5: Enhancement**
- [ ] Add manual BPM/Key entry
- [ ] Integrate audio analysis API (if available)
- [ ] Build set/session management
- [ ] Add community features

---

## 🚨 Common Issues & Solutions

### **Issue: "Title not found" when creating songs**
Make sure you're handling special characters and remixes properly:
```typescript
// Remove "(Remaster)", "(Extended)", etc. when normalizing
const cleanTitle = title.replace(/\([^)]*\)/g, '').trim();
```

### **Issue: Too many duplicate songs**
Tighten your matching logic or implement fuzzy matching:
```typescript
// Use Levenshtein distance for fuzzy matching
import { distance } from 'fastest-levenshtein';
const similarity = distance(title1, title2) / Math.max(title1.length, title2.length);
```

### **Issue: Slow queries**
Make sure indexes are working:
```sql
EXPLAIN ANALYZE 
SELECT * FROM tracks WHERE bpm BETWEEN 125 AND 130;
-- Should show "Index Scan" not "Seq Scan"
```

---

## 🎯 Next Steps

After implementing this:

1. **Add BPM Detection**: Integrate with APIs like Spotify or AcousticBrainz
2. **Key Detection**: Use audio analysis or manual entry
3. **Recommendation Algorithm**: Build ML model from transition data
4. **Mobile App**: Sync track-level data to mobile
5. **Community Features**: Share successful transitions

---

Happy building! 🎵

