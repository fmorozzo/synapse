-- ============================================
-- Migration 004: Add Track-Level Granularity
-- ============================================
-- This migration adds support for:
-- 1. Individual tracks (songs on releases)
-- 2. Canonical songs (deduplicated across versions)
-- 3. Track transitions (for recommendations)
-- 4. User tracks (what's in your DJ collection)

-- ============================================
-- CANONICAL SONGS TABLE
-- ============================================
-- Represents the abstract "song" or "composition"
-- Multiple tracks can point to the same song
CREATE TABLE IF NOT EXISTS songs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Core identity
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  
  -- Metadata
  original_year INTEGER,
  genres TEXT[],
  styles TEXT[],
  
  -- External IDs for matching/deduplication
  musicbrainz_work_id TEXT,
  spotify_track_id TEXT,
  isrc TEXT, -- International Standard Recording Code
  
  -- Auto-generated fingerprint for fuzzy matching
  title_normalized TEXT GENERATED ALWAYS AS (
    LOWER(REGEXP_REPLACE(title, '[^\w\s]', '', 'g'))
  ) STORED,
  artist_normalized TEXT GENERATED ALWAYS AS (
    LOWER(REGEXP_REPLACE(artist, '[^\w\s]', '', 'g'))
  ) STORED,
  
  -- Stats (updated via triggers or app logic)
  play_count INTEGER DEFAULT 0,
  transition_count INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent obvious duplicates
  CONSTRAINT unique_song_normalized UNIQUE(title_normalized, artist_normalized)
);

-- ============================================
-- TRACKS TABLE
-- ============================================
-- Represents a specific track on a specific release
-- This is the DJ-level granularity (each version matters)
CREATE TABLE IF NOT EXISTS tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Links
  song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
  release_id UUID REFERENCES records(id) ON DELETE CASCADE,
  
  -- Position on release
  position TEXT, -- "A1", "B2", "CD1-03", etc.
  
  -- Track-specific data
  title TEXT NOT NULL,
  duration_ms INTEGER, -- Duration in milliseconds
  
  -- DJ-critical metadata
  bpm DECIMAL(6,2), -- 128.50 BPM
  key TEXT, -- "Am", "C#m", or "8A" (Camelot notation)
  camelot_key TEXT, -- Standardized Camelot notation
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
  
  -- Version information
  version_type TEXT, -- "original", "remaster", "live", "remix", "edit", "extended", "radio_edit"
  version_info TEXT, -- "2014 Remaster", "Live at Budokan", "Extended Mix"
  remix_artist TEXT, -- If it's a remix
  
  -- Audio analysis (can be populated later via API or manual entry)
  intro_length_ms INTEGER,
  outro_length_ms INTEGER,
  is_instrumental BOOLEAN DEFAULT false,
  has_vocal BOOLEAN DEFAULT true,
  
  -- External IDs
  discogs_track_id TEXT,
  spotify_track_id TEXT,
  
  -- User notes
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- A release can only have one track at each position
  CONSTRAINT unique_track_position UNIQUE(release_id, position)
);

-- ============================================
-- USER TRACKS TABLE
-- ============================================
-- Links users to the specific tracks they have access to
-- Derived from their collection (records table)
CREATE TABLE IF NOT EXISTS user_tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  
  -- User-specific data
  personal_rating INTEGER CHECK (personal_rating >= 1 AND personal_rating <= 5),
  tags TEXT[], -- Personal tags like "favorite", "warm-up", "closing"
  notes TEXT,
  
  -- Where is this track available?
  source TEXT, -- "vinyl", "digital", "streaming", "cd"
  location TEXT, -- "Home crate", "Gig bag", "Laptop", "Cloud"
  
  -- Usage statistics
  play_count INTEGER DEFAULT 0,
  last_played_at TIMESTAMP WITH TIME ZONE,
  
  -- Crate management
  crate_name TEXT, -- "Berlin gig", "House classics", etc.
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- A user can only have one entry per track
  CONSTRAINT unique_user_track UNIQUE(user_id, track_id)
);

-- ============================================
-- TRACK TRANSITIONS TABLE
-- ============================================
-- Records successful (or unsuccessful) track transitions
-- This is the core data for the recommendation engine
CREATE TABLE IF NOT EXISTS track_transitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- The transition
  from_track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  to_track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  
  -- Rating & feedback
  rating INTEGER CHECK (rating >= 1 AND rating <= 5), -- 1-5 stars or thumbs up/down
  worked_well BOOLEAN, -- Simple thumbs up/down
  
  -- Context & vibe
  context TEXT, -- "warm-up", "peak", "closing", "chill", "energetic"
  vibe_tags TEXT[], -- ["dark", "melodic", "energetic", "groovy"]
  
  -- Technical analysis
  bpm_diff DECIMAL(6,2), -- Calculated BPM difference
  key_compatible BOOLEAN, -- Whether keys are harmonically compatible
  
  -- Session information
  played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  venue TEXT,
  event_name TEXT,
  set_id UUID, -- Future: link to a set/session
  
  -- Transition technique used (optional, for learning)
  transition_type TEXT, -- "blend", "cut", "echo_out", "filter", "backspin"
  transition_length_sec INTEGER, -- How long the mix took
  
  -- Social features
  is_public BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  
  -- Notes
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent same transition from being recorded twice at same time
  CONSTRAINT unique_transition UNIQUE(user_id, from_track_id, to_track_id, played_at)
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Songs indexes
CREATE INDEX idx_songs_title_normalized ON songs(title_normalized);
CREATE INDEX idx_songs_artist_normalized ON songs(artist_normalized);
CREATE INDEX idx_songs_genres ON songs USING GIN(genres);
CREATE INDEX idx_songs_styles ON songs USING GIN(styles);
CREATE INDEX idx_songs_play_count ON songs(play_count) WHERE play_count > 0;

-- Tracks indexes
CREATE INDEX idx_tracks_song_id ON tracks(song_id);
CREATE INDEX idx_tracks_release_id ON tracks(release_id);
CREATE INDEX idx_tracks_bpm ON tracks(bpm) WHERE bpm IS NOT NULL;
CREATE INDEX idx_tracks_key ON tracks(key) WHERE key IS NOT NULL;
CREATE INDEX idx_tracks_camelot ON tracks(camelot_key) WHERE camelot_key IS NOT NULL;
CREATE INDEX idx_tracks_energy ON tracks(energy_level) WHERE energy_level IS NOT NULL;
CREATE INDEX idx_tracks_version_type ON tracks(version_type);

-- User tracks indexes
CREATE INDEX idx_user_tracks_user_id ON user_tracks(user_id);
CREATE INDEX idx_user_tracks_track_id ON user_tracks(track_id);
CREATE INDEX idx_user_tracks_source ON user_tracks(source);
CREATE INDEX idx_user_tracks_crate ON user_tracks(crate_name) WHERE crate_name IS NOT NULL;
CREATE INDEX idx_user_tracks_rating ON user_tracks(personal_rating) WHERE personal_rating IS NOT NULL;

-- Track transitions indexes (critical for recommendations)
CREATE INDEX idx_transitions_from_track ON track_transitions(from_track_id);
CREATE INDEX idx_transitions_to_track ON track_transitions(to_track_id);
CREATE INDEX idx_transitions_user ON track_transitions(user_id);
CREATE INDEX idx_transitions_rating ON track_transitions(rating) WHERE rating IS NOT NULL;
CREATE INDEX idx_transitions_worked_well ON track_transitions(worked_well) WHERE worked_well = true;
CREATE INDEX idx_transitions_context ON track_transitions(context) WHERE context IS NOT NULL;
CREATE INDEX idx_transitions_played_at ON track_transitions(played_at DESC);
CREATE INDEX idx_transitions_public ON track_transitions(is_public) WHERE is_public = true;

-- Composite indexes for common queries
CREATE INDEX idx_tracks_bpm_key ON tracks(bpm, key) WHERE bpm IS NOT NULL AND key IS NOT NULL;
CREATE INDEX idx_user_tracks_user_source ON user_tracks(user_id, source);
CREATE INDEX idx_transitions_from_rating ON track_transitions(from_track_id, rating) WHERE rating >= 4;

-- ============================================
-- TRIGGERS
-- ============================================

