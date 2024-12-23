import { WebhookEvent } from '../types/waapi.types';
import { convertWAMessageToMessage } from '../utils/message.utils';
import { useMessagesStore } from '../store/messages.store';

export class WebSocketService {
  private static ws: WebSocket | null = null;
  private static reconnectAttempts = 0;
  private static maxReconnectAttempts = 5;
  private static reconnectTimeout: NodeJS.Timeout | null = null;

  static connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    const wsUrl = import.meta.env.DEV 
      ? `ws://localhost:${import.meta.env.VITE_WEBHOOK_PORT}`
      : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/.netlify/functions/websocket`;
    
    console.log('Connecting to WebSocket:', wsUrl);
    
    try {
      this.ws = new WebSocket(wsUrl);
      this.ws.onopen = () => {
        console.log('WebSocket connected successfully');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = this.handleMessage;
      this.ws.onclose = this.handleClose;
      this.ws.onerror = this.handleError;
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.attemptReconnect();
    }
  }

  private static handleMessage = (event: MessageEvent) => {
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
  };

  private static handleClose = () => {
    console.log('WebSocket connection closed');
    this.attemptReconnect();
  };

  private static handleError = (error: Event) => {
    console.error('WebSocket error:', error);
  };

  private static attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      console.log(`Attempting to reconnect (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
      this.reconnectTimeout = setTimeout(() => {
        this.reconnectAttempts++;
        this.connect();
      }, 1000 * Math.pow(2, this.reconnectAttempts));
    }
  }

  static disconnect() {
    console.log('Disconnecting WebSocket');
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }
}