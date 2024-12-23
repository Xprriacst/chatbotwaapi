export const WAAPI_CONFIG = {
  ACCESS_TOKEN: import.meta.env.VITE_WAAPI_ACCESS_TOKEN || 'SquEn91sHS4ptv5XmZLCwhUNlRVUTqbPhsgovuHzc0d62ef2',
  INSTANCE_ID: import.meta.env.VITE_WAAPI_INSTANCE_ID || '32696',
  PHONE_NUMBER: import.meta.env.VITE_WAAPI_PHONE_NUMBER || '+33781055952',
  BASE_URL: import.meta.env.VITE_WAAPI_BASE_URL || 'https://waapi.app/api/v1'
};

export const MESSAGE_TYPES = {
  INCOMING: 'incoming',
  OUTGOING: 'outgoing'
} as const;