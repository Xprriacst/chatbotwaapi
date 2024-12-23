import { Handler } from '@netlify/functions';
import { WebhookEvent, WAMessage } from '../../src/types/waapi.types';

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
      case 'message_create':
        await handleIncomingMessage(payload.data.message);
        break;
      case 'message_ack':
        await handleMessageStatus(payload.data.message);
        break;
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

async function handleIncomingMessage(message: WAMessage) {
  // Ignorer les messages envoyés par nous-mêmes
  if (message.fromMe) {
    return;
  }

  console.log('Processing incoming message:', {
    from: message.from,
    body: message.body,
    timestamp: new Date(message.timestamp * 1000).toISOString()
  });

  // Ici vous pouvez ajouter la logique pour répondre automatiquement aux messages
  // Par exemple, un message de bienvenue ou une réponse automatique
}

async function handleMessageStatus(message: WAMessage) {
  console.log('Message status update:', {
    id: message.id._serialized,
    ack: message.ack,
    timestamp: new Date(message.timestamp * 1000).toISOString()
  });
}

export { handler };
