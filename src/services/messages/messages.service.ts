import { WAMessage } from '../../types/waapi.types';
import { Message } from '../../types/message.types';
import { WAAPI_CONFIG } from '../../config/constants';
import { convertWAMessageToMessage } from '../../utils/message.utils';

export class MessagesService {
  private static headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${WAAPI_CONFIG.ACCESS_TOKEN}`
  };

  static async fetchMessages(cursor?: string): Promise<Message[]> {
    let retries = 0;
    
    while (retries < WAAPI_CONFIG.MAX_RETRIES) {
      try {
        const url = `${WAAPI_CONFIG.BASE_URL}/instances/${WAAPI_CONFIG.INSTANCE_ID}/client/action/fetch-messages`;
        
        const response = await fetch(url, {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify({
            limit: WAAPI_CONFIG.FETCH_LIMIT,
            cursor
          })
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch messages: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Fetched messages:', data);
        
        const messages = data.data.messages as WAMessage[];
        return messages.map(convertWAMessageToMessage).sort((a, b) => b.timestamp - a.timestamp);
        
      } catch (error) {
        console.error(`Attempt ${retries + 1}/${WAAPI_CONFIG.MAX_RETRIES} failed:`, error);
        retries++;
        
        if (retries < WAAPI_CONFIG.MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, WAAPI_CONFIG.RETRY_DELAY));
        } else {
          throw error;
        }
      }
    }
    
    throw new Error('Max retries reached while fetching messages');
  }

  static async getMessageById(messageId: string): Promise<Message | null> {
    let retries = 0;
    
    while (retries < WAAPI_CONFIG.MAX_RETRIES) {
      try {
        const url = `${WAAPI_CONFIG.BASE_URL}/instances/${WAAPI_CONFIG.INSTANCE_ID}/client/action/get-message-by-id`;
        
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
        console.error(`Attempt ${retries + 1}/${WAAPI_CONFIG.MAX_RETRIES} failed:`, error);
        retries++;
        
        if (retries < WAAPI_CONFIG.MAX_RETRIES) {
          await new Promise(resolve => setTimeout(resolve, WAAPI_CONFIG.RETRY_DELAY));
        } else {
          return null;
        }
      }
    }
    
    return null;
  }
}