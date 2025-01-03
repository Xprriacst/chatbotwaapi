import { WAAPI_CONFIG } from '../../config/constants';
import { WAMessage } from '../../types/waapi.types';

interface FetchMessagesParams {
  limit?: number;
  cursor?: string;
}

export class WaAPIMessagesService {
  private static headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${WAAPI_CONFIG.ACCESS_TOKEN}`
  };

  static async fetchMessages({ limit = 50, cursor }: FetchMessagesParams = {}) {
    try {
      const url = `${WAAPI_CONFIG.BASE_URL}/instances/${WAAPI_CONFIG.INSTANCE_ID}/client/action/fetch-messages`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ limit, cursor })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      return data.data.messages as WAMessage[];
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  static async getMessageById(messageId: string) {
    try {
      const url = `${WAAPI_CONFIG.BASE_URL}/instances/${WAAPI_CONFIG.INSTANCE_ID}/client/action/get-message-by-id`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ messageId })
      });

      if (!response.ok) {
        throw new Error('Failed to get message');
      }

      const data = await response.json();
      return data.data.message as WAMessage;
    } catch (error) {
      console.error('Error getting message:', error);
      throw error;
    }
  }
}