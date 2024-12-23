import { WAMessage } from '../types/waapi.types';
import { Message } from '../types/message.types';
import { WAAPI_CONFIG } from '../config/constants';
import { isBusinessNumber } from './phone.utils';

export function convertWAMessageToMessage(waMessage: WAMessage): Message {
  // Check if the message is from the business number
  const isFromBusiness = isBusinessNumber(
    waMessage.from.split('@')[0], 
    WAAPI_CONFIG.PHONE_NUMBER
  );

  return {
    id: waMessage.id._serialized,
    text: waMessage.body,
    isBot: isFromBusiness,
    timestamp: waMessage.timestamp * 1000, // Convert to milliseconds
    status: convertAckToStatus(waMessage.ack),
    sender: waMessage.from.split('@')[0],
    recipient: waMessage.to.split('@')[0]
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