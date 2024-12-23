export interface WAMessage {
  id: {
    fromMe: boolean;
    remote: string;
    id: string;
    _serialized: string;
  };
  ack: number;
  hasMedia: boolean;
  body: string;
  type: string;
  timestamp: number;
  from: string;
  to: string;
  deviceType: string;
  isForwarded: boolean;
  forwardingScore: number;
  isStatus: boolean;
  isStarred: boolean;
  fromMe: boolean;
  hasQuotedMsg: boolean;
  hasReaction: boolean;
  vCards: any[];
  mentionedIds: string[];
  groupMentions: any[];
  isGif: boolean;
  links: any[];
}

export interface WebhookEvent {
  event: 'message' | 'message_create' | 'message_ack';
  instanceId: string;
  data: {
    message: WAMessage;
    media: any;
  };
}
