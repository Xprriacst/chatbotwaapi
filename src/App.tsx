import React, { useState, useEffect } from 'react';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { PhoneInput } from './components/PhoneInput';
import { MessageSquare } from 'lucide-react';
import { WaAPIService } from './services/waapi.service';
import { WebSocketService } from './services/websocket.service';
import { useMessagesStore } from './store/messages.store';

function App() {
  const [recipientPhone, setRecipientPhone] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const { messages, addMessage } = useMessagesStore();

  useEffect(() => {
    checkInstanceStatus();
    WebSocketService.connect();

    return () => {
      WebSocketService.disconnect();
    };
  }, []);

  const checkInstanceStatus = async () => {
    try {
      const status = await WaAPIService.getInstanceStatus();
      setIsConnected(status.status === 'connected');
    } catch (error) {
      console.error('Failed to check instance status:', error);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!recipientPhone || !text.trim()) return;

    try {
      const message = {
        id: `local-${Date.now()}`,
        text,
        isBot: false,
        timestamp: Date.now(),
        status: 'sent' as const
      };
      addMessage(message);

      await WaAPIService.sendMessage({
        to: recipientPhone,
        message: text
      });
    } catch (error) {
      console.error('Failed to send message:', error);
      addMessage({
        id: `error-${Date.now()}`,
        text: "Erreur lors de l'envoi du message. Veuillez réessayer.",
        isBot: true,
        timestamp: Date.now(),
        status: 'sent'
      });
    }
  };

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

        <div className="h-[500px] overflow-y-auto p-4 space-y-4">
          {messages?.map((message) => (
            <ChatMessage
              key={message.id}
              message={message.text}
              isBot={message.isBot}
              status={message.status}
            />
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