import express from 'express';
import cors from 'cors';
import { ENV } from '../config/env.config';

const app = express();
app.use(cors());
app.use(express.json());

// Webhook endpoint
app.post('/webhook', (req, res) => {
  const event = req.body;
  console.log('Received webhook event:', event);

  // Handle different event types
  switch (event.type) {
    case 'message':
      handleMessage(event.data);
      break;
    case 'message_ack':
      handleMessageAck(event.data);
      break;
    // Add other event handlers as needed
  }

  res.status(200).send('OK');
});

function handleMessage(data: any) {
  // Handle incoming messages
  console.log('New message received:', data);
}

function handleMessageAck(data: any) {
  // Handle message acknowledgments
  console.log('Message acknowledgment:', data);
}

const PORT = ENV.WEBHOOK.PORT;
app.listen(PORT, () => {
  console.log(`Webhook server running on port ${PORT}`);
});