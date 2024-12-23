/*
  # Messages Schema Setup

  1. New Tables
    - `messages`
      - `id` (uuid, primary key)
      - `wa_message_id` (text, unique) - WhatsApp message ID
      - `text` (text) - Message content
      - `is_bot` (boolean) - Whether message is from bot
      - `timestamp` (timestamptz) - Message timestamp
      - `status` (text) - Message status (sent/delivered/read)
      - `user_id` (uuid) - Reference to auth.users
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on messages table
    - Add policies for authenticated users to:
      - Read their own messages
      - Create new messages
      - Update message status
*/

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wa_message_id text UNIQUE NOT NULL,
  text text NOT NULL,
  is_bot boolean NOT NULL DEFAULT false,
  timestamp timestamptz NOT NULL DEFAULT now(),
  status text CHECK (status IN ('sent', 'delivered', 'read')) DEFAULT 'sent',
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can read their own messages"
  ON messages
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create messages"
  ON messages
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Separate policy for status updates
CREATE POLICY "Users can update message status"
  ON messages
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id AND (
    status IN ('sent', 'delivered', 'read')
  ));

-- Indexes
CREATE INDEX messages_user_id_idx ON messages(user_id);
CREATE INDEX messages_timestamp_idx ON messages(timestamp DESC);