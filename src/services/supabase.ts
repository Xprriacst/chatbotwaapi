import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/supabase';
import { ENV } from '../config/env.config';

if (!ENV.SUPABASE.URL || !ENV.SUPABASE.ANON_KEY) {
  throw new Error('Missing Supabase configuration');
}

export const supabase = createClient<Database>(
  ENV.SUPABASE.URL,
  ENV.SUPABASE.ANON_KEY
);