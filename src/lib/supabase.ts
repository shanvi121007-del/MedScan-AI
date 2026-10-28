import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Supabase client for the MedScan AI frontend.
 *
 * Uses ONLY the publishable (anon) key — never the service-role key. Any row
 * access is governed by Row Level Security on the database.
 *
 * Reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` from the Vite
 * environment. Falls back to `VITE_SUPABASE_ANON_KEY` if the publishable key
 * name is not present (the conventional variable name).
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabasePublishableKey =
  (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined) ??
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined);

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (client) return client;
  if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error(
      'Supabase is not configured. Set VITE_SUPABASE_URL and ' +
        'VITE_SUPABASE_PUBLISHABLE_KEY (or VITE_SUPABASE_ANON_KEY) in your .env file.',
    );
  }
  client = createClient(supabaseUrl, supabasePublishableKey, {
    auth: { persistSession: true },
  });
  return client;
}

export const supabase = getSupabase();

export const supabaseConfigured = Boolean(supabaseUrl && supabasePublishableKey);
