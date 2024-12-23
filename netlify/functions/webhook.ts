import { Handler } from '@netlify/functions';
import { WebhookEvent } from '../../src/types/waapi.types';
import { convertWAMessageToMessage } from './utils';

export const handler: Handler = async (event) => {
  console.log('Webhook received request:', {
    method: event.httpMethod,
    headers: event.headers,
    path: event.path
  });

  if (event.httpMethod !== 'POST') {
    console.log('Invalid method:', event.httpMethod);
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    console.log('Raw webhook payload:', event.body);
    const payload = JSON.parse(event.body || '{}') as WebhookEvent;
    
    console.log('Parsed webhook event:', {
      type: payload.event,
      instanceId: payload.instanceId,
      messageId: payload.data?.message?.id?._serialized,
      messageBody: payload.data?.message?.body
    });

    // Validate required fields
    if (!payload.event || !payload.instanceId || !payload.data) {
      console.error('Invalid webhook payload - missing required fields');
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid webhook payload structure' })
      };
    }

    // Forward to WebSocket
    const host = event.headers.host || 'localhost:8888';
    const protocol = host.includes('localhost') ? 'http:' : 'https:';
    const websocketUrl = `${protocol}//${host}/.netlify/functions/websocket`;

    console.log('Forwarding to WebSocket:', websocketUrl);
    
    await fetch(websocketUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ 
        status: 'success',
        event: payload.event
      })
    };
  } catch (error) {
    console.error('Error processing webhook:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};