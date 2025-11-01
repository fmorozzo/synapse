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

