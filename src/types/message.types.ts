export interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: number;
  status?: 'sent' | 'delivered' | 'read';
}

export interface WAMessageStatus {
  id: string;
  ack: number;
  timestamp: number;
}