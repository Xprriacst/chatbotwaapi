/*
  # Messages and Conversations Schema

  1. New Tables
    - `conversations`
      - `id` (uuid, primary key)
      - `user_id` (references auth.users)
      - `participant_phone` (the other party's phone number)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      
    - `messages`
      - `id` (uuid, primary key)
      - `conversation_id` (references conversations)
      - `wa_message_id` (WhatsApp message ID)
      - `text` (message content)
      - `is_bot` (whether message is from bot)
      - `sender` (phone number of sender)
      - `recipient` (phone number of recipient)
      - `status` (message status)
      - `created_at` (timestamp)
      
  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  participant_phone text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, participant_phone)
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES conversations(id) NOT NULL,
  wa_message_id text UNIQUE,
  text text NOT NULL,
  is_bot boolean DEFAULT false,
  sender text NOT NULL,
  recipient text NOT NULL,
  status text CHECK (status IN ('sent', 'delivered', 'read')) DEFAULT 'sent',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Conversations policies
CREATE POLICY "Users can view their conversations"
  ON conversations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create conversations"
  ON conversations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Users can view messages in their conversations"
  ON messages
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in their conversations"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update message status"
  ON messages
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND conversations.user_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX conversations_user_id_idx ON conversations(user_id);
CREATE INDEX messages_conversation_id_idx ON messages(conversation_id);
CREATE INDEX messages_wa_message_id_idx ON messages(wa_message_id);