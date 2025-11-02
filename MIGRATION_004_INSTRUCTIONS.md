# How to Run Migration 004

## Step 1: Open Supabase SQL Editor

1. Go to: https://supabase.com/dashboard
2. Select your project: `kroavhibkzrigkgubhiq`
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**

## Step 2: Copy the Migration

Copy the ENTIRE contents of:
`packages/supabase/src/migrations/004_add_tracks_and_songs.sql`

## Step 3: Paste and Run

1. Paste the SQL into the editor
2. Click **Run** (or press Cmd+Enter)
3. Wait for success message

## Step 4: Verify Tables Created

Run this query to verify:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('songs', 'tracks', 'user_tracks', 'track_transitions')
ORDER BY table_name;
```

You should see:
- ✅ songs
- ✅ track_transitions
- ✅ tracks
- ✅ user_tracks

## Step 5: Verify View Created

```sql
SELECT viewname 
FROM pg_views 
WHERE schemaname = 'public' 
  AND viewname = 'user_tracks_detail';
```

Should return: `user_tracks_detail`

## Step 6: Test Insert

```sql
-- Insert a test song
INSERT INTO songs (title, artist, genres)
VALUES ('Test Song', 'Test Artist', ARRAY['Electronic'])
RETURNING *;

-- If that works, you're good to go!
```

## ✅ Done!

Once you see success, come back and we'll update the import logic.

