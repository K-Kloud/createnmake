export interface Conversation {
  id: string;
  title?: string;
  conversation_type: 'direct' | 'order' | 'quote';
  created_at: string;
  updated_at: string;
  last_message_at?: string;
  is_archived: boolean;
  metadata: Record<string, any>;
  order_id?: number;
  quote_request_id?: number;
  participants: string[];
  created_by: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'file' | 'system' | 'quote_update';
  created_at: string;
  edited_at?: string;
  is_deleted: boolean;
  metadata: Record<string, any>;
  system_data?: Record<string, any>;
  reply_to_id?: string;
  // Joined data
  sender?: {
    id: string;
    display_name?: string;
    avatar_url?: string;
  };
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  id: string;
  message_id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size?: number;
  created_at: string;
}

export interface ConversationParticipant {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'participant' | 'admin' | 'observer';
  joined_at: string;
  last_read_at?: string;
  is_muted: boolean;
}

export interface ConversationWithParticipants extends Conversation {
  participants_data: ConversationParticipant[];
  latest_message?: Message;
  unread_count: number;
}