import { Handler } from '@netlify/functions';
import { WebhookEvent } from '../../src/types/waapi.types';
import { createClient } from '@supabase/supabase-js';
import { convertWAMessageToMessage } from '../../src/utils/message.utils';
import { ENV } from '../../src/config/env.config';

// Initialize Supabase client
const supabase = createClient(
  ENV.SUPABASE.URL,
  ENV.SUPABASE.ANON_KEY
);

export const handler: Handler = async (event) => {
  console.log('Webhook received request:', {
    method: event.httpMethod,
    path: event.path
  });

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const payload = JSON.parse(event.body || '{}') as WebhookEvent;
    
    console.log('Received webhook event:', {
      type: payload.event,
      instanceId: payload.instanceId,
      messageId: payload.data?.message?.id?._serialized,
    });

    // Validate webhook payload
    if (!payload.event || !payload.instanceId || !payload.data) {
      console.error('Invalid webhook payload - missing required fields');
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid webhook payload structure' })
      };
    }

    // Handle different webhook events
    switch (payload.event) {
      case 'message':
      case 'message_create': {
        if (payload.data.message) {
          const message = convertWAMessageToMessage(payload.data.message);
          
          // Save to Supabase
          const { error } = await supabase
            .from('messages')
            .insert({
              wa_message_id: message.id,
              text: message.text,
              is_bot: message.isBot,
              timestamp: new Date(message.timestamp),
              status: message.status,
              user_id: payload.instanceId // Using instanceId as userId
            });

          if (error) {
            console.error('Error saving message to Supabase:', error);
            return {
              statusCode: 500,
              body: JSON.stringify({ error: 'Failed to save message' })
            };
          }
        }
        break;
      }
      case 'message_ack': {
        if (payload.data.message?.id?._serialized) {
          const { error } = await supabase
            .from('messages')
            .update({ status: payload.data.message.ack })
            .eq('wa_message_id', payload.data.message.id._serialized);

          if (error) {
            console.error('Error updating message status:', error);
          }
        }
        break;
      }
    }

    // Always return success to WAAPI
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true })
    };

  } catch (error) {
    console.error('Error processing webhook:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};