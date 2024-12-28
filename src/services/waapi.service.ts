import { ENV } from '../config/env.config';
import { formatPhoneNumber } from '../utils/phone.utils';
import { Message } from '../types/message.types';

interface SendMessageParams {
  to: string;
  message: string;
}

export class WaAPIService {
  private static headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ENV.WAAPI.ACCESS_TOKEN}`
  };

  static async sendMessage({ to, message }: SendMessageParams) {
    try {
      const formattedPhone = formatPhoneNumber(to);
      
      const payload = {
        chatId: formattedPhone,
        message,
        previewLink: true
      };

      const url = `${ENV.WAAPI.BASE_URL}/instances/${ENV.WAAPI.INSTANCE_ID}/client/action/send-message`;
      
      console.log('Sending message:', {
        url,
        chatId: formattedPhone,
        messageLength: message.length
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const data = await response.json();
        console.error('WAAPI error response:', data);
        throw new Error(data.message || 'Failed to send message');
      }

      const data = await response.json();
      console.log('WAAPI success response:', data);

      // Create a Message object from the response
      const sentMessage: Message = {
        id: data.id || `${Date.now()}_${Math.random()}`,
        text: message,
        timestamp: Date.now(),
        status: 'sent',
        isBot: false,
        from: ENV.WAAPI.PHONE_NUMBER,
        to: formattedPhone
      };

      return sentMessage;
    } catch (error) {
      console.error('Error in sendMessage:', error);
      throw error;
    }
  }

  static async getInstanceStatus() {
    try {
      const url = `${ENV.WAAPI.BASE_URL}/instances/${ENV.WAAPI.INSTANCE_ID}`;
      console.log('Checking instance status:', { url });
      
      const response = await fetch(url, {
        headers: this.headers
      });

      const data = await response.json();
      console.log('Instance status response:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get instance status');
      }

      return data;
    } catch (error) {
      console.error('Error in getInstanceStatus:', error);
      throw error;
    }
  }

  static async fetchMessages() {
    try {
      const url = `${ENV.WAAPI.BASE_URL}/instances/${ENV.WAAPI.INSTANCE_ID}/client/action/fetch-messages`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({ limit: 50 })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch messages');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }
}