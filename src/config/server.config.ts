import { z } from 'zod';

// Schema for server environment variables
const serverEnvSchema = z.object({
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

// Server environment configuration
export const SERVER_ENV = {
  WAAPI: {
    ACCESS_TOKEN: process.env.WAAPI_ACCESS_TOKEN || '',
    INSTANCE_ID: process.env.WAAPI_INSTANCE_ID || '',
    PHONE_NUMBER: process.env.WAAPI_PHONE_NUMBER || '',
    BASE_URL: process.env.WAAPI_BASE_URL || 'https://waapi.app/api/v1'
  },
  SUPABASE: {
    URL: process.env.SUPABASE_URL || '',
    ANON_KEY: process.env.SUPABASE_ANON_KEY || ''
  }
} as const;

// Validate server environment variables
export const validateServerEnv = () => {
  try {
    serverEnvSchema.parse(SERVER_ENV);
  } catch (error) {
    console.error('Server environment validation failed:', error);
    const missingVars = (error as z.ZodError).issues.map(issue => 
      issue.path.join('.')
    ).join(', ');
    throw new Error(`Missing or invalid server environment variables: ${missingVars}`);
  }
};
