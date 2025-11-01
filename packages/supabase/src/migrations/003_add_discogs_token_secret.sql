-- Add OAuth token secret field to profiles table
-- OAuth 1.0a requires both token and token_secret
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS discogs_token_secret TEXT;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_discogs_connected 
ON profiles(discogs_connected) 
WHERE discogs_connected = true;

