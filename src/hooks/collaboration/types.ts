
export interface CollaborativeUser {
  id: string;
  name: string;
  avatar?: string;
  cursor?: { x: number; y: number };
  isActive: boolean;
  lastSeen: string;
}

export interface SharedState {
  [key: string]: any;
}

export interface RealtimeMessage {
  id: string;
  user_id: string;
  message: string;
  timestamp: string;
  message_type: 'text' | 'cursor' | 'state_update';
  metadata?: any;
}

export type ConflictResolutionStrategy = 'last_write_wins' | 'merge' | 'manual';

export interface PresenceData {
  user_id?: string;
  name?: string;
  avatar?: string;
  cursor?: { x: number; y: number };
  online_at?: string;
  [key: string]: any;
}
