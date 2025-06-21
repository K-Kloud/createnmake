
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

type ConflictResolutionStrategy = 'last_write_wins' | 'merge' | 'manual';

export const useRealtimeCollaboration = (roomId: string, initialState?: SharedState) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeUsers, setActiveUsers] = useState<CollaborativeUser[]>([]);
  const [sharedState, setSharedState] = useState<SharedState>(initialState || {});
  const [messages, setMessages] = useState<RealtimeMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [conflictResolution, setConflictResolution] = useState<ConflictResolutionStrategy>('last_write_wins');
  const [stateVersion, setStateVersion] = useState(1);
  const [pendingConflicts, setPendingConflicts] = useState(0);
  const channelRef = useRef<any>(null);

  // Initialize realtime connection
  useEffect(() => {
    if (!user || !roomId) return;

    const channel = supabase.channel(`room:${roomId}`)
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const users = Object.keys(presenceState).map(key => {
          const presenceList = presenceState[key];
          // Handle both array and single presence format
          const presence = Array.isArray(presenceList) ? presenceList[0] : presenceList;
          
          return {
            id: presence?.user_id || key,
            name: presence?.name || 'Anonymous',
            avatar: presence?.avatar,
            cursor: presence?.cursor,
            isActive: true,
            lastSeen: presence?.online_at || new Date().toISOString()
          };
        });
        setActiveUsers(users);
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        const presence = newPresences[0];
        toast({
          title: 'User joined',
          description: `${presence?.name || 'Someone'} joined the collaboration`,
        });
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        const presence = leftPresences[0];
        toast({
          title: 'User left',
          description: `${presence?.name || 'Someone'} left the collaboration`,
        });
      })
      .on('broadcast', { event: 'message' }, ({ payload }) => {
        setMessages(prev => [...prev, payload]);
      })
      .on('broadcast', { event: 'state_update' }, ({ payload }) => {
        setSharedState(prev => ({ ...prev, ...payload.state }));
        setStateVersion(prev => prev + 1);
      })
      .on('broadcast', { event: 'user_action' }, ({ payload }) => {
        // Handle user actions like editing start/stop
        console.log('User action:', payload);
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
  }, [user, roomId, toast]);

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
    setStateVersion(prev => prev + 1);
  }, []);

  // Broadcast user action
  const broadcastUserAction = useCallback(async (action: string, metadata?: any) => {
    if (!channelRef.current || !user) return;

    await channelRef.current.send({
      type: 'broadcast',
      event: 'user_action',
      payload: {
        user_id: user.id,
        action,
        metadata,
        timestamp: new Date().toISOString()
      }
    });
  }, [user]);

  // Get state value
  const getStateValue = useCallback((key: string) => {
    return sharedState[key];
  }, [sharedState]);

  // Set conflict resolution strategy
  const setConflictResolutionStrategy = useCallback((strategy: ConflictResolutionStrategy) => {
    setConflictResolution(strategy);
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
    getUserPresence,
    broadcastUserAction,
    getStateValue,
    setConflictResolutionStrategy,
    conflictResolution,
    stateVersion,
    pendingConflicts
  };
};
