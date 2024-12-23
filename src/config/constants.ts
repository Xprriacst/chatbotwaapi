import { ENV } from './env.config';

export const MESSAGE_TYPES = {
  INCOMING: 'incoming',
  OUTGOING: 'outgoing'
} as const;

export const WAAPI_CONFIG = {
  ...ENV.WAAPI,
  ENDPOINTS: {
    SEND_MESSAGE: '/client/action/send-message',
    FETCH_MESSAGES: '/client/action/fetch-messages',
    GET_MESSAGE: '/client/action/get-message-by-id'
  }
} as const;