export const WEBSOCKET_CONFIG = {
  MAX_RECONNECT_ATTEMPTS: 5,
  RECONNECT_INTERVAL: 1000,
  PING_INTERVAL: 30000,
  CONNECTION_TIMEOUT: 5000
} as const;

export function getWebSocketUrl(): string {
  if (import.meta.env.DEV) {
    return `ws://localhost:${import.meta.env.VITE_WEBHOOK_PORT}`;
  }
  
  // For production, use Netlify's function URL
  return `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/.netlify/functions/websocket`;
}

export function isWebSocketSupported(): boolean {
  return 'WebSocket' in window;
}
