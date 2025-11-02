# Database Migrations - Run These in Supabase

You need to run these SQL migrations in your Supabase SQL Editor to fix the OAuth callback error.

## How to Run Migrations

1. Go to your Supabase project: https://supabase.com/dashboard
2. Open the **SQL Editor**
3. Create a new query for each migration below
4. Copy and paste each SQL script
5. Click "Run" for each one

## Migration 1: Initial Schema

**File:** `packages/supabase/src/migrations/001_initial_schema.sql`

This creates the `profiles` and `records` tables. You likely already ran this one.

## Migration 2: Add Discogs Token (IMPORTANT - Run This!)

**File:** `packages/supabase/src/migrations/002_add_discogs_token.sql`

```sql
-- Add discogs_token column to profiles table
-- This stores the user's Discogs personal access token securely

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS discogs_token TEXT;

-- Add index for faster queries on discogs_username
CREATE INDEX IF NOT EXISTS idx_profiles_discogs_username 
ON profiles(discogs_username) 
WHERE discogs_username IS NOT NULL;

-- Update the updated_at trigger to include the new column
-- (The trigger already exists from the initial migration)

-- Optional: Add a function to test Discogs connection
COMMENT ON COLUMN profiles.discogs_token IS 'Encrypted Discogs personal access token for API access';
COMMENT ON COLUMN profiles.discogs_username IS 'Users Discogs username for collection import';
COMMENT ON COLUMN profiles.discogs_connected IS 'Whether Discogs account is successfully connected';
```

## Migration 3: Add Discogs Token Secret (CRITICAL - Run This!)

**File:** `packages/supabase/src/migrations/003_add_discogs_token_secret.sql`

```sql
-- Add OAuth token secret field to profiles table
-- OAuth 1.0a requires both token and token_secret
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS discogs_token_secret TEXT;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_discogs_connected 
ON profiles(discogs_connected) 
WHERE discogs_connected = true;
```

## Verify Migrations Ran Successfully

After running the migrations, verify the columns exist by running this query:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
```

You should see:
- ✅ `discogs_username`
- ✅ `discogs_token`
- ✅ `discogs_token_secret`
- ✅ `discogs_connected`

## Migration 4: Add Track-Level Granularity (IMPORTANT - For DJ Features!)

**File:** `packages/supabase/src/migrations/004_add_tracks_and_songs.sql`

This migration adds support for individual tracks and the recommendation engine. Copy the entire file contents and run in Supabase SQL Editor.

**What it adds:**
- `songs` table - Canonical songs (handles duplicates across versions)
- `tracks` table - Specific track versions on releases (BPM, Key, etc.)
- `user_tracks` table - Links users to tracks in their collection
- `track_transitions` table - Records transitions for recommendations
- Indexes and RLS policies for all new tables
- Helpful views and triggers

**See:** `TRACKS_IMPLEMENTATION_GUIDE.md` for details on how to use these tables.

## After Running Migrations

Once you've run all migrations (1, 2, 3, and 4):

1. Verify tables exist:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see: `profiles`, `records`, `songs`, `tracks`, `user_tracks`, `track_transitions`

2. Restart your dev server (Ctrl+C, then `pnpm dev:web`)
3. Your app now has the complete database structure! ✨

---

**Note:** The `IF NOT EXISTS` clause ensures these are safe to run multiple times.

