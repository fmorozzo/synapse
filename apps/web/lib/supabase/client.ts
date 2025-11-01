import { createBrowserClient as createClient } from '@supabase/ssr';
import type { Database } from '@synapse/supabase';

export function createBrowserClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

