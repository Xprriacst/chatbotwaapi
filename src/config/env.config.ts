// Environment configuration
export const ENV = {
  WAAPI: {
    ACCESS_TOKEN: import.meta.env.VITE_WAAPI_ACCESS_TOKEN,
    INSTANCE_ID: import.meta.env.VITE_WAAPI_INSTANCE_ID,
    PHONE_NUMBER: import.meta.env.VITE_WAAPI_PHONE_NUMBER,
    BASE_URL: import.meta.env.VITE_WAAPI_BASE_URL
  },
  WEBHOOK: {
    PORT: import.meta.env.VITE_WEBHOOK_PORT || 3001
  }
} as const;

// Validate environment variables
const validateEnv = () => {
  const required = [
    'VITE_WAAPI_ACCESS_TOKEN',
    'VITE_WAAPI_INSTANCE_ID',
    'VITE_WAAPI_PHONE_NUMBER',
    'VITE_WAAPI_BASE_URL'
  ];

  const missing = required.filter(key => !import.meta.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Please check your .env file or environment configuration.'
    );
  }
};

// Run validation
validateEnv();