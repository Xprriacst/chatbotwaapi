import { useEffect, useCallback, useRef } from 'react';
import { useMessagesStore } from '../store/messages.store';
import { MessagesService } from '../services/messages/messages.service';
import { MESSAGES_CONFIG } from '../services/messages/messages.config';

export function useMessages() {
  const { messages, addMessage, setMessages } = useMessagesStore();
  const pollingInterval = useRef<NodeJS.Timeout>();

  const loadMessages = useCallback(async () => {
    try {
      const fetchedMessages = await MessagesService.fetchMessages();
      setMessages(fetchedMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  }, [setMessages]);

  useEffect(() => {
    // Initial load
    loadMessages();

    // Setup polling
    pollingInterval.current = setInterval(loadMessages, MESSAGES_CONFIG.POLLING_INTERVAL);

    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, [loadMessages]);

  return {
    messages,
    addMessage,
    refreshMessages: loadMessages
  };
}
