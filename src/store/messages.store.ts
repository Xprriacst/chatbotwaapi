import { create } from 'zustand';
import { Message } from '../types/message.types';

interface MessagesState {
  messages: Message[];
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
}

export const useMessagesStore = create<MessagesState>((set) => ({
  messages: [],
  addMessage: (message) => {
    console.log('Adding message to store:', message);
    set((state) => {
      const newMessages = [...state.messages, message];
      console.log('Updated messages:', newMessages);
      return { messages: newMessages };
    });
  },
  setMessages: (messages) => {
    console.log('Setting messages:', messages);
    set({ messages });
  }
}));

// Hook personnalisé pour utiliser le store
export const useMessages = () => {
  const store = useMessagesStore();
  return {
    messages: store.messages,
    addMessage: store.addMessage,
    setMessages: store.setMessages
  };
};