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
    // Supprimer tous les caractères non numériques
    const cleaned = phone.replace(/\D/g, '');
    // Ajouter le suffixe @c.us requis par l'API WAAPI
    return `${cleaned}@c.us`;
  }

  static async sendMessage({ to, message }: SendMessageParams) {
    try {
      const formattedPhone = this.formatPhoneNumber(to);
      console.log('Sending message to formatted number:', formattedPhone);
      
      const payload = {
        to: formattedPhone,
        type: 'text',
        message
      };
      console.log('Request payload:', payload);

      const url = `${ENV.WAAPI.BASE_URL}/instances/${ENV.WAAPI.INSTANCE_ID}/client/action/send-message`;
      console.log('Request URL:', url);

      const response = await fetch(url, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          data
        });
        throw new Error(`Failed to send message: ${data.message || 'Unknown error'}`);
      }

      console.log('Message sent successfully:', data);
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  static async getInstanceStatus() {
    try {
      const url = `${ENV.WAAPI.BASE_URL}/instances/${ENV.WAAPI.INSTANCE_ID}`;
      console.log('Checking instance status:', url);

      const response = await fetch(url, {
        headers: this.headers
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('API Error:', data);
        throw new Error(`Failed to get instance status: ${data.message || 'Unknown error'}`);
      }

      console.log('Instance status:', data);
      return data;
    } catch (error) {
      console.error('Error getting instance status:', error);
      throw error;
    }
  }
}
