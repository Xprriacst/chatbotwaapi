import { useEffect } from 'react';
import { useMessagesStore } from '../store/messages.store';
import { WaAPIMessagesService } from '../services/waapi/messages.service';
import { convertWAMessageToMessage } from '../utils/message.utils';
import { WebSocketService } from '../services/websocket.service';

export function useMessages() {
  const { messages, addMessage, setMessages } = useMessagesStore();

  useEffect(() => {
    // Load initial messages
    const loadMessages = async () => {
      try {
        const waMessages = await WaAPIMessagesService.fetchMessages();
        const formattedMessages = waMessages.map(convertWAMessageToMessage);
        setMessages(formattedMessages);
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    };

    // Connect to WebSocket
    WebSocketService.connect();
    loadMessages();

    // Cleanup
    return () => {
      WebSocketService.disconnect();
    };
  }, [setMessages]);

  return {
    messages,
    addMessage
  };
}
