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

## After Running Migrations

Once you've run migrations 2 and 3:

1. Restart your dev server (Ctrl+C, then `pnpm dev:web`)
2. Go back to Settings
3. Try connecting Discogs again
4. It should work now! ✨

---

**Note:** The `IF NOT EXISTS` clause ensures these are safe to run multiple times.

