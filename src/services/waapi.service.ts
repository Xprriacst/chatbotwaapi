import { ENV } from '../config/env.config';
import { formatPhoneNumber } from '../utils/phone.utils';

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
        messageLength: message.length,
        headers: this.headers // Log headers for debugging
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('WAAPI error response:', data);
        throw new Error(data.message || 'Failed to send message');
      }

      console.log('WAAPI success response:', data);
      return data;
    } catch (error) {
      console.error('Error in sendMessage:', error);
      throw error;
    }
  }

  static async getInstanceStatus() {
    try {
      const url = `${ENV.WAAPI.BASE_URL}/instances/${ENV.WAAPI.INSTANCE_ID}`;
      console.log('Checking instance status:', { url, headers: this.headers });
      
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
}
