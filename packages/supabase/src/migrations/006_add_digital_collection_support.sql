-- ============================================
-- Migration 006: Digital Collection Support
-- ============================================
-- This migration adds support for:
-- 1. Digital releases (from Rekordbox, Traktor, etc.)
-- 2. Metadata sources tracking (community-driven metadata)
-- 3. Format distinction (physical vs digital)
-- 4. Enhanced track matching

-- ============================================
-- ADD COLLECTION TYPE TO RECORDS
-- ============================================
-- Distinguish between physical and digital releases

ALTER TABLE records ADD COLUMN IF NOT EXISTS collection_type TEXT DEFAULT 'physical';
ALTER TABLE records ADD COLUMN IF NOT EXISTS import_source TEXT DEFAULT 'discogs';

-- Add constraint for valid collection types
ALTER TABLE records ADD CONSTRAINT valid_collection_type 
  CHECK (collection_type IN ('physical', 'digital'));

-- Add constraint for valid import sources
ALTER TABLE records ADD CONSTRAINT valid_import_source 
  CHECK (import_source IN ('discogs', 'rekordbox', 'traktor', 'serato', 'denon', 'virtualdj', 'manual'));

-- For digital releases, add file information
ALTER TABLE records ADD COLUMN IF NOT EXISTS file_format TEXT; -- "MP3", "FLAC", "WAV", "AIFF", "AAC"
ALTER TABLE records ADD COLUMN IF NOT EXISTS bitrate INTEGER; -- 320, 256, 128 (kbps)
ALTER TABLE records ADD COLUMN IF NOT EXISTS sample_rate INTEGER; -- 44100, 48000 (Hz)

-- Digital release identifier (instead of discogs_release_id for digital)
ALTER TABLE records ADD COLUMN IF NOT EXISTS digital_release_id TEXT;

-- Make discogs_release_id nullable (since digital releases won't have it)
ALTER TABLE records ALTER COLUMN discogs_release_id DROP NOT NULL;

-- Add unique constraint for digital releases
CREATE UNIQUE INDEX idx_records_digital_release_id 
  ON records(digital_release_id) 
  WHERE digital_release_id IS NOT NULL;

COMMENT ON COLUMN records.collection_type IS 'Type of release: physical (vinyl, CD) or digital (MP3, FLAC)';
COMMENT ON COLUMN records.import_source IS 'Where this release was imported from';
COMMENT ON COLUMN records.file_format IS 'Audio file format for digital releases';
COMMENT ON COLUMN records.digital_release_id IS 'Unique identifier for digital releases (hash of album+artist)';

-- ============================================
-- TRACK METADATA SOURCES TABLE
-- ============================================
-- Track where BPM, key, and other metadata comes from
-- Allows multiple sources per track with confidence scoring

CREATE TABLE IF NOT EXISTS track_metadata_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Links
  track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Who contributed this metadata
  
  -- Source information
  source_type TEXT NOT NULL, -- "rekordbox", "traktor", "spotify", "musicbrainz", "manual"
  source_confidence INTEGER DEFAULT 50 CHECK (source_confidence >= 0 AND source_confidence <= 100),
  
  -- Metadata values
  bpm DECIMAL(6,2),
  key TEXT,
  camelot_key TEXT,
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
  
  -- Additional metadata (stored as JSONB for flexibility)
  metadata JSONB, -- Can include: intro_length, outro_length, color, comments, etc.
  
  -- Timing
  imported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate sources per track
  CONSTRAINT unique_track_metadata_source UNIQUE(track_id, source_type, user_id)
);

-- Indexes for performance
CREATE INDEX idx_metadata_sources_track ON track_metadata_sources(track_id);
CREATE INDEX idx_metadata_sources_user ON track_metadata_sources(user_id);
CREATE INDEX idx_metadata_sources_type ON track_metadata_sources(source_type);
CREATE INDEX idx_metadata_sources_confidence ON track_metadata_sources(source_confidence DESC);

