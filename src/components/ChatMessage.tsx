import React from 'react';
import { Bot, User, Check, CheckCheck } from 'lucide-react';

interface ChatMessageProps {
  message: string;
  isBot: boolean;
  status?: 'sent' | 'delivered' | 'read';
}

export function ChatMessage({ message, isBot, status }: ChatMessageProps) {
  const StatusIcon = () => {
    if (!status || isBot) return null;
    
    switch (status) {
      case 'delivered':
        return <Check className="w-4 h-4 text-gray-400" />;
      case 'read':
        return <CheckCheck className="w-4 h-4 text-blue-500" />;
      default:
        return <Check className="w-4 h-4 text-gray-300" />;
    }
  };

  return (
    <div className={`flex gap-3 ${isBot ? '' : 'flex-row-reverse'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
        isBot ? 'bg-blue-500' : 'bg-green-500'
      }`}>
        {isBot ? <Bot className="w-5 h-5 text-white" /> : <User className="w-5 h-5 text-white" />}
      </div>
      <div className="flex flex-col gap-1">
        <div className={`max-w-[80%] px-4 py-2 rounded-2xl ${
          isBot ? 'bg-gray-100' : 'bg-blue-500 text-white'
        }`}>
          <p className="text-sm">{message}</p>
        </div>
        {!isBot && status && (
          <div className="flex justify-end">
            <StatusIcon />
          </div>
        )}
      </div>
    </div>
  );
}