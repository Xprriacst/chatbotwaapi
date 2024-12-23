import { supabase } from '../supabase';
import { Message } from '../../types/message.types';
import { WaAPIService } from '../waapi.service';
import { convertWAMessageToMessage } from '../../utils/message.utils';
import { WAAPI_CONFIG } from '../../config/constants';
import { AutoReplyService } from './auto-reply.service';

export class MessageRepository {
  // ... existing methods ...

  static async handleIncomingMessage(message: Message, userId: string): Promise<void> {
    await this.saveMessage(message, userId);
    await AutoReplyService.handleIncomingMessage(message, userId);
  }

  static async syncMessages(userId: string): Promise<void> {
    try {
      const response = await WaAPIService.fetchMessages();
      const messages = response.data.messages;

      for (const msg of messages) {
        const message = convertWAMessageToMessage(msg);
        if (message.sender !== WAAPI_CONFIG.PHONE_NUMBER.replace('+', '')) {
          await this.handleIncomingMessage(message, userId);
        } else {
          await this.saveMessage(message, userId);
        }
      }
    } catch (error) {
      console.error('Error syncing messages:', error);
      throw error;
    }
  }
}