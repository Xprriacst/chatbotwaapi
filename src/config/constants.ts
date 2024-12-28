import { ENV } from './env.config';

export const MESSAGE_TYPES = {
  INCOMING: 'incoming',
  OUTGOING: 'outgoing'
} as const;

// API endpoints
export const API_ENDPOINTS = {
  WEBHOOK: '/api/webhook',
  WEBSOCKET: '/api/websocket'
} as const;

// WAAPI configuration
export const WAAPI_CONFIG = {
  ACCESS_TOKEN: import.meta.env.VITE_WAAPI_ACCESS_TOKEN,
  INSTANCE_ID: import.meta.env.VITE_WAAPI_INSTANCE_ID,
  PHONE_NUMBER: import.meta.env.VITE_WAAPI_PHONE_NUMBER,
  BASE_URL: import.meta.env.VITE_WAAPI_BASE_URL || 'https://waapi.app/api/v1',
  ENDPOINTS: {
    SEND_MESSAGE: '/client/action/send-message',
    FETCH_MESSAGES: '/client/action/fetch-messages',
    GET_MESSAGE: '/client/action/get-message-by-id'
  }
} as const;

// Supabase configuration
export const SUPABASE_CONFIG = {
  URL: import.meta.env.VITE_SUPABASE_URL,
  ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY
} as const;

// WebSocket events
export const WS_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  MESSAGE: 'message',
  ERROR: 'error'
} as const;

// Message status
export const MESSAGE_STATUS = {
  SENT: 'sent',
  DELIVERED: 'delivered',
  READ: 'read',
  ERROR: 'error'
} as const;