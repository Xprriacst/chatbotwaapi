import { useEffect, useCallback, useRef } from 'react';
import { useMessagesStore } from '../store/messages.store';
import { MessagesService } from '../services/messages/messages.service';
import { MESSAGES_CONFIG } from '../services/messages/messages.config';

export function useMessages() {
  const { messages, addMessage, setMessages } = useMessagesStore();
  const pollingInterval = useRef<NodeJS.Timeout>();
  const lastMessageId = useRef<string | null>(null);

  const loadMessages = useCallback(async () => {
    try {
      const fetchedMessages = await MessagesService.fetchMessages();
      
      // Vérifier les nouveaux messages
      if (fetchedMessages.length > 0) {
        const latestMessageId = fetchedMessages[0].id;
        if (latestMessageId !== lastMessageId.current) {
          lastMessageId.current = latestMessageId;
          
          // Mettre à jour uniquement avec les nouveaux messages
          const newMessages = fetchedMessages.filter(msg => 
            !messages.some(existing => existing.id === msg.id)
          );
          
          if (newMessages.length > 0) {
            setMessages([...messages, ...newMessages]);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  }, [messages, setMessages]);

  useEffect(() => {
    // Chargement initial
    loadMessages();

    // Configuration du polling
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
