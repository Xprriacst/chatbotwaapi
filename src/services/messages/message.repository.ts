import { supabase } from '../supabase';
import { Message } from '../../types/message.types';
import { WaAPIService } from '../waapi.service';
import { convertWAMessageToMessage } from '../../utils/message.utils';
import { WAAPI_CONFIG } from '../../config/constants';

export class MessageRepository {
  static async syncMessages(userId: string): Promise<void> {
    try {
      const response = await WaAPIService.fetchMessages();
      const messages = response.data.messages;

      for (const msg of messages) {
        const message = convertWAMessageToMessage(msg);
        await this.saveMessage(message, userId);
      }
    } catch (error) {
      console.error('Error syncing messages:', error);
      throw error;
    }
  }

  static async saveMessage(message: Message, userId: string): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .upsert({
        wa_message_id: message.id,
        text: message.text,
        is_bot: message.isBot,
        timestamp: new Date(message.timestamp),
        status: message.status,
        user_id: userId,
        sender: message.sender,
        recipient: message.recipient
      }, {
        onConflict: 'wa_message_id'
      });

    if (error) throw error;
  }

  static async getMessages(userId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('user_id', userId)
      .or(`sender.eq.${WAAPI_CONFIG.PHONE_NUMBER},recipient.eq.${WAAPI_CONFIG.PHONE_NUMBER}`)
      .order('timestamp', { ascending: true });

    if (error) throw error;

    return data.map(msg => ({
      id: msg.wa_message_id,
      text: msg.text,
      isBot: msg.is_bot,
      timestamp: new Date(msg.timestamp).getTime(),
      status: msg.status,
      sender: msg.sender,
      recipient: msg.recipient
    }));
  }

  static async sendMessage(text: string, recipientPhone: string, userId: string): Promise<Message> {
    const response = await WaAPIService.sendMessage({
      to: recipientPhone,
      message: text
    });

    const message: Message = {
      id: response.data.message.id._serialized,
      text,
      isBot: false,
      timestamp: Date.now(),
      status: 'sent',
      sender: WAAPI_CONFIG.PHONE_NUMBER,
      recipient: recipientPhone
    };

    await this.saveMessage(message, userId);
    return message;
  }
}