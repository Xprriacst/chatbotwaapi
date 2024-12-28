import { z } from 'zod';

// Schema for environment variables
const envSchema = z.object({
  WAAPI: z.object({
    ACCESS_TOKEN: z.string().min(1, 'WAAPI access token is required'),
    INSTANCE_ID: z.string().min(1, 'WAAPI instance ID is required'),
    PHONE_NUMBER: z.string().min(1, 'WAAPI phone number is required'),
    BASE_URL: z.string().url('WAAPI base URL must be a valid URL')
  }),
  SUPABASE: z.object({
    URL: z.string().url('Supabase URL must be a valid URL'),
    ANON_KEY: z.string().min(1, 'Supabase anonymous key is required')
  })
});

// Environment configuration
export const CONFIG = {
  WAAPI: {
    ACCESS_TOKEN: import.meta.env.VITE_WAAPI_ACCESS_TOKEN || process.env.WAAPI_ACCESS_TOKEN || '',
    INSTANCE_ID: import.meta.env.VITE_WAAPI_INSTANCE_ID || process.env.WAAPI_INSTANCE_ID || '',
    PHONE_NUMBER: import.meta.env.VITE_WAAPI_PHONE_NUMBER || process.env.WAAPI_PHONE_NUMBER || '',
    BASE_URL: import.meta.env.VITE_WAAPI_BASE_URL || process.env.WAAPI_BASE_URL || 'https://waapi.app/api/v1'
  },
  SUPABASE: {
    URL: import.meta.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '',
    ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ''
  }
} as const;

// Validate environment variables
export const validateConfig = () => {
  try {
    envSchema.parse(CONFIG);
  } catch (error) {
    console.error('Environment validation failed:', error);
    const missingVars = (error as z.ZodError).issues.map(issue => 
      issue.path.join('.')
    ).join(', ');
    throw new Error(`Missing or invalid environment variables: ${missingVars}`);
  }
};
