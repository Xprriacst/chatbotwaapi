import { z } from 'zod';

// Define environment schema with optional values
const envSchema = z.object({
  WAAPI: z.object({
    ACCESS_TOKEN: z.string().default('SquEn91sHS4ptv5XmZLCwhUNlRVUTqbPhsgovuHzc0d62ef2'),
    INSTANCE_ID: z.string().default('32696'),
    PHONE_NUMBER: z.string().default('+33781055952'),
    BASE_URL: z.string().url().default('https://waapi.app/api/v1')
  }),
  SUPABASE: z.object({
    URL: z.string().url(),
    ANON_KEY: z.string()
  }).optional()
});

// Environment configuration with fallback values
export const ENV = {
  WAAPI: {
    ACCESS_TOKEN: import.meta.env.VITE_WAAPI_ACCESS_TOKEN || 'SquEn91sHS4ptv5XmZLCwhUNlRVUTqbPhsgovuHzc0d62ef2',
    INSTANCE_ID: import.meta.env.VITE_WAAPI_INSTANCE_ID || '32696',
    PHONE_NUMBER: import.meta.env.VITE_WAAPI_PHONE_NUMBER || '+33781055952',
    BASE_URL: import.meta.env.VITE_WAAPI_BASE_URL || 'https://waapi.app/api/v1'
  },
  SUPABASE: {
    URL: import.meta.env.VITE_SUPABASE_URL,
    ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY
  }
} as const;

// Validate environment variables
try {
  envSchema.parse(ENV);
} catch (error) {
  console.warn('Environment validation warning:', error);
  // Don't throw error, just log warning since we have fallback values
}

export type EnvConfig = typeof ENV;