import { supabase } from '../supabase';
import { Message } from '../../types/message.types';
import { WaAPIService } from '../waapi.service';
import { convertWAMessageToMessage } from '../../utils/message.utils';
import { WAAPI_CONFIG } from '../../config/constants';
import { AutoReplyService } from './auto-reply.service';

export class MessageRepository {
  static async getOrCreateConversation(userId: string, participantPhone: string): Promise<string> {
    // First try to get existing conversation
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('user_id', userId)
      .eq('participant_phone', participantPhone)
      .single();

    if (existing) {
      return existing.id;
    }

    // Create new conversation if none exists
    const { data: newConversation, error } = await supabase
      .from('conversations')
      .insert({
        user_id: userId,
        participant_phone: participantPhone
      })
      .select('id')
      .single();

    if (error) throw error;
    return newConversation.id;
  }

  static async saveMessage(message: Message, userId: string): Promise<void> {
    try {
      // Get or create conversation
      const conversationId = await this.getOrCreateConversation(
        userId,
        message.isBot ? message.recipient : message.sender
      );

      // Save message
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          wa_message_id: message.id,
          text: message.text,
          is_bot: message.isBot,
          sender: message.sender,
          recipient: message.recipient,
          status: message.status
        });

      if (error) throw error;

      // Update conversation timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

    } catch (error) {
      console.error('Error saving message:', error);
      throw error;
    }
  }

  static async getMessages(userId: string): Promise<Message[]> {
    const { data: conversations, error: convError } = await supabase
      .from('conversations')
      .select('id')
      .eq('user_id', userId);

    if (convError) throw convError;

    const conversationIds = conversations.map(c => c.id);
    
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select('*')
      .in('conversation_id', conversationIds)
      .order('created_at', { ascending: false });

    if (msgError) throw msgError;

    return messages.map(msg => ({
      id: msg.wa_message_id,
      text: msg.text,
      isBot: msg.is_bot,
      timestamp: new Date(msg.created_at).getTime(),
      status: msg.status,
      sender: msg.sender,
      recipient: msg.recipient
    }));
  }

  static async updateMessageStatus(messageId: string, status: Message['status']): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .update({ status })
      .eq('wa_message_id', messageId);

    if (error) throw error;
  }

  static async handleIncomingMessage(message: Message, userId: string): Promise<void> {
    await this.saveMessage(message, userId);
    
    if (!message.isBot) {
      await AutoReplyService.handleIncomingMessage(message, userId);
    }
  }

  static async syncMessages(userId: string): Promise<void> {
    try {
      const response = await WaAPIService.fetchMessages();
      const messages = response.data.messages;

      for (const msg of messages) {
        const message = convertWAMessageToMessage(msg);
        await this.handleIncomingMessage(message, userId);
      }
    } catch (error) {
      console.error('Error syncing messages:', error);
      throw error;
    }
  }
}