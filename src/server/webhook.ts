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
SUPABASE_ANON_KEY=votre_clé_supabase

import express from 'express';
import cors from 'cors';
import { WAAPI_CONFIG } from '../config/constants';
import { WebhookEvent } from '../types/waapi.types';
import { MessagesService } from '../services/messages/messages.service';
import { AutoReplyService } from '../services/messages/auto-reply.service';
import { convertWAMessageToMessage } from '../utils/message.utils';

const app = express();
app.use(cors());
app.use(express.json());

const router = express.Router();

router.post('/webhook', async (req: express.Request, res: express.Response) => {
  try {
    const payload = req.body as WebhookEvent;
    console.log('Received webhook event:', payload);

    // Validate webhook payload
    if (!payload.event || !payload.instanceId || !payload.data) {
      console.error('Invalid webhook payload - missing required fields');
      return res.status(400).json({ error: 'Invalid webhook payload structure' });
    }

    // Verify instance ID
    if (payload.instanceId !== WAAPI_CONFIG.INSTANCE_ID) {
      console.error('Invalid instance ID:', {
        received: payload.instanceId,
        expected: WAAPI_CONFIG.INSTANCE_ID
      });
      return res.status(401).json({ error: 'Invalid instance ID' });
    }

    // Handle different webhook events
    switch (payload.event) {
      case 'message':
      case 'message_create': {
        if (payload.data.message) {
          const message = convertWAMessageToMessage(payload.data.message);
          console.log('Converted message:', message);

          // Save message to database
          await MessagesService.saveMessage(message);

          // Handle auto-reply if needed
          await AutoReplyService.handleIncomingMessage(message, payload.instanceId);
        }
        break;
      }
      case 'message_ack': {
        if (payload.data.message?.id?._serialized) {
          await MessagesService.updateMessageStatus(
            payload.data.message.id._serialized,
            payload.data.message.ack
          );
        }
        break;
      }
    }

    // Always return success to WAAPI
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.use('/webhook', router);

const PORT = WAAPI_CONFIG.PORT;
app.listen(PORT, () => {
  console.log(`Webhook server running on port ${PORT}`);
});