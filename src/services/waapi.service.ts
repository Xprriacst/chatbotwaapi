import { ENV } from '../config/env.config';

interface SendMessageParams {
  to: string;
  message: string;
}

export class WaAPIService {
  private static headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ENV.WAAPI.ACCESS_TOKEN}`
  };

  private static formatPhoneNumber(phone: string): string {
    // Supprimer tous les caractères non numériques sauf le + initial
    const cleaned = phone.startsWith('+') 
      ? phone.substring(1).replace(/\D/g, '')
      : phone.replace(/\D/g, '');
    return `${cleaned}@c.us`;
  }

  static async sendMessage({ to, message }: SendMessageParams) {
    try {
      const formattedPhone = this.formatPhoneNumber(to);
      
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

      const data = await response.json();
      
      if (!response.ok) {
        console.error('Failed to send message:', {
          status: response.status,
          error: data
        });
        throw new Error(data.message || 'Failed to send message');
      }

      console.log('Message sent successfully:', data);
      return data;
    } catch (error) {
      console.error('Error in sendMessage:', error);
      throw error;
    }
  }

  static async getInstanceStatus() {
    try {
      const url = `${ENV.WAAPI.BASE_URL}/instances/${ENV.WAAPI.INSTANCE_ID}`;
      const response = await fetch(url, {
        headers: this.headers
      });

      const data = await response.json();
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