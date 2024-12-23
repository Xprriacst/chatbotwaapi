export const ENV = {
  WAAPI: {
    ACCESS_TOKEN: process.env.VITE_WAAPI_ACCESS_TOKEN,
    INSTANCE_ID: process.env.VITE_WAAPI_INSTANCE_ID,
    PHONE_NUMBER: process.env.VITE_WAAPI_PHONE_NUMBER,
    BASE_URL: process.env.VITE_WAAPI_BASE_URL
  }
} as const;