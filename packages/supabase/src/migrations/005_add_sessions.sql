-- ============================================
-- MIGRATION 005: Sessions/Playlists System
-- ============================================
-- This migration adds the ability to create DJ sessions/playlists
-- with ordered track lists and drag-and-drop support

-- ============================================
-- TABLES
-- ============================================

-- Sessions table (playlists, sets, etc.)
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Basic info
  name TEXT NOT NULL,
  description TEXT,
  
  -- Session metadata
  session_date TIMESTAMP WITH TIME ZONE,
  venue TEXT,
  duration_minutes INTEGER,
  
  -- Organization
  tags TEXT[],
  is_favorite BOOLEAN DEFAULT false,
  color TEXT, -- Hex color for visual organization
  
  -- Status
  status TEXT DEFAULT 'draft', -- draft, planned, completed, archived
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Session tracks table (ordered list of tracks in a session)
CREATE TABLE IF NOT EXISTS session_tracks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  track_id UUID NOT NULL REFERENCES tracks(id) ON DELETE CASCADE,
  
  -- Order in the session
  position INTEGER NOT NULL,
  
  -- Optional notes for this specific track in this session
  notes TEXT,
  cue_point_ms INTEGER, -- Cue point in milliseconds
  
  -- Transition info
  transition_notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique position per session
  UNIQUE(session_id, position)
);

-- ============================================
-- INDEXES
-- ============================================

-- Sessions indexes
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_session_date ON sessions(session_date DESC) WHERE session_date IS NOT NULL;
CREATE INDEX idx_sessions_is_favorite ON sessions(is_favorite) WHERE is_favorite = true;
CREATE INDEX idx_sessions_created_at ON sessions(created_at DESC);
CREATE INDEX idx_sessions_tags ON sessions USING GIN(tags) WHERE tags IS NOT NULL;

-- Session tracks indexes
CREATE INDEX idx_session_tracks_session_id ON session_tracks(session_id);
CREATE INDEX idx_session_tracks_track_id ON session_tracks(track_id);
CREATE INDEX idx_session_tracks_position ON session_tracks(session_id, position);

-- ============================================
-- TRIGGERS
-- ============================================

-- Update sessions updated_at timestamp
CREATE TRIGGER update_sessions_updated_at
  BEFORE UPDATE ON sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Update session_tracks updated_at timestamp
CREATE TRIGGER update_session_tracks_updated_at
  BEFORE UPDATE ON session_tracks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_tracks ENABLE ROW LEVEL SECURITY;

-- Sessions policies
CREATE POLICY "Users can view their own sessions"
  ON sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sessions"
  ON sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions"
  ON sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions"
  ON sessions FOR DELETE
  USING (auth.uid() = user_id);

-- Session tracks policies
CREATE POLICY "Users can view tracks in their own sessions"
  ON session_tracks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = session_tracks.session_id
      AND sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can add tracks to their own sessions"
  ON session_tracks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = session_tracks.session_id
      AND sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update tracks in their own sessions"
  ON session_tracks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = session_tracks.session_id
      AND sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete tracks from their own sessions"
  ON session_tracks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM sessions
      WHERE sessions.id = session_tracks.session_id
      AND sessions.user_id = auth.uid()
    )
  );

-- ============================================
-- HELPFUL VIEWS
-- ============================================

-- View to get sessions with track count and duration
CREATE OR REPLACE VIEW session_details AS
SELECT 
  s.*,
  COUNT(st.id) as track_count,
  SUM(t.duration_ms) / 60000.0 as estimated_duration_minutes
FROM sessions s
LEFT JOIN session_tracks st ON s.id = st.session_id
LEFT JOIN tracks t ON st.track_id = t.id
GROUP BY s.id;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to reorder session tracks after deletion
CREATE OR REPLACE FUNCTION reorder_session_tracks()
RETURNS TRIGGER AS $$
BEGIN
  -- After a track is deleted, update positions to fill the gap
  UPDATE session_tracks
  SET position = position - 1
  WHERE session_id = OLD.session_id
    AND position > OLD.position;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger to reorder tracks after deletion
CREATE TRIGGER reorder_tracks_after_delete
  AFTER DELETE ON session_tracks
  FOR EACH ROW
  EXECUTE FUNCTION reorder_session_tracks();

-- Function to prevent position conflicts when reordering
CREATE OR REPLACE FUNCTION prevent_position_conflicts()
RETURNS TRIGGER AS $$
BEGIN
  -- If the new position conflicts, shift existing tracks
  IF EXISTS (
    SELECT 1 FROM session_tracks
    WHERE session_id = NEW.session_id
      AND position = NEW.position
      AND id != NEW.id
  ) THEN
    -- Shift all tracks at or after this position up by 1
    UPDATE session_tracks
    SET position = position + 1
    WHERE session_id = NEW.session_id
      AND position >= NEW.position
      AND id != NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to prevent position conflicts
CREATE TRIGGER prevent_position_conflicts_trigger
  BEFORE INSERT OR UPDATE ON session_tracks
  FOR EACH ROW
  EXECUTE FUNCTION prevent_position_conflicts();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE sessions IS 'DJ sessions/playlists/sets';
COMMENT ON TABLE session_tracks IS 'Ordered list of tracks in a session';
COMMENT ON COLUMN sessions.status IS 'draft, planned, completed, or archived';
COMMENT ON COLUMN session_tracks.position IS 'Order of track in session (0-indexed)';
COMMENT ON COLUMN session_tracks.cue_point_ms IS 'Starting cue point in milliseconds';

-- ============================================
-- ✅ Migration 005 Complete!
-- ============================================

