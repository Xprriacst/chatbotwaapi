import { z } from 'zod';

declare global {
  const __WAAPI_ACCESS_TOKEN__: string;
  const __WAAPI_INSTANCE_ID__: string;
  const __WAAPI_PHONE_NUMBER__: string;
  const __WAAPI_BASE_URL__: string;
  const __SUPABASE_URL__: string;
  const __SUPABASE_ANON_KEY__: string;
}

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
  }),
  OPENAI: z.object({
    API_KEY: z.string().optional()
  }).optional()
});

// Environment variables
export const ENV = {
  WAAPI: {
    ACCESS_TOKEN: __WAAPI_ACCESS_TOKEN__,
    INSTANCE_ID: __WAAPI_INSTANCE_ID__,
    PHONE_NUMBER: __WAAPI_PHONE_NUMBER__,
    BASE_URL: __WAAPI_BASE_URL__
  },
  SUPABASE: {
    URL: __SUPABASE_URL__,
    ANON_KEY: __SUPABASE_ANON_KEY__
  },
  OPENAI: undefined
} as const;

// Validate environment variables
const validateEnv = () => {
  try {
    envSchema.parse(ENV);
  } catch (error) {
    console.error('Environment validation failed:', error);
    const missingVars = (error as z.ZodError).issues.map(issue => 
      issue.path.join('.')
    ).join(', ');
    throw new Error(`Missing or invalid environment variables: ${missingVars}`);
  }
};

validateEnv();

export type EnvConfig = typeof ENV;
