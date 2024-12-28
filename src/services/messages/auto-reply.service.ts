import { Message } from '../../types/message.types';
import { MessageRepository } from './message.repository';
import { WAAPI_CONFIG } from '../../config/constants';
import { formatPhoneNumber } from '../../utils/phone.utils';

export class AutoReplyService {
  private static headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${WAAPI_CONFIG.ACCESS_TOKEN}`
  };

  static async handleIncomingMessage(message: Message, userId: string): Promise<void> {
    try {
      // Only process messages not from the business number
      const formattedPhone = formatPhoneNumber(message.sender);
      if (formattedPhone === WAAPI_CONFIG.PHONE_NUMBER.replace('+', '')) {
        return;
      }

      // Save message to repository
      await MessageRepository.saveMessage({
        id: message.id,
        text: message.text,
        sender: message.sender,
        timestamp: message.timestamp,
        userId: userId
      });

      // Send auto-reply
      const response = await fetch(
        `${WAAPI_CONFIG.BASE_URL}/instances/${WAAPI_CONFIG.INSTANCE_ID}/client/action/send-message`,
        {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify({
            chatId: message.sender,
            text: 'Merci pour votre message. Je vous répondrai dès que possible.'
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to send auto-reply');
      }

    } catch (error) {
      console.error('Error handling auto-reply:', error);
    }
  }

  static async sendAutoReply(message: Message) {
    try {
      const formattedPhone = formatPhoneNumber(message.from);
      if (!formattedPhone) {
        throw new Error('Invalid phone number');
      }

      const autoReplyText = 'Merci pour votre message. Je vous répondrai dès que possible.';
      
      const response = await fetch(
        `${WAAPI_CONFIG.BASE_URL}/instances/${WAAPI_CONFIG.INSTANCE_ID}/client/action/send-message`,
        {
          method: 'POST',
          headers: this.headers,
          body: JSON.stringify({
            chatId: formattedPhone,
            text: autoReplyText
          })
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to send auto-reply');
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending auto-reply:', error);
      throw error;
    }
  }
}
