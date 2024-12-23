import { create } from 'zustand';
import { Message } from '../types/message.types';

interface MessagesState {
  messages: Message[];
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
}

export const useMessagesStore = create<MessagesState>((set) => ({
  messages: [],
  addMessage: (message) => 
    set((state) => ({
      messages: [...state.messages, message]
    })),
  setMessages: (messages) => set({ messages })
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