COMMENT ON TABLE track_metadata_sources IS 'Tracks where BPM/key data comes from - enables community-driven metadata';
COMMENT ON COLUMN track_metadata_sources.source_type IS 'Type of source: rekordbox, traktor, spotify, manual, etc.';
COMMENT ON COLUMN track_metadata_sources.source_confidence IS 'Confidence score 0-100 for this metadata source';

-- ============================================
-- REKORDBOX IMPORT DATA
-- ============================================
-- Store Rekordbox-specific data (cue points, colors, playlists)

CREATE TABLE IF NOT EXISTS rekordbox_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Rekordbox identifiers
  rekordbox_track_id TEXT, -- TrackID from Rekordbox
  file_path TEXT, -- Original file location
  
  -- Analysis data
  beatgrid JSONB, -- Beatgrid data from Rekordbox
  waveform JSONB, -- Waveform data
  
  -- Cue points and hot cues
  cue_points JSONB, -- [{position_ms, name, type, color}]
  hot_cues JSONB, -- [{number, position_ms, name, color}]
  memory_cues JSONB,
  
  -- Rekordbox metadata
  color TEXT, -- Track color in Rekordbox
  rating INTEGER CHECK (rating >= 0 AND rating <= 5),
  comment TEXT,
  
  -- Play statistics from Rekordbox
  play_count INTEGER DEFAULT 0,
  last_played_at TIMESTAMP WITH TIME ZONE,
  
  -- Playlists this track belongs to
  playlists TEXT[], -- Array of playlist names
  
  -- Original import info
  imported_from_file TEXT, -- Name of the XML file imported
  imported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_user_rekordbox_track UNIQUE(user_id, track_id)
);

CREATE INDEX idx_rekordbox_data_track ON rekordbox_data(track_id);
CREATE INDEX idx_rekordbox_data_user ON rekordbox_data(user_id);
CREATE INDEX idx_rekordbox_data_rating ON rekordbox_data(rating) WHERE rating IS NOT NULL;

COMMENT ON TABLE rekordbox_data IS 'Rekordbox-specific data including cue points, playlists, and colors';

-- ============================================
-- TRACK MATCHING TABLE
-- ============================================
-- Links physical and digital versions of the same track
-- Allows users to see all formats they own for a song

CREATE TABLE IF NOT EXISTS track_matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- The canonical song these tracks represent
  song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
  
  -- Matched tracks
  physical_track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
  digital_track_id UUID REFERENCES tracks(id) ON DELETE CASCADE,
  
  -- Match metadata
  match_confidence INTEGER CHECK (match_confidence >= 0 AND match_confidence <= 100),
  match_method TEXT, -- "isrc", "audio_fingerprint", "fuzzy_text", "manual"
  
  -- User confirmation
  user_confirmed BOOLEAN DEFAULT false,
  confirmed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  confirmed_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure we don't have duplicate matches
  CONSTRAINT unique_track_match UNIQUE(physical_track_id, digital_track_id)
);

CREATE INDEX idx_track_matches_song ON track_matches(song_id);
CREATE INDEX idx_track_matches_physical ON track_matches(physical_track_id);
CREATE INDEX idx_track_matches_digital ON track_matches(digital_track_id);
CREATE INDEX idx_track_matches_unconfirmed ON track_matches(user_confirmed) WHERE user_confirmed = false;

COMMENT ON TABLE track_matches IS 'Links physical and digital versions of the same track';

-- ============================================
-- UPDATE EXISTING RECORDS
-- ============================================
-- Set collection_type based on format (not import source!)
-- Set import_source for existing records

UPDATE records 
SET import_source = 'discogs'
WHERE import_source IS NULL;

-- Determine collection_type from format
UPDATE records 
SET collection_type = CASE
  -- Digital formats from Discogs
  WHEN format ILIKE '%file%' THEN 'digital'
  WHEN format ILIKE '%mp3%' THEN 'digital'
  WHEN format ILIKE '%flac%' THEN 'digital'
  WHEN format ILIKE '%wav%' THEN 'digital'
  WHEN format ILIKE '%aiff%' THEN 'digital'
  WHEN format ILIKE '%download%' THEN 'digital'
  
  -- Physical formats from Discogs
  WHEN format ILIKE '%vinyl%' THEN 'physical'
  WHEN format ILIKE '%cd%' THEN 'physical'
  WHEN format ILIKE '%cassette%' THEN 'physical'
  WHEN format ILIKE '%dvd%' THEN 'physical'
  WHEN format ILIKE '%bluray%' THEN 'physical'
  
  -- Default to physical for existing Discogs records (most common)
  ELSE 'physical'
END
WHERE collection_type IS NULL;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to calculate consensus BPM from multiple sources
CREATE OR REPLACE FUNCTION get_consensus_bpm(p_track_id UUID)
RETURNS DECIMAL(6,2) AS $$
DECLARE
  consensus_bpm DECIMAL(6,2);
BEGIN
  -- Weighted average based on confidence scores
  SELECT 
    ROUND(
      SUM(bpm * source_confidence::DECIMAL / 100) / 
      SUM(source_confidence::DECIMAL / 100),
      2
    )
  INTO consensus_bpm
  FROM track_metadata_sources
  WHERE track_id = p_track_id 
    AND bpm IS NOT NULL;
  
  RETURN consensus_bpm;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate consensus key from multiple sources
CREATE OR REPLACE FUNCTION get_consensus_key(p_track_id UUID)
RETURNS TEXT AS $$
DECLARE
  consensus_key TEXT;
BEGIN
  -- Most common key weighted by confidence
  SELECT key
  INTO consensus_key
  FROM (
    SELECT 
      key,
      SUM(source_confidence) as total_confidence
    FROM track_metadata_sources
    WHERE track_id = p_track_id 
      AND key IS NOT NULL
    GROUP BY key
    ORDER BY total_confidence DESC
    LIMIT 1
  ) AS key_counts;
  
  RETURN consensus_key;
END;
$$ LANGUAGE plpgsql;

