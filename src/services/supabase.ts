import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';
import { SUPABASE_CONFIG } from '../config/constants';

if (!SUPABASE_CONFIG.URL || !SUPABASE_CONFIG.ANON_KEY) {
  throw new Error('Missing Supabase configuration');
}

// Initialize Supabase client for browser
export const supabase = createClient<Database>(
  SUPABASE_CONFIG.URL,
  SUPABASE_CONFIG.ANON_KEY
);

// Initialize Supabase client for Netlify functions
export const createSupabaseClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase configuration in environment variables');
  }

  return createClient<Database>(supabaseUrl, supabaseKey);
};