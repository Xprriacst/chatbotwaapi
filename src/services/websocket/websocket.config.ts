export const WEBSOCKET_CONFIG = {
  // Nombre maximum de tentatives de reconnexion
  MAX_RECONNECT_ATTEMPTS: 5,
  
  // Intervalle de base entre les tentatives de reconnexion (en ms)
  RECONNECT_INTERVAL: 1000,
  
  // Intervalle d'envoi des pings pour maintenir la connexion active (en ms)
  PING_INTERVAL: 30000
} as const;

/**
 * Retourne l'URL WebSocket appropriée selon l'environnement
 */
export function getWebSocketUrl(): string {
  // En développement, utilise le serveur local
  if (import.meta.env.DEV) {
    return `ws://localhost:${import.meta.env.VITE_WEBHOOK_PORT}`;
  }
  
  // En production, utilise l'URL du site avec le bon protocole
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/api/websocket`;
}
