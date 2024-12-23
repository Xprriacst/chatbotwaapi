import { ENV } from './env.config';

export const WAAPI_CONFIG = {
  ...ENV.WAAPI,
  ENDPOINTS: {
    SEND_MESSAGE: '/client/action/send-message',
    FETCH_MESSAGES: '/client/action/fetch-messages',
    GET_MESSAGE: '/client/action/get-message-by-id'
  },
  HEADERS: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${ENV.WAAPI.ACCESS_TOKEN}`
  }
} as const;