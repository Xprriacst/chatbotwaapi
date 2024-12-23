import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
}

export function ChatInput({ onSendMessage }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Écrivez votre message..."
        className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none focus:border-blue-500"
      />
      <button
        type="submit"
        className="p-2 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
      >
        <Send className="w-5 h-5" />
      </button>
    </form>
  );
}