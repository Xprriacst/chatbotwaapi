import { ENV } from './env.config';

export const SUPABASE_CONFIG = {
  URL: ENV.SUPABASE.URL,
  ANON_KEY: ENV.SUPABASE.ANON_KEY,
  TABLES: {
    CONVERSATIONS: 'conversations',
    MESSAGES: 'messages'
  }
} as const;