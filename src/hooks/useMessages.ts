import { useEffect, useCallback } from 'react';
import { useMessagesStore } from '../store/messages.store';
import { MessageRepository } from '../services/messages/message.repository';
import { RealtimeService } from '../services/realtime.service';
import { useAuth } from './useAuth';

export function useMessages() {
  const { messages, addMessage, setMessages } = useMessagesStore();
  const { user } = useAuth();

  const loadMessages = useCallback(async () => {
    if (!user) return;

    try {
      await MessageRepository.syncMessages(user.id);
      const fetchedMessages = await MessageRepository.getMessages(user.id);
      setMessages(fetchedMessages);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  }, [user, setMessages]);

  useEffect(() => {
    if (user) {
      loadMessages();
      RealtimeService.subscribe(user.id);
      return () => RealtimeService.unsubscribe();
    }
  }, [user, loadMessages]);

  const sendMessage = useCallback(async (text: string, recipientPhone: string) => {
    if (!user) return;

    try {
      const message = await MessageRepository.sendMessage(text, recipientPhone, user.id);
      addMessage(message);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [user, addMessage]);

  return {
    messages,
    sendMessage,
    refreshMessages: loadMessages
  };
}
