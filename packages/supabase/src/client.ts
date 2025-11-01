import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

/**
 * Create a Supabase client for server-side usage
 */
export function createServerClient(
  supabaseUrl: string,
  supabaseKey: string
) {
  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
  });
}

/**
 * Create a Supabase client for client-side usage
 */
export function createBrowserClient(
  supabaseUrl: string,
  supabaseAnonKey: string
) {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      storageKey: 'synapse-auth',
    },
  });
}

// Type helper for Supabase client
export type SupabaseClient = ReturnType<typeof createBrowserClient>;

