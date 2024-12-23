export const MESSAGES_CONFIG = {
  FETCH_LIMIT: 50,
  POLLING_INTERVAL: 5000, // 5 secondes
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000 // 1 seconde entre les tentatives
} as const;