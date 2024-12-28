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
  }),
  OPENAI: z.object({
    API_KEY: z.string().optional()
  }).optional()
});

// Get environment variables with fallback to non-VITE_ prefixed versions
const getEnvVar = (name: string): string => {
  const viteVar = import.meta.env[`VITE_${name}`];
  const normalVar = import.meta.env[name];
  return viteVar || normalVar || '';
};

// Environment variables
export const ENV = {
  WAAPI: {
    ACCESS_TOKEN: getEnvVar('WAAPI_ACCESS_TOKEN'),
    INSTANCE_ID: getEnvVar('WAAPI_INSTANCE_ID'),
    PHONE_NUMBER: getEnvVar('WAAPI_PHONE_NUMBER'),
    BASE_URL: getEnvVar('WAAPI_BASE_URL')
  },
  SUPABASE: {
    URL: getEnvVar('SUPABASE_URL'),
    ANON_KEY: getEnvVar('SUPABASE_ANON_KEY')
  },
  OPENAI: getEnvVar('OPENAI_API_KEY') ? {
    API_KEY: getEnvVar('OPENAI_API_KEY')
  } : undefined
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
