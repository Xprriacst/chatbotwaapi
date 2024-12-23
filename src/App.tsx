import React, { useState, useEffect } from 'react';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { PhoneInput } from './components/PhoneInput';
import { MessageSquare } from 'lucide-react';
import { WaAPIService } from './services/waapi.service';

interface Message {
  text: string;
  isBot: boolean;
}

const INITIAL_MESSAGE: Message = {
  text: "Bonjour ! Je suis votre assistant WhatsApp. Veuillez entrer le numéro de téléphone du destinataire.",
  isBot: true,
};

function App() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [recipientPhone, setRecipientPhone] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    checkInstanceStatus();
  }, []);

  const checkInstanceStatus = async () => {
    try {
      const status = await WaAPIService.getInstanceStatus();
      setIsConnected(status.status === 'connected');
    } catch (error) {
      console.error('Failed to check instance status:', error);
    }
  };

  const handlePhoneSubmit = (phone: string) => {
    setRecipientPhone(phone);
    setMessages(prev => [...prev, {
      text: `Connecté au numéro ${phone}. Vous pouvez maintenant envoyer des messages.`,
      isBot: true
    }]);
  };

  const handleSendMessage = async (text: string) => {
    // Add user message to chat
    setMessages(prev => [...prev, { text, isBot: false }]);

    try {
      // Send message via WhatsApp
      await WaAPIService.sendMessage({
        to: recipientPhone,
        message: text
      });

      // Add confirmation message
      setMessages(prev => [...prev, {
        text: "Message envoyé avec succès via WhatsApp",
        isBot: true
      }]);
    } catch (error) {
      console.error('Failed to send message:', error);
      setMessages(prev => [...prev, {
        text: "Erreur lors de l'envoi du message. Veuillez réessayer.",
        isBot: true
      }]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8 px-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-blue-500 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6" />
            <h1 className="text-xl font-semibold">Assistant WhatsApp</h1>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}>
            {isConnected ? 'Connecté' : 'Déconnecté'}
          </div>
        </div>

        {/* Chat messages */}
        <div className="h-[500px] overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <ChatMessage
              key={index}
              message={message.text}
              isBot={message.isBot}
            />
          ))}
        </div>

        {/* Input */}
        <div className="border-t p-4 bg-gray-50 space-y-4">
          {!recipientPhone ? (
            <PhoneInput onPhoneSubmit={handlePhoneSubmit} />
          ) : (
            <ChatInput onSendMessage={handleSendMessage} />
          )}
        </div>
      </div>
    </div>
  );
}

export default App;