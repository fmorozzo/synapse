-- ============================================
-- Cleanup Script: Run this BEFORE migration 004
-- ============================================
-- This safely removes any partially created objects
-- so you can run the full migration cleanly

-- Drop indexes if they exist
DROP INDEX IF EXISTS idx_songs_title_normalized;
DROP INDEX IF EXISTS idx_songs_artist_normalized;
DROP INDEX IF EXISTS idx_songs_genres;
DROP INDEX IF EXISTS idx_songs_styles;
DROP INDEX IF EXISTS idx_songs_play_count;
DROP INDEX IF EXISTS idx_tracks_song_id;
DROP INDEX IF EXISTS idx_tracks_release_id;
DROP INDEX IF EXISTS idx_tracks_bpm;
DROP INDEX IF EXISTS idx_tracks_key;
DROP INDEX IF EXISTS idx_tracks_camelot;
DROP INDEX IF EXISTS idx_tracks_energy;
DROP INDEX IF EXISTS idx_tracks_version_type;
DROP INDEX IF EXISTS idx_user_tracks_user_id;
DROP INDEX IF EXISTS idx_user_tracks_track_id;
DROP INDEX IF EXISTS idx_user_tracks_source;
DROP INDEX IF EXISTS idx_user_tracks_crate;
DROP INDEX IF EXISTS idx_user_tracks_rating;
DROP INDEX IF EXISTS idx_transitions_from_track;
DROP INDEX IF EXISTS idx_transitions_to_track;
DROP INDEX IF EXISTS idx_transitions_user;
DROP INDEX IF EXISTS idx_transitions_rating;
DROP INDEX IF EXISTS idx_transitions_worked_well;
DROP INDEX IF EXISTS idx_transitions_context;
DROP INDEX IF EXISTS idx_transitions_played_at;
DROP INDEX IF EXISTS idx_transitions_public;
DROP INDEX IF EXISTS idx_tracks_bpm_key;
DROP INDEX IF EXISTS idx_user_tracks_user_source;
DROP INDEX IF EXISTS idx_transitions_from_rating;

-- Drop triggers if they exist
DROP TRIGGER IF EXISTS update_song_play_count ON user_tracks;
DROP TRIGGER IF EXISTS update_song_transition_count ON track_transitions;
DROP TRIGGER IF EXISTS update_songs_updated_at ON songs;
DROP TRIGGER IF EXISTS update_tracks_updated_at ON tracks;
DROP TRIGGER IF EXISTS update_user_tracks_updated_at ON user_tracks;
DROP TRIGGER IF EXISTS update_track_transitions_updated_at ON track_transitions;

-- Drop functions if they exist
DROP FUNCTION IF EXISTS increment_song_play_count();
DROP FUNCTION IF EXISTS increment_song_transition_count();

-- Drop views if they exist
DROP VIEW IF EXISTS user_tracks_detail;
DROP VIEW IF EXISTS popular_transitions;

-- Drop tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS track_transitions CASCADE;
DROP TABLE IF EXISTS user_tracks CASCADE;
DROP TABLE IF EXISTS tracks CASCADE;
DROP TABLE IF EXISTS songs CASCADE;

-- ============================================
-- ✅ Cleanup complete!
-- Now run the full migration 004
-- ============================================

