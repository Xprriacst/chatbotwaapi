import { WAMessage } from '../../types/waapi.types';
import { Message } from '../../types/message.types';
import { ENV } from '../../config/env.config';
import { MESSAGES_CONFIG } from './messages.config';
import { convertWAMessageToMessage } from '../../utils/message.utils';

export class MessagesService {
  private static headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ENV.WAAPI.ACCESS_TOKEN}`
  };

  static async fetchMessages(cursor?: string): Promise<Message[]> {
    try {
      const url = `${ENV.WAAPI.BASE_URL}/instances/${ENV.WAAPI.INSTANCE_ID}/client/action/fetch-messages`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          limit: MESSAGES_CONFIG.FETCH_LIMIT,
          cursor
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch messages: ${response.statusText}`);
      }

      const data = await response.json();
      const messages = data.data.messages as WAMessage[];
      
      return messages.map(convertWAMessageToMessage);
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  static async getMessageById(messageId: string): Promise<Message | null> {
    try {
      const url = `${ENV.WAAPI.BASE_URL}/instances/${ENV.WAAPI.INSTANCE_ID}/client/action/get-message-by-id`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ messageId })
      });

      if (!response.ok) {
        throw new Error(`Failed to get message: ${response.statusText}`);
      }

      const data = await response.json();
      const message = data.data.message as WAMessage;
      
      return convertWAMessageToMessage(message);
    } catch (error) {
      console.error('Error getting message:', error);
      return null;
    }
  }
}
