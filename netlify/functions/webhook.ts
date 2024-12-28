import { Handler } from '@netlify/functions';
import { WebhookEvent } from '../../src/types/waapi.types';
import { Message } from '../../src/types/message.types';
import { createSupabaseClient } from '../../src/services/supabase';
import { formatPhoneNumber } from '../../src/utils/phone.utils';

// Configuration validation
const REQUIRED_ENV_VARS = [
  'WAAPI_ACCESS_TOKEN',
  'WAAPI_INSTANCE_ID',
  'WAAPI_PHONE_NUMBER',
  'WAAPI_BASE_URL',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY'
] as const;

// Validate environment variables
for (const envVar of REQUIRED_ENV_VARS) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// WAAPI configuration
const WAAPI_CONFIG = {
  ACCESS_TOKEN: process.env.WAAPI_ACCESS_TOKEN,
  INSTANCE_ID: process.env.WAAPI_INSTANCE_ID,
  PHONE_NUMBER: process.env.WAAPI_PHONE_NUMBER,
  BASE_URL: process.env.WAAPI_BASE_URL
} as const;

// Initialize Supabase client
const supabase = createSupabaseClient();

export const handler: Handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const payload = JSON.parse(event.body || '{}') as WebhookEvent;
    console.log('Received webhook event:', payload);

    // Validate webhook payload
    if (!payload.event || !payload.instanceId || !payload.data) {
      console.error('Invalid webhook payload - missing required fields');
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid webhook payload structure' })
      };
    }

    // Verify instance ID
    if (payload.instanceId !== WAAPI_CONFIG.INSTANCE_ID) {
      console.error('Invalid instance ID:', {
        received: payload.instanceId,
        expected: WAAPI_CONFIG.INSTANCE_ID
      });
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid instance ID' })
      };
    }

    // Handle different webhook events
    switch (payload.event) {
      case 'message':
      case 'message_create': {
        if (payload.data.message) {
          const message: Message = {
            id: payload.data.message.id._serialized,
            text: payload.data.message.body,
            timestamp: new Date(payload.data.message.timestamp * 1000).getTime(),
            status: 'received',
            isBot: false,
            from: formatPhoneNumber(payload.data.message.from) || '',
            to: WAAPI_CONFIG.PHONE_NUMBER
          };

          console.log('Saving message to database:', message);

          const { error: dbError } = await supabase
            .from('messages')
            .insert(message);

          if (dbError) {
            console.error('Error saving message to database:', dbError);
            throw dbError;
          }
        }
        break;
      }
      case 'message_ack': {
        if (payload.data.message?.id?._serialized) {
          console.log('Updating message status:', {
            id: payload.data.message.id._serialized,
            status: payload.data.message.ack
          });

          const { error: dbError } = await supabase
            .from('messages')
            .update({ status: payload.data.message.ack })
            .eq('id', payload.data.message.id._serialized);

          if (dbError) {
            console.error('Error updating message status:', dbError);
            throw dbError;
          }
        }
        break;
      }
    }

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