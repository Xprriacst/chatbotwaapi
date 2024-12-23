import { supabase } from '../supabase';
import { Message } from '../../types/message.types';

export class MessageDBService {
  static async saveMessage(message: Message, userId: string): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .insert({
        wa_message_id: message.id,
        text: message.text,
        is_bot: message.isBot,
        timestamp: new Date(message.timestamp),
        status: message.status,
        user_id: userId
      });

    if (error) {
      console.error('Error saving message:', error);
      throw error;
    }
  }

  static async updateMessageStatus(messageId: string, status: Message['status']): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .update({ status })
      .eq('wa_message_id', messageId);

    if (error) {
      console.error('Error updating message status:', error);
      throw error;
    }
  }

  static async getMessages(userId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }

    return data.map(msg => ({
      id: msg.wa_message_id,
      text: msg.text,
      isBot: msg.is_bot,
      timestamp: new Date(msg.timestamp).getTime(),
      status: msg.status
    }));
  }
}