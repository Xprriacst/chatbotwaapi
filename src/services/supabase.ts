import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';
import { SUPABASE_CONFIG } from '../config/constants';

if (!SUPABASE_CONFIG.URL || !SUPABASE_CONFIG.ANON_KEY) {
  throw new Error('Missing Supabase configuration');
}

// Initialize Supabase client
export const supabase = createClient<Database>(
  SUPABASE_CONFIG.URL,
  SUPABASE_CONFIG.ANON_KEY
);