import { WebhookEvent } from '../types/waapi.types';
import { convertWAMessageToMessage } from '../utils/message.utils';
import { useMessagesStore } from '../store/messages.store';

export class WebSocketService {
  private static ws: WebSocket | null = null;
  private static reconnectAttempts = 0;
  private static maxReconnectAttempts = 5;
  private static reconnectTimeout: NodeJS.Timeout | null = null;

  static connect() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/.netlify/functions/websocket`;
    console.log('Connecting to WebSocket:', wsUrl);
    
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      console.log('WebSocket connected successfully');
      this.addTestMessage();
    };

    this.ws.onmessage = this.handleMessage;
    this.ws.onclose = this.handleClose;
    this.ws.onerror = this.handleError;
  }

  private static handleMessage = (event: MessageEvent) => {
    console.log('Raw WebSocket message received:', event.data);
    
    try {
      const data = JSON.parse(event.data) as WebhookEvent;
      console.log('Parsed WebSocket message:', data);
      
      switch (data.event) {
        case 'message':
        case 'message_create':
          this.handleNewMessage(data);
          break;
        case 'message_ack':
          this.handleMessageStatus(data);
          break;
      }
    } catch (error) {
      console.error('Error processing websocket message:', error);
    }
  };

  private static handleNewMessage(data: WebhookEvent) {
    const message = convertWAMessageToMessage(data.data.message);
    console.log('Converting to message format:', message);
    useMessagesStore.getState().addMessage(message);
    console.log('Current store state:', useMessagesStore.getState().messages);
  }

  private static handleMessageStatus(data: WebhookEvent) {
    console.log('Processing message_ack event');
    const message = convertWAMessageToMessage(data.data.message);
    const messages = useMessagesStore.getState().messages;
    console.log('Current messages before update:', messages);
    const updatedMessages = messages.map(msg => 
      msg.id === message.id ? { ...msg, status: message.status } : msg
    );
    console.log('Updated messages:', updatedMessages);
    useMessagesStore.getState().setMessages(updatedMessages);
  }

  private static handleClose = (event: CloseEvent) => {
    console.log('WebSocket closed:', event);
    this.attemptReconnect();
  };

  private static handleError = (error: Event) => {
    console.error('WebSocket error:', error);
  };

  private static attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectTimeout = setTimeout(() => {
        console.log(`Attempting to reconnect (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
        this.reconnectAttempts++;
        this.connect();
      }, 1000 * Math.pow(2, this.reconnectAttempts));
    }
  }

  private static addTestMessage() {
    useMessagesStore.getState().addMessage({
      id: 'test-' + Date.now(),
      text: 'Test message',
      isBot: false,
      timestamp: Date.now(),
      status: 'sent'
    });
  }

  static disconnect() {
    if (this.ws) {
      console.log('Disconnecting WebSocket');
      this.ws.close();
      this.ws = null;
    }
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }
}
