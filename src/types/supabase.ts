export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      conversations: {
        Row: {
          id: string
          user_id: string
          participant_phone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          participant_phone: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          participant_phone?: string
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          wa_message_id: string
          text: string
          is_bot: boolean
          sender: string
          recipient: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          wa_message_id: string
          text: string
          is_bot?: boolean
          sender: string
          recipient: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          wa_message_id?: string
          text?: string
          is_bot?: boolean
          sender?: string
          recipient?: string
          status?: string
          created_at?: string
        }
      }
    }
  }
}