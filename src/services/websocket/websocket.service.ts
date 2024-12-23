import { WebhookEvent } from '../../types/waapi.types';
import { useMessagesStore } from '../../store/messages.store';
import { WEBSOCKET_CONFIG, getWebSocketUrl, isWebSocketSupported } from './websocket.config';
import { convertWAMessageToMessage } from '../../utils/message.utils';

export class WebSocketService {
  private static instance: WebSocket | null = null;
  private static connectionTimeout: NodeJS.Timeout | null = null;
  private static reconnectAttempts = 0;
  private static pingInterval: NodeJS.Timeout | null = null;

  static connect(): void {
    if (!isWebSocketSupported()) {
      console.error('WebSocket is not supported in this browser');
      return;
    }

    if (this.instance?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    const wsUrl = getWebSocketUrl();
    console.log('Connecting to WebSocket:', wsUrl);

    try {
      this.instance = new WebSocket(wsUrl);
      this.setupConnectionTimeout();
      this.setupEventHandlers();
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.handleConnectionFailure();
    }
  }

  private static setupConnectionTimeout(): void {
    this.connectionTimeout = setTimeout(() => {
      if (this.instance?.readyState !== WebSocket.OPEN) {
        console.log('Connection timeout - attempting reconnect');
        this.handleConnectionFailure();
      }
    }, WEBSOCKET_CONFIG.CONNECTION_TIMEOUT);
  }

  private static setupEventHandlers(): void {
    if (!this.instance) return;

    this.instance.onopen = this.handleOpen.bind(this);
    this.instance.onmessage = this.handleMessage.bind(this);
    this.instance.onclose = this.handleClose.bind(this);
    this.instance.onerror = this.handleError.bind(this);
  }

  private static handleOpen(): void {
    console.log('WebSocket connected successfully');
    this.clearConnectionTimeout();
    this.reconnectAttempts = 0;
    this.startPingInterval();
  }

  private static handleMessage(event: MessageEvent): void {
    try {
      console.log('Received WebSocket message:', event.data);
      const data = JSON.parse(event.data) as WebhookEvent;
      const store = useMessagesStore.getState();
      
      switch (data.event) {
        case 'message':
        case 'message_create': {
          const message = convertWAMessageToMessage(data.data.message);
          console.log('Converting webhook message to app message:', message);
          store.addMessage(message);
          break;
        }
        case 'message_ack': {
          const message = convertWAMessageToMessage(data.data.message);
          console.log('Updating message status:', message);
          store.setMessages(
            store.messages.map(msg => 
              msg.id === message.id ? { ...msg, status: message.status } : msg
            )
          );
          break;
        }
      }
    } catch (error) {
      console.error('Error processing websocket message:', error);
    }
  }

  private static handleClose(): void {
    console.log('WebSocket connection closed');
    this.cleanup();
    this.handleConnectionFailure();
  }

  private static handleError(error: Event): void {
    console.error('WebSocket error:', error);
  }

  private static handleConnectionFailure(): void {
    this.cleanup();
    if (this.reconnectAttempts < WEBSOCKET_CONFIG.MAX_RECONNECT_ATTEMPTS) {
      const delay = WEBSOCKET_CONFIG.RECONNECT_INTERVAL * Math.pow(2, this.reconnectAttempts);
      console.log(`Attempting to reconnect (${this.reconnectAttempts + 1}/${WEBSOCKET_CONFIG.MAX_RECONNECT_ATTEMPTS}) in ${delay}ms`);
      setTimeout(() => {
        this.reconnectAttempts++;
        this.connect();
      }, delay);
    } else {
      console.log('Max reconnection attempts reached');
    }
  }

  private static startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      if (this.instance?.readyState === WebSocket.OPEN) {
        this.instance.send(JSON.stringify({ type: 'ping' }));
      }
    }, WEBSOCKET_CONFIG.PING_INTERVAL);
  }

  private static clearConnectionTimeout(): void {
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
  }

  private static cleanup(): void {
    this.clearConnectionTimeout();
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    if (this.instance) {
      this.instance.close();
      this.instance = null;
    }
  }

  static disconnect(): void {
    console.log('Disconnecting WebSocket');
    this.cleanup();
  }
}
