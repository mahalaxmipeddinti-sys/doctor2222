// src/lib/supabase.ts
// Official Supabase Client SDK Initialization for GenomeGuard AI / DNA Doctor

import { createClient } from '@supabase/supabase-js';

// Read from runtime environment variables (injected via .env or Cloud Run / AI Studio secrets)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// Client instance: if keys are present, initializes live connection; otherwise provides safe fallback
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;
