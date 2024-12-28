VITE_WAAPI_ACCESS_TOKEN=votre_token
VITE_WAAPI_INSTANCE_ID=32696
VITE_WAAPI_PHONE_NUMBER=votre_numéro
VITE_WAAPI_BASE_URL=https://waapi.app/api/v1
VITE_SUPABASE_URL=votre_url_supabase
VITE_SUPABASE_ANON_KEY=votre_clé_supabase

WAAPI_ACCESS_TOKEN=votre_token
WAAPI_INSTANCE_ID=32696
WAAPI_PHONE_NUMBER=votre_numéro
WAAPI_BASE_URL=https://waapi.app/api/v1
SUPABASE_URL=votre_url_supabase
SUPABASE_ANON_KEY=votre_clé_supabaseimport express from 'express';
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