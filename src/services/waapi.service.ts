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

  static async sendMessage({ to, message }: SendMessageParams) {
    try {
      const response = await fetch(`${ENV.WAAPI.BASE_URL}/instances/${ENV.WAAPI.INSTANCE_ID}/client/action/send-message`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          to,
          type: 'text',
          message
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  static async getInstanceStatus() {
    try {
      const response = await fetch(`${ENV.WAAPI.BASE_URL}/instances/${ENV.WAAPI.INSTANCE_ID}`, {
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error('Failed to get instance status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting instance status:', error);
      throw error;
    }
  }
}