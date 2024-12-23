import { z } from 'zod';

const envSchema = z.object({
  WAAPI: z.object({
    ACCESS_TOKEN: z.string(),
    INSTANCE_ID: z.string(),
    PHONE_NUMBER: z.string(),
    BASE_URL: z.string().url()
  }),
  SUPABASE: z.object({
    URL: z.string().url(),
    ANON_KEY: z.string()
  })
});

export const ENV = {
  WAAPI: {
    ACCESS_TOKEN: import.meta.env.VITE_WAAPI_ACCESS_TOKEN,
    INSTANCE_ID: import.meta.env.VITE_WAAPI_INSTANCE_ID,
    PHONE_NUMBER: import.meta.env.VITE_WAAPI_PHONE_NUMBER,
    BASE_URL: import.meta.env.VITE_WAAPI_BASE_URL
  },
  SUPABASE: {
    URL: import.meta.env.VITE_SUPABASE_URL,
    ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY
  }
} as const;

// Validate environment variables
const validateEnv = () => {
  try {
    envSchema.parse(ENV);
  } catch (error) {
    console.error('Environment validation failed:', error);
    throw new Error('Missing required environment variables');
  }
};

validateEnv();

export type EnvConfig = typeof ENV;