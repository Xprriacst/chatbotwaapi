import { WAMessage } from '../types/waapi.types';
import { Message } from '../types/message.types';
import { ENV } from '../config/env.config';

export function convertWAMessageToMessage(waMessage: WAMessage): Message {
  return {
    id: waMessage.id._serialized,
    text: waMessage.body,
    isBot: waMessage.from !== ENV.WAAPI.PHONE_NUMBER,
    timestamp: waMessage.timestamp,
    status: convertAckToStatus(waMessage.ack)
  };
}

export function convertAckToStatus(ack: number): Message['status'] {
  switch (ack) {
    case 2:
      return 'delivered';
    case 3:
      return 'read';
    default:
      return 'sent';
  }
}