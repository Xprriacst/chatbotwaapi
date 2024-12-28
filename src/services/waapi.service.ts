import { formatPhoneNumber } from '../utils/phone.utils';
import { Message } from '../types/message.types';
import axios from 'axios';

const WAAPI_CONFIG = {
  ACCESS_TOKEN: import.meta.env.VITE_WAAPI_ACCESS_TOKEN,
  INSTANCE_ID: import.meta.env.VITE_WAAPI_INSTANCE_ID,
  BASE_URL: import.meta.env.VITE_WAAPI_BASE_URL || 'https://waapi.app/api/v1',
  PHONE_NUMBER: import.meta.env.VITE_WAAPI_PHONE_NUMBER
};

const waapi = axios.create({
  baseURL: WAAPI_CONFIG.BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${WAAPI_CONFIG.ACCESS_TOKEN}`
  }
});

interface SendMessageParams {
  to: string;
  message: string;
}

export class WaAPIService {
  static async sendMessage({ to, message }: SendMessageParams) {
    try {
      const formattedPhone = formatPhoneNumber(to);
      
      console.log('Sending message:', {
        url: `${WAAPI_CONFIG.BASE_URL}/instances/${WAAPI_CONFIG.INSTANCE_ID}/client/action/send-message`,
        chatId: formattedPhone,
        messageLength: message.length
      });

      const response = await waapi.post(
        `/instances/${WAAPI_CONFIG.INSTANCE_ID}/client/action/send-message`,
        {
          chatId: formattedPhone,
          text: message,
          previewLink: true
        }
      );

      if (!response.ok) {
        console.error('WAAPI error response:', response.data);
        throw new Error(response.data.message || 'Failed to send message');
      }

      console.log('WAAPI success response:', response.data);

      // Create a Message object from the response
      const sentMessage: Message = {
        id: response.data.id || `${Date.now()}_${Math.random()}`,
        text: message,
        timestamp: Date.now(),
        status: 'sent',
        isBot: false,
        from: WAAPI_CONFIG.PHONE_NUMBER,
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
      console.log('Checking instance status:', {
        url: `${WAAPI_CONFIG.BASE_URL}/instances/${WAAPI_CONFIG.INSTANCE_ID}`
      });

      const response = await waapi.get(
        `/instances/${WAAPI_CONFIG.INSTANCE_ID}`
      );

      console.log('Instance status response:', response.data);
      
      if (!response.ok) {
        throw new Error(response.data.message || 'Failed to get instance status');
      }

      return response.data;
    } catch (error) {
      console.error('Error in getInstanceStatus:', error);
      throw error;
    }
  }

  static async fetchMessages() {
    try {
      const response = await waapi.post(
        `/instances/${WAAPI_CONFIG.INSTANCE_ID}/client/action/fetch-messages`,
        {
          limit: 50
        }
      );

      if (!response.ok) {
        console.error('WAAPI error response:', response.data);
        throw new Error(response.data.message || 'Failed to fetch messages');
      }

      console.log('WAAPI success response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }
}