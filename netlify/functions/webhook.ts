import { Handler } from '@netlify/functions';

const handler: Handler = async (event) => {
  // Vérifier la méthode HTTP
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: 'Method Not Allowed'
    };
  }

  try {
    const payload = JSON.parse(event.body || '{}');
    console.log('Received webhook event:', payload);

    // Gérer les différents types d'événements
    switch (payload.type) {
      case 'message':
        await handleMessage(payload.data);
        break;
      case 'message_ack':
        await handleMessageAck(payload.data);
        break;
      // Ajouter d'autres gestionnaires d'événements si nécessaire
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Webhook processed successfully' })
    };
  } catch (error) {
    console.error('Error processing webhook:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};

async function handleMessage(data: any) {
  // Gérer les messages entrants
  console.log('New message received:', data);
  // Ajoutez ici votre logique de traitement des messages
}

async function handleMessageAck(data: any) {
  // Gérer les accusés de réception des messages
  console.log('Message acknowledgment:', data);
  // Ajoutez ici votre logique de traitement des accusés de réception
}

export { handler };
