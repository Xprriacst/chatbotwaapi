import { useMessagesStore } from '../store/messages.store';
import { WebhookEvent } from '../types/waapi.types';
import { convertWAMessageToMessage } from '../utils/message.utils';

export class WebSocketService {
  private static ws: WebSocket | null = null;
  private static reconnectAttempts = 0;
  private static maxReconnectAttempts = 5;
  private static reconnectTimeout: NodeJS.Timeout | null = null;

  static connect() {
    if (this.ws?.readyState === WebSocket.OPEN) return;

    // Use secure WebSocket for production, regular for development
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/.netlify/functions/websocket`;
    
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as WebhookEvent;
        console.log('WebSocket message received:', data);
        
        switch (data.event) {
          case 'message':
          case 'message_create': {
            const message = convertWAMessageToMessage(data.data.message);
            useMessagesStore.getState().addMessage(message);
            break;
          }
          case 'message_ack': {
            const message = convertWAMessageToMessage(data.data.message);
            const messages = useMessagesStore.getState().messages;
            const updatedMessages = messages.map(msg => 
              msg.id === message.id ? { ...msg, status: message.status } : msg
            );
            useMessagesStore.getState().setMessages(updatedMessages);
            break;
          }
        }
      } catch (error) {
        console.error('Error processing websocket message:', error);
      }
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectTimeout = setTimeout(() => {
          console.log(`Attempting to reconnect (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
          this.reconnectAttempts++;
          this.connect();
        }, 1000 * Math.pow(2, this.reconnectAttempts));
      }
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  static disconnect() {
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
