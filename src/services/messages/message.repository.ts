import { supabase } from '../supabase';
import { Message } from '../../types/message.types';
import { MessageDBService } from './db.service';
import { MessagesService } from './messages.service';

export class MessageRepository {
  static async syncMessages(userId: string): Promise<void> {
    try {
      // Fetch messages from WhatsApp
      const waMessages = await MessagesService.fetchMessages();
      
      // Save each message to Supabase
      for (const message of waMessages) {
        await MessageDBService.saveMessage(message, userId);
      }
    } catch (error) {
      console.error('Error syncing messages:', error);
      throw error;
    }
  }

  static async getMessages(userId: string): Promise<Message[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });

      if (error) throw error;

      return data.map(msg => ({
        id: msg.wa_message_id,
        text: msg.text,
        isBot: msg.is_bot,
        timestamp: new Date(msg.timestamp).getTime(),
        status: msg.status
      }));
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  static async updateMessageStatus(messageId: string, status: Message['status'], userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ status })
        .match({ wa_message_id: messageId, user_id: userId });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating message status:', error);
      throw error;
    }
  }
}