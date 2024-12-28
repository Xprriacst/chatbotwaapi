import { OpenAIService } from '../ai/openai.service';
import { WaAPIService } from '../waapi.service';
import { Message } from '../../types/message.types';
import { MessageRepository } from './message.repository';
import { WAAPI_CONFIG } from '../../config/constants';
import { ENV } from '../../config/env.config';
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

      // Skip AI response if OpenAI is not configured
      if (!ENV.OPENAI?.API_KEY) {
        console.log('OpenAI not configured, skipping auto-reply');
        return;
      }

      // Generate AI response
      const aiResponse = await OpenAIService.generateResponse(message.text);

      // Send the response
      const response = await WaAPIService.sendMessage({
        to: message.sender,
        message: aiResponse
      });

      // Save the AI response to the database
      const responseMessage: Message = {
        id: response.data.message.id._serialized,
        text: aiResponse,
        isBot: true,
        timestamp: Date.now(),
        status: 'sent',
        sender: WAAPI_CONFIG.PHONE_NUMBER.replace('+', ''),
        recipient: message.sender
      };

      await MessageRepository.saveMessage(responseMessage, userId);
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
