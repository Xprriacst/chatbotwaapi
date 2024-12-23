import { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  // Handle WebSocket upgrade
  if (event.headers['upgrade'] !== 'websocket') {
    return {
      statusCode: 426,
      body: 'Upgrade Required',
      headers: {
        'Content-Type': 'text/plain'
      }
    };
  }

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Connection': 'Upgrade',
      'Upgrade': 'websocket',
      'Sec-WebSocket-Accept': event.headers['sec-websocket-key']
    },
    body: JSON.stringify({ message: 'Connected' })
  };
};