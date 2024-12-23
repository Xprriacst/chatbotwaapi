import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { useMessagesStore } from '../store/messages.store';
import { Message } from '../types/message.types';

export class RealtimeService {
  private static channel: RealtimeChannel | null = null;

  static subscribe(userId: string): void {
    if (this.channel) {
      console.log('Already subscribed to realtime updates');
      return;
    }

    console.log('Subscribing to realtime updates');
    
    this.channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Received realtime update:', payload);
          const store = useMessagesStore.getState();
          
          switch (payload.eventType) {
            case 'INSERT': {
              const message: Message = {
                id: payload.new.wa_message_id,
                text: payload.new.text,
                isBot: payload.new.is_bot,
                timestamp: new Date(payload.new.timestamp).getTime(),
                status: payload.new.status
              };
              store.addMessage(message);
              break;
            }
            case 'UPDATE': {
              const updatedMessages = store.messages.map(msg =>
                msg.id === payload.new.wa_message_id
                  ? {
                      ...msg,
                      status: payload.new.status,
                      text: payload.new.text
                    }
                  : msg
              );
              store.setMessages(updatedMessages);
              break;
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
      });
  }

  static unsubscribe(): void {
    if (this.channel) {
      console.log('Unsubscribing from realtime updates');
      this.channel.unsubscribe();
      this.channel = null;
    }
  }
}