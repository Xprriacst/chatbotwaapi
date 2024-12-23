import { OpenAIService } from '../ai/openai.service';
import { WaAPIService } from '../waapi.service';
import { Message } from '../../types/message.types';
import { MessageRepository } from './message.repository';
import { WAAPI_CONFIG } from '../../config/constants';
import { ENV } from '../../config/env.config';

export class AutoReplyService {
  static async handleIncomingMessage(message: Message, userId: string): Promise<void> {
    try {
      // Only process messages not from the business number
      if (message.sender === WAAPI_CONFIG.PHONE_NUMBER.replace('+', '')) {
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
}