-- Function to update track from consensus metadata
CREATE OR REPLACE FUNCTION update_track_from_consensus(p_track_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE tracks
  SET 
    bpm = get_consensus_bpm(p_track_id),
    key = get_consensus_key(p_track_id),
    updated_at = NOW()
  WHERE id = p_track_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update track when metadata source is added
CREATE OR REPLACE FUNCTION trigger_update_track_from_metadata()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the track with consensus values
  PERFORM update_track_from_consensus(NEW.track_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_track_metadata_on_insert
  AFTER INSERT ON track_metadata_sources
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_track_from_metadata();

CREATE TRIGGER update_track_metadata_on_update
  AFTER UPDATE ON track_metadata_sources
  FOR EACH ROW
  WHEN (OLD.bpm IS DISTINCT FROM NEW.bpm OR OLD.key IS DISTINCT FROM NEW.key)
  EXECUTE FUNCTION trigger_update_track_from_metadata();

-- Auto-update updated_at timestamps
CREATE TRIGGER update_rekordbox_data_updated_at
  BEFORE UPDATE ON rekordbox_data
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_track_metadata_sources_updated_at
  BEFORE UPDATE ON track_metadata_sources
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_track_matches_updated_at
  BEFORE UPDATE ON track_matches
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE track_metadata_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE rekordbox_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE track_matches ENABLE ROW LEVEL SECURITY;

-- Metadata sources: Everyone can read, authenticated users can create
CREATE POLICY "Metadata sources are viewable by everyone"
  ON track_metadata_sources FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can add metadata sources"
  ON track_metadata_sources FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own metadata sources"
  ON track_metadata_sources FOR UPDATE
  USING (auth.uid() = user_id);

-- Rekordbox data: Users can only see their own
CREATE POLICY "Users can view their own Rekordbox data"
  ON rekordbox_data FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own Rekordbox data"
  ON rekordbox_data FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own Rekordbox data"
  ON rekordbox_data FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own Rekordbox data"
  ON rekordbox_data FOR DELETE
  USING (auth.uid() = user_id);

-- Track matches: Everyone can read, authenticated users can create
CREATE POLICY "Track matches are viewable by everyone"
  ON track_matches FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create track matches"
  ON track_matches FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update matches they confirmed"
  ON track_matches FOR UPDATE
  USING (auth.uid() = confirmed_by OR confirmed_by IS NULL);

-- ============================================
-- HELPFUL VIEWS
-- ============================================

-- View: Tracks with all metadata sources
CREATE OR REPLACE VIEW tracks_with_metadata_sources AS
SELECT 
  t.id as track_id,
  t.title,
  t.bpm as current_bpm,
  t.key as current_key,
  json_agg(
    json_build_object(
      'source_type', tms.source_type,
      'bpm', tms.bpm,
      'key', tms.key,
      'confidence', tms.source_confidence,
      'user_id', tms.user_id,
      'imported_at', tms.imported_at
    ) ORDER BY tms.source_confidence DESC
  ) FILTER (WHERE tms.id IS NOT NULL) as metadata_sources
FROM tracks t
LEFT JOIN track_metadata_sources tms ON t.id = tms.track_id
GROUP BY t.id, t.title, t.bpm, t.key;

-- View: User's collection with format breakdown
CREATE OR REPLACE VIEW user_collection_formats AS
SELECT 
  ut.user_id,
  COUNT(DISTINCT ut.track_id) as total_tracks,
  COUNT(DISTINCT ut.track_id) FILTER (WHERE r.collection_type = 'physical') as physical_tracks,
  COUNT(DISTINCT ut.track_id) FILTER (WHERE r.collection_type = 'digital') as digital_tracks,
  COUNT(DISTINCT ut.track_id) FILTER (WHERE r.format LIKE '%Vinyl%') as vinyl_tracks,
  COUNT(DISTINCT ut.track_id) FILTER (WHERE r.format LIKE '%CD%') as cd_tracks,
  COUNT(DISTINCT ut.track_id) FILTER (WHERE r.file_format = 'MP3') as mp3_tracks,
  COUNT(DISTINCT ut.track_id) FILTER (WHERE r.file_format = 'FLAC') as flac_tracks,
  COUNT(DISTINCT ut.track_id) FILTER (WHERE t.bpm IS NOT NULL) as tracks_with_bpm,
  COUNT(DISTINCT ut.track_id) FILTER (WHERE t.key IS NOT NULL) as tracks_with_key
FROM user_tracks ut
JOIN tracks t ON ut.track_id = t.id
JOIN records r ON t.release_id = r.id
GROUP BY ut.user_id;

-- View: Matched tracks (physical + digital)
CREATE OR REPLACE VIEW matched_tracks_detail AS
SELECT 
  tm.id as match_id,
  tm.song_id,
  s.title as song_title,
  s.artist as song_artist,
  
  -- Physical version
  pt.id as physical_track_id,
  pt.title as physical_track_title,
  pr.title as physical_release_title,
  pr.format as physical_format,
  
  -- Digital version
  dt.id as digital_track_id,
  dt.title as digital_track_title,
  dr.file_format as digital_format,
  dr.bitrate as digital_bitrate,
  
  -- Match info
  tm.match_confidence,
  tm.match_method,
  tm.user_confirmed
  
FROM track_matches tm
JOIN songs s ON tm.song_id = s.id
LEFT JOIN tracks pt ON tm.physical_track_id = pt.id
LEFT JOIN records pr ON pt.release_id = pr.id
LEFT JOIN tracks dt ON tm.digital_track_id = dt.id
LEFT JOIN records dr ON dt.release_id = dr.id;

COMMENT ON VIEW tracks_with_metadata_sources IS 'Shows all metadata sources for each track';
COMMENT ON VIEW user_collection_formats IS 'Summary of user collection by format type';
COMMENT ON VIEW matched_tracks_detail IS 'Details of matched physical and digital tracks';

-- ============================================
-- SAMPLE CONFIDENCE SCORES (for reference)
-- ============================================
-- These are guidelines for source_confidence values:
--
-- 90-100: Manual entry by user (highest trust)
-- 80-90:  Rekordbox/Traktor analyzed from audio file
-- 70-80:  Spotify/Apple Music API (commercial sources)
-- 60-70:  MusicBrainz/AcousticBrainz (community data)
-- 40-60:  Discogs release notes (text parsing)
-- 0-40:   Estimated/calculated values

