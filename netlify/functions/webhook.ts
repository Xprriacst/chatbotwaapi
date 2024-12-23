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

    // Transmettre l'événement au WebSocket en utilisant l'URL complète
    const host = event.headers.host || 'localhost:8888';
    const protocol = host.includes('localhost') ? 'http:' : 'https:';
    const websocketUrl = `${protocol}//${host}/.netlify/functions/websocket`;

    await fetch(websocketUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

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
