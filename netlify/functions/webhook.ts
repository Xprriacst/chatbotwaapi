import { Handler } from '@netlify/functions';
import { WebhookEvent } from '../../src/types/waapi.types';
import { convertWAMessageToMessage } from './utils';

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed'
    };
  }

  try {
    const payload = JSON.parse(event.body || '{}') as WebhookEvent;
    console.log('Received webhook event:', JSON.stringify(payload, null, 2));

    switch (payload.event) {
      case 'message':
      case 'message_create': {
        const message = convertWAMessageToMessage(payload.data.message);
        console.log('Processing incoming message:', {
          from: message.isBot ? 'bot' : 'user',
          text: message.text,
          timestamp: new Date(message.timestamp * 1000).toISOString()
        });
        break;
      }
      case 'message_ack': {
        const message = convertWAMessageToMessage(payload.data.message);
        console.log('Message status update:', {
          id: message.id,
          status: message.status,
          timestamp: new Date(message.timestamp * 1000).toISOString()
        });
        break;
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ status: 'success' })
    };
  } catch (error) {
    console.error('Error processing webhook:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

export { handler };
