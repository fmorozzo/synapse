/**
 * Database type definitions
 * These should match your Supabase database schema
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          discogs_username: string | null
          discogs_token: string | null
          discogs_token_secret: string | null
          discogs_connected: boolean
          preferences: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          discogs_username?: string | null
          discogs_token?: string | null
          discogs_token_secret?: string | null
          discogs_connected?: boolean
          preferences?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          discogs_username?: string | null
          discogs_token?: string | null
          discogs_token_secret?: string | null
          discogs_connected?: boolean
          preferences?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      records: {
        Row: {
          id: string
          user_id: string
          discogs_release_id: number | null
          title: string
          artist: string
          year: number | null
          format: string | null
          label: string | null
          catalog_number: string | null
          cover_image_url: string | null
          genres: string[] | null
          styles: string[] | null
          notes: string | null
          condition: string | null
          purchase_date: string | null
          purchase_price: number | null
          purchase_currency: string | null
          location: string | null
          collection_type: 'physical' | 'digital'
          import_source: 'discogs' | 'rekordbox' | 'traktor' | 'serato' | 'denon' | 'virtualdj' | 'manual'
          file_format: string | null
          bitrate: number | null
          sample_rate: number | null
          digital_release_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          discogs_release_id?: number | null
          title: string
          artist: string
          year?: number | null
          format?: string | null
          label?: string | null
          catalog_number?: string | null
          cover_image_url?: string | null
          genres?: string[] | null
          styles?: string[] | null
          notes?: string | null
          condition?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          purchase_currency?: string | null
          location?: string | null
          collection_type?: 'physical' | 'digital'
          import_source?: 'discogs' | 'rekordbox' | 'traktor' | 'serato' | 'denon' | 'virtualdj' | 'manual'
          file_format?: string | null
          bitrate?: number | null
          sample_rate?: number | null
          digital_release_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          discogs_release_id?: number | null
          title?: string
          artist?: string
          year?: number | null
          format?: string | null
          label?: string | null
          catalog_number?: string | null
          cover_image_url?: string | null
          genres?: string[] | null
          styles?: string[] | null
          notes?: string | null
          condition?: string | null
          purchase_date?: string | null
          purchase_price?: number | null
          purchase_currency?: string | null
          location?: string | null
          collection_type?: 'physical' | 'digital'
          import_source?: 'discogs' | 'rekordbox' | 'traktor' | 'serato' | 'denon' | 'virtualdj' | 'manual'
          file_format?: string | null
          bitrate?: number | null
          sample_rate?: number | null
          digital_release_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      songs: {
        Row: {
          id: string
          title: string
          artist: string
          original_year: number | null
          genres: string[] | null
          styles: string[] | null
          musicbrainz_work_id: string | null
          spotify_track_id: string | null
          isrc: string | null
          title_normalized: string | null
          artist_normalized: string | null
          play_count: number
          transition_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          artist: string
          original_year?: number | null
          genres?: string[] | null
          styles?: string[] | null
          musicbrainz_work_id?: string | null
          spotify_track_id?: string | null
          isrc?: string | null
          play_count?: number
          transition_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          artist?: string
          original_year?: number | null
          genres?: string[] | null
          styles?: string[] | null
          musicbrainz_work_id?: string | null
          spotify_track_id?: string | null
          isrc?: string | null
          play_count?: number
          transition_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      tracks: {
        Row: {
          id: string
          song_id: string | null
          release_id: string | null
          position: string | null
          title: string
          duration_ms: number | null
          bpm: number | null
          key: string | null
          camelot_key: string | null
          energy_level: number | null
          version_type: string | null
          version_info: string | null
          remix_artist: string | null
          intro_length_ms: number | null
          outro_length_ms: number | null
          is_instrumental: boolean
          has_vocal: boolean
          discogs_track_id: string | null
          spotify_track_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          song_id?: string | null
          release_id?: string | null
          position?: string | null
          title: string
          duration_ms?: number | null
          bpm?: number | null
          key?: string | null
          camelot_key?: string | null
          energy_level?: number | null
          version_type?: string | null
          version_info?: string | null
          remix_artist?: string | null
          intro_length_ms?: number | null
          outro_length_ms?: number | null
          is_instrumental?: boolean
          has_vocal?: boolean
          discogs_track_id?: string | null
          spotify_track_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          song_id?: string | null
          release_id?: string | null
          position?: string | null
          title?: string
          duration_ms?: number | null
          bpm?: number | null
          key?: string | null
          camelot_key?: string | null
          energy_level?: number | null
          version_type?: string | null
          version_info?: string | null
          remix_artist?: string | null
          intro_length_ms?: number | null
          outro_length_ms?: number | null
          is_instrumental?: boolean
          has_vocal?: boolean
          discogs_track_id?: string | null
          spotify_track_id?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_tracks: {
        Row: {
          id: string
          user_id: string
          track_id: string
          personal_rating: number | null
          tags: string[] | null
          notes: string | null
          source: string | null
          location: string | null
          play_count: number
          last_played_at: string | null
          crate_name: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          track_id: string
          personal_rating?: number | null
          tags?: string[] | null
          notes?: string | null
          source?: string | null
          location?: string | null
          play_count?: number
          last_played_at?: string | null
          crate_name?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          track_id?: string
          personal_rating?: number | null
          tags?: string[] | null
          notes?: string | null
          source?: string | null
          location?: string | null
          play_count?: number
          last_played_at?: string | null
          crate_name?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      track_transitions: {
        Row: {
          id: string
          user_id: string
          from_track_id: string
          to_track_id: string
          rating: number | null
          worked_well: boolean | null
          context: string | null
          vibe_tags: string[] | null
          bpm_diff: number | null
          key_compatible: boolean | null
          played_at: string
          venue: string | null
          event_name: string | null
          set_id: string | null
          transition_type: string | null
          transition_length_sec: number | null
          is_public: boolean
          likes_count: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          from_track_id: string
          to_track_id: string
          rating?: number | null
          worked_well?: boolean | null
          context?: string | null
          vibe_tags?: string[] | null
          bpm_diff?: number | null
          key_compatible?: boolean | null
          played_at?: string
          venue?: string | null
          event_name?: string | null
          set_id?: string | null
          transition_type?: string | null
          transition_length_sec?: number | null
          is_public?: boolean
          likes_count?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          from_track_id?: string
          to_track_id?: string
          rating?: number | null
          worked_well?: boolean | null
          context?: string | null
          vibe_tags?: string[] | null
          bpm_diff?: number | null
          key_compatible?: boolean | null
          played_at?: string
          venue?: string | null
          event_name?: string | null
          set_id?: string | null
          transition_type?: string | null
          transition_length_sec?: number | null
          is_public?: boolean
          likes_count?: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      track_metadata_sources: {
        Row: {
          id: string
          track_id: string
          user_id: string | null
          source_type: 'rekordbox' | 'traktor' | 'spotify' | 'musicbrainz' | 'manual' | 'serato' | 'denon'
          source_confidence: number
          bpm: number | null
          key: string | null
          camelot_key: string | null
          energy_level: number | null
          metadata: Json | null
          imported_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          track_id: string
          user_id?: string | null
          source_type: 'rekordbox' | 'traktor' | 'spotify' | 'musicbrainz' | 'manual' | 'serato' | 'denon'
          source_confidence?: number
          bpm?: number | null
          key?: string | null
          camelot_key?: string | null
          energy_level?: number | null
          metadata?: Json | null
          imported_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          track_id?: string
          user_id?: string | null
          source_type?: 'rekordbox' | 'traktor' | 'spotify' | 'musicbrainz' | 'manual' | 'serato' | 'denon'
          source_confidence?: number
          bpm?: number | null
          key?: string | null
          camelot_key?: string | null
          energy_level?: number | null
          metadata?: Json | null
          imported_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      rekordbox_data: {
        Row: {
          id: string
          track_id: string
          user_id: string
          rekordbox_track_id: string | null
          file_path: string | null
          beatgrid: Json | null
          waveform: Json | null
          cue_points: Json | null
          hot_cues: Json | null
          memory_cues: Json | null
          color: string | null
          rating: number | null
          comment: string | null
          play_count: number
          last_played_at: string | null
          playlists: string[] | null
          imported_from_file: string | null
          imported_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          track_id: string
          user_id: string
          rekordbox_track_id?: string | null
          file_path?: string | null
          beatgrid?: Json | null
          waveform?: Json | null
          cue_points?: Json | null
          hot_cues?: Json | null
          memory_cues?: Json | null
          color?: string | null
          rating?: number | null
          comment?: string | null
          play_count?: number
          last_played_at?: string | null
          playlists?: string[] | null
          imported_from_file?: string | null
          imported_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          track_id?: string
          user_id?: string
          rekordbox_track_id?: string | null
          file_path?: string | null
          beatgrid?: Json | null
          waveform?: Json | null
          cue_points?: Json | null
          hot_cues?: Json | null
          memory_cues?: Json | null
          color?: string | null
          rating?: number | null
          comment?: string | null
          play_count?: number
          last_played_at?: string | null
          playlists?: string[] | null
          imported_from_file?: string | null
          imported_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      track_matches: {
        Row: {
          id: string
          song_id: string
          physical_track_id: string | null
          digital_track_id: string | null
          match_confidence: number | null
          match_method: string | null
          user_confirmed: boolean
          confirmed_by: string | null
          confirmed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          song_id: string
          physical_track_id?: string | null
          digital_track_id?: string | null
          match_confidence?: number | null
          match_method?: string | null
          user_confirmed?: boolean
          confirmed_by?: string | null
          confirmed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          song_id?: string
          physical_track_id?: string | null
          digital_track_id?: string | null
          match_confidence?: number | null
          match_method?: string | null
          user_confirmed?: boolean
          confirmed_by?: string | null
          confirmed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

