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
          discogs_release_id: number
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
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          discogs_release_id: number
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
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          discogs_release_id?: number
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

