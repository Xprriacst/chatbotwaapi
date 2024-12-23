import React from 'react';
import { Bot, User, Check, CheckCheck } from 'lucide-react';
import { Message } from '../types/message.types';
import { WAAPI_CONFIG } from '../config/constants';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isFromBusiness = message.sender === WAAPI_CONFIG.PHONE_NUMBER.replace('+', '');

  const StatusIcon = () => {
    if (!message.status || isFromBusiness) return null;
    
    switch (message.status) {
      case 'delivered':
        return <Check className="w-4 h-4 text-gray-400" />;
      case 'read':
        return <CheckCheck className="w-4 h-4 text-blue-500" />;
      default:
        return <Check className="w-4 h-4 text-gray-300" />;
    }
  };

  return (
    <div className={`flex gap-3 ${isFromBusiness ? '' : 'flex-row-reverse'}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
        isFromBusiness ? 'bg-blue-500' : 'bg-green-500'
      }`}>
        {isFromBusiness ? 
          <Bot className="w-5 h-5 text-white" /> : 
          <User className="w-5 h-5 text-white" />
        }
      </div>
      <div className="flex flex-col gap-1">
        <div className={`max-w-[80%] px-4 py-2 rounded-2xl ${
          isFromBusiness ? 'bg-gray-100' : 'bg-blue-500 text-white'
        }`}>
          <p className="text-sm">{message.text}</p>
        </div>
        {!isFromBusiness && message.status && (
          <div className="flex justify-end">
            <StatusIcon />
          </div>
        )}
      </div>
    </div>
  );
}