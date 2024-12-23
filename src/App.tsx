import React, { useState, useEffect } from 'react';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { PhoneInput } from './components/PhoneInput';
import { MessageSquare } from 'lucide-react';
import { WaAPIService } from './services/waapi.service';
import { WebSocketService } from './services/websocket.service';
import { useMessages } from './hooks/useMessages';

function App() {
  const [recipientPhone, setRecipientPhone] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const { messages } = useMessages();

  useEffect(() => {
    checkInstanceStatus();
    WebSocketService.connect();

    // Debug log pour vérifier les messages
    console.log('Current messages in App:', messages);
  }, [messages]); // Ajout de messages comme dépendance pour voir les mises à jour

  const checkInstanceStatus = async () => {
    try {
      const status = await WaAPIService.getInstanceStatus();
      setIsConnected(status.status === 'connected');
    } catch (error) {
      console.error('Failed to check instance status:', error);
    }
  };

  // Debug render pour voir le contenu brut des messages
  console.log('Rendering messages:', messages);

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

        {/* Debug: Affichage brut des messages */}
        <div className="p-2 bg-gray-100">
          <p>Nombre de messages: {messages.length}</p>
          <pre className="text-xs overflow-auto">
            {JSON.stringify(messages, null, 2)}
          </pre>
        </div>

        {/* Chat messages */}
        <div className="h-[500px] overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message.text}
              isBot={message.isBot}
              status={message.status}
            />
          ))}
        </div>

        {/* Input */}
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
