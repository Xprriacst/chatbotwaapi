import { WebhookEvent } from '../../types/waapi.types';
import { useMessagesStore } from '../../store/messages.store';
import { WEBSOCKET_CONFIG, getWebSocketUrl } from './websocket.config';
import { convertWAMessageToMessage } from '../../utils/message.utils';

export class WebSocketService {
  private static instance: WebSocketService | null = null;
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private pingInterval: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  connect(): void {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    try {
      this.ws = new WebSocket(getWebSocketUrl());
      this.setupEventHandlers();
      this.startPingInterval();
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.attemptReconnect();
    }
  }

  private setupEventHandlers(): void {
    if (!this.ws) return;

    this.ws.onopen = this.handleOpen.bind(this);
    this.ws.onmessage = this.handleMessage.bind(this);
    this.ws.onclose = this.handleClose.bind(this);
    this.ws.onerror = this.handleError.bind(this);
  }

  private handleOpen(): void {
    console.log('WebSocket connected');
    this.reconnectAttempts = 0;
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data) as WebhookEvent;
      const store = useMessagesStore.getState();
      
      switch (data.event) {
        case 'message':
        case 'message_create': {
          const message = convertWAMessageToMessage(data.data.message);
          store.addMessage(message);
          break;
        }
        case 'message_ack': {
          const message = convertWAMessageToMessage(data.data.message);
          const updatedMessages = store.messages.map(msg => 
            msg.id === message.id ? { ...msg, status: message.status } : msg
          );
          store.setMessages(updatedMessages);
          break;
        }
      }
    } catch (error) {
      console.error('Error processing websocket message:', error);
    }
  }

  private handleClose(): void {
    this.cleanup();
    this.attemptReconnect();
  }

  private handleError(error: Event): void {
    console.error('WebSocket error:', error);
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < WEBSOCKET_CONFIG.MAX_RECONNECT_ATTEMPTS) {
      this.reconnectTimeout = setTimeout(() => {
        this.reconnectAttempts++;
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${WEBSOCKET_CONFIG.MAX_RECONNECT_ATTEMPTS})`);
        this.connect();
      }, WEBSOCKET_CONFIG.RECONNECT_INTERVAL * Math.pow(2, this.reconnectAttempts));
    }
  }

  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, WEBSOCKET_CONFIG.PING_INTERVAL);
  }

  private cleanup(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  disconnect(): void {
    this.cleanup();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
