
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface CollaborativeUser {
  id: string;
  name: string;
  avatar?: string;
  cursor?: { x: number; y: number };
  isActive: boolean;
  lastSeen: string;
}

interface SharedState {
  [key: string]: any;
}

interface RealtimeMessage {
  id: string;
  user_id: string;
  message: string;
  timestamp: string;
  message_type: 'text' | 'cursor' | 'state_update';
  metadata?: any;
}

export const useRealtimeCollaboration = (roomId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeUsers, setActiveUsers] = useState<CollaborativeUser[]>([]);
  const [sharedState, setSharedState] = useState<SharedState>({});
  const [messages, setMessages] = useState<RealtimeMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<any>(null);

  // Initialize realtime connection
  useEffect(() => {
    if (!user || !roomId) return;

    const channel = supabase.channel(`room:${roomId}`)
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const users = Object.keys(presenceState).map(key => {
          const presence = presenceState[key][0];
          return {
            id: presence.user_id,
            name: presence.name || 'Anonymous',
            avatar: presence.avatar,
            cursor: presence.cursor,
            isActive: true,
            lastSeen: new Date().toISOString()
          };
        });
        setActiveUsers(users);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        const user = newPresences[0];
        toast({
          title: 'User joined',
          description: `${user.name || 'Someone'} joined the collaboration`,
        });
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        const user = leftPresences[0];
        toast({
          title: 'User left',
          description: `${user.name || 'Someone'} left the collaboration`,
        });
      })
      .on('broadcast', { event: 'message' }, ({ payload }) => {
        setMessages(prev => [...prev, payload]);
      })
      .on('broadcast', { event: 'state_update' }, ({ payload }) => {
        setSharedState(prev => ({ ...prev, ...payload.state }));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          await channel.track({
            user_id: user.id,
            name: user.user_metadata?.full_name || user.email,
            avatar: user.user_metadata?.avatar_url,
            online_at: new Date().toISOString()
          });
        } else {
          setIsConnected(false);
        }
      });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
      setIsConnected(false);
    };
  }, [user, roomId]);

  // Send message
  const sendMessage = useCallback(async (message: string, type: 'text' | 'cursor' | 'state_update' = 'text') => {
    if (!channelRef.current || !user) return;

    const messageData: RealtimeMessage = {
      id: crypto.randomUUID(),
      user_id: user.id,
      message,
      timestamp: new Date().toISOString(),
      message_type: type
    };

    await channelRef.current.send({
      type: 'broadcast',
      event: 'message',
      payload: messageData
    });
  }, [user]);

  // Update cursor position
  const updateCursor = useCallback(async (x: number, y: number) => {
    if (!channelRef.current || !user) return;

    await channelRef.current.track({
      user_id: user.id,
      name: user.user_metadata?.full_name || user.email,
      cursor: { x, y },
      online_at: new Date().toISOString()
    });
  }, [user]);

  // Update shared state
  const updateSharedState = useCallback(async (updates: Partial<SharedState>) => {
    if (!channelRef.current) return;

    await channelRef.current.send({
      type: 'broadcast',
      event: 'state_update',
      payload: { state: updates }
    });

    setSharedState(prev => ({ ...prev, ...updates }));
  }, []);

  // Get user presence info
  const getUserPresence = useCallback((userId: string) => {
    return activeUsers.find(u => u.id === userId);
  }, [activeUsers]);

  return {
    activeUsers,
    sharedState,
    messages,
    isConnected,
    sendMessage,
    updateCursor,
    updateSharedState,
    getUserPresence
  };
};