-- Update songs.play_count when track is played
CREATE OR REPLACE FUNCTION increment_song_play_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE songs 
  SET play_count = play_count + 1,
      updated_at = NOW()
  WHERE id = (SELECT song_id FROM tracks WHERE id = NEW.track_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_song_play_count
  AFTER UPDATE OF play_count ON user_tracks
  FOR EACH ROW
  WHEN (NEW.play_count > OLD.play_count)
  EXECUTE FUNCTION increment_song_play_count();

-- Update songs.transition_count when transitions are created
CREATE OR REPLACE FUNCTION increment_song_transition_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Increment for the "from" song
  UPDATE songs 
  SET transition_count = transition_count + 1,
      updated_at = NOW()
  WHERE id = (SELECT song_id FROM tracks WHERE id = NEW.from_track_id);
  
  -- Increment for the "to" song
  UPDATE songs 
  SET transition_count = transition_count + 1,
      updated_at = NOW()
  WHERE id = (SELECT song_id FROM tracks WHERE id = NEW.to_track_id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_song_transition_count
  AFTER INSERT ON track_transitions
  FOR EACH ROW
  EXECUTE FUNCTION increment_song_transition_count();

-- Auto-update updated_at timestamps
CREATE TRIGGER update_songs_updated_at
  BEFORE UPDATE ON songs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tracks_updated_at
  BEFORE UPDATE ON tracks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_tracks_updated_at
  BEFORE UPDATE ON user_tracks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_track_transitions_updated_at
  BEFORE UPDATE ON track_transitions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE track_transitions ENABLE ROW LEVEL SECURITY;

-- Songs: Everyone can read (public data)
CREATE POLICY "Songs are viewable by everyone"
  ON songs FOR SELECT
  USING (true);

-- Songs: Authenticated users can create/update
CREATE POLICY "Authenticated users can create songs"
  ON songs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update songs"
  ON songs FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Tracks: Everyone can read tracks from public releases
CREATE POLICY "Tracks are viewable by everyone"
  ON tracks FOR SELECT
  USING (true);

-- Tracks: Users can create tracks on their releases
CREATE POLICY "Users can create tracks on their releases"
  ON tracks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM records 
      WHERE id = tracks.release_id 
      AND user_id = auth.uid()
    )
  );

-- Tracks: Users can update tracks on their releases
CREATE POLICY "Users can update their tracks"
  ON tracks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM records 
      WHERE id = tracks.release_id 
      AND user_id = auth.uid()
    )
  );

-- User Tracks: Users can only see their own
CREATE POLICY "Users can view their own tracks"
  ON user_tracks FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tracks"
  ON user_tracks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tracks"
  ON user_tracks FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tracks"
  ON user_tracks FOR DELETE
  USING (auth.uid() = user_id);

-- Track Transitions: Users can see their own and public ones
CREATE POLICY "Users can view their own transitions"
  ON track_transitions FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert their own transitions"
  ON track_transitions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transitions"
  ON track_transitions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transitions"
  ON track_transitions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- HELPFUL VIEWS
-- ============================================

-- View: User's available tracks with full details
CREATE OR REPLACE VIEW user_tracks_detail AS
SELECT 
  ut.id as user_track_id,
  ut.user_id,
  t.id as track_id,
  t.title as track_title,
  t.position,
  t.bpm,
  t.key,
  t.camelot_key,
  t.energy_level,
  t.duration_ms,
  t.version_type,
  t.version_info,
  s.id as song_id,
  s.title as song_title,
  s.artist as song_artist,
  s.genres,
  s.styles,
  r.id as release_id,
  r.title as release_title,
  r.cover_image_url,
  r.format,
  r.year,
  ut.personal_rating,
  ut.tags,
  ut.source,
  ut.location,
  ut.crate_name,
  ut.play_count,
  ut.last_played_at
FROM user_tracks ut
JOIN tracks t ON ut.track_id = t.id
JOIN songs s ON t.song_id = s.id
JOIN records r ON t.release_id = r.id;

-- View: Popular transitions (for recommendations)
CREATE OR REPLACE VIEW popular_transitions AS
SELECT 
  tt.from_track_id,
  tt.to_track_id,
  COUNT(*) as times_played,
  AVG(tt.rating) as avg_rating,
  COUNT(DISTINCT tt.user_id) as unique_users,
  ARRAY_AGG(DISTINCT tt.context) FILTER (WHERE tt.context IS NOT NULL) as contexts,
  AVG(tt.bpm_diff) as avg_bpm_diff
FROM track_transitions tt
WHERE tt.rating >= 4 OR tt.worked_well = true
GROUP BY tt.from_track_id, tt.to_track_id
HAVING COUNT(*) >= 2; -- At least 2 people played this transition

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE songs IS 'Canonical songs - represents the abstract composition';
COMMENT ON TABLE tracks IS 'Specific track versions on releases - the DJ level of granularity';
COMMENT ON TABLE user_tracks IS 'Links users to tracks they have access to in their collection';
COMMENT ON TABLE track_transitions IS 'Records of successful track transitions for recommendations';

COMMENT ON COLUMN tracks.bpm IS 'Beats per minute - critical for beatmatching';
COMMENT ON COLUMN tracks.key IS 'Musical key - for harmonic mixing';
COMMENT ON COLUMN tracks.camelot_key IS 'Camelot wheel notation for easy key compatibility';
COMMENT ON COLUMN tracks.energy_level IS 'Subjective energy level 1-10 for set building';

COMMENT ON COLUMN track_transitions.worked_well IS 'Simple boolean for thumbs up/down feedback';
COMMENT ON COLUMN track_transitions.bpm_diff IS 'BPM difference - helps learn mixing patterns';
COMMENT ON COLUMN track_transitions.key_compatible IS 'Whether keys were harmonically compatible';

