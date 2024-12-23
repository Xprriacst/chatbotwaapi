import React, { useState, useEffect } from 'react';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { PhoneInput } from './components/PhoneInput';
import { AuthForm } from './components/AuthForm';
import { MessageSquare } from 'lucide-react';
import { WaAPIService } from './services/waapi.service';
import { useMessagesStore } from './store/messages.store';
import { useAuth } from './hooks/useAuth';
import { ENV } from './config/env.config';

export function App() {
  const [recipientPhone, setRecipientPhone] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { messages, addMessage } = useMessagesStore();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user) {
      checkInstanceStatus();
    }
  }, [user]);

  const checkInstanceStatus = async () => {
    try {
      const status = await WaAPIService.getInstanceStatus();
      setIsConnected(status.status === 'connected');
    } catch (error) {
      console.error('Failed to check instance status:', error);
      setError('Failed to connect to WhatsApp. Please try again.');
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!recipientPhone || !text.trim() || !user) return;
    setError(null);

    try {
      const message = {
        id: `local-${Date.now()}`,
        text,
        isBot: false,
        timestamp: Date.now(),
        status: 'sent' as const,
        sender: ENV.WAAPI.PHONE_NUMBER.replace('+', ''),
        recipient: recipientPhone
      };
      
      console.log('Sending message:', message);
      addMessage(message);

      const response = await WaAPIService.sendMessage({
        to: recipientPhone,
        message: text
      });

      console.log('Message sent successfully:', response);
    } catch (error) {
      console.error('Failed to send message:', error);
      setError('Failed to send message. Please try again.');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4">
        <AuthForm />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-blue-500 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6" />
            <h1 className="text-xl font-semibold">Assistant WhatsApp</h1>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}>
            {isConnected ? 'Connecté' : 'Déconnecté'}
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4">
            {error}
          </div>
        )}

        <div className="h-[500px] overflow-y-auto p-4 space-y-4">
          {messages?.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </div>

        <div className="border-t p-4 bg-gray-50 space-y-4">
          {!recipientPhone ? (
            <PhoneInput onPhoneSubmit={setRecipientPhone} />
          ) : (
            <ChatInput onSendMessage={handleSendMessage} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
