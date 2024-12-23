import { Handler } from '@netlify/functions';
import { WebhookEvent } from '../../src/types/waapi.types';

const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed'
    };
  }

  try {
    const payload = JSON.parse(event.body || '{}') as WebhookEvent;
    
    // Broadcast to all connected clients via Netlify's built-in WebSocket support
    await fetch('/.netlify/functions/internal/broadcast', {
      method: 'POST',
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
