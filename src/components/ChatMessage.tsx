import React from 'react';
import { Bot, User } from 'lucide-react';

interface ChatMessageProps {
  message: string;
  isBot: boolean;
}

export function ChatMessage({ message, isBot }: ChatMessageProps) {
  return (
    <div className={`flex gap-3 ${isBot ? '' : 'flex-row-reverse'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
        isBot ? 'bg-blue-500' : 'bg-green-500'
      }`}>
        {isBot ? <Bot className="w-5 h-5 text-white" /> : <User className="w-5 h-5 text-white" />}
      </div>
      <div className={`max-w-[80%] px-4 py-2 rounded-2xl ${
        isBot ? 'bg-gray-100' : 'bg-blue-500 text-white'
      }`}>
        <p className="text-sm">{message}</p>
      </div>
    </div>
  );
}