
import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SharedState, RealtimeMessage } from './types';
import { usePresenceHandlers } from './usePresenceHandlers';

interface UseRealtimeChannelProps {
  user: any;
  roomId: string;
  setActiveUsers: (users: any[]) => void;
  setMessages: (fn: (prev: RealtimeMessage[]) => RealtimeMessage[]) => void;
  setSharedState: (fn: (prev: SharedState) => SharedState) => void;
  setStateVersion: (fn: (prev: number) => number) => void;
  setIsConnected: (connected: boolean) => void;
}

export const useRealtimeChannel = ({
  user,
  roomId,
  setActiveUsers,
  setMessages,
  setSharedState,
  setStateVersion,
  setIsConnected
}: UseRealtimeChannelProps) => {
  const channelRef = useRef<any>(null);
  const { handlePresenceSync, handleUserJoin, handleUserLeave } = usePresenceHandlers();

  useEffect(() => {
    if (!user || !roomId) return;

    const channel = supabase.channel(`room:${roomId}`)
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        handlePresenceSync(presenceState, setActiveUsers);
      })
      .on('presence', { event: 'join' }, handleUserJoin)
      .on('presence', { event: 'leave' }, handleUserLeave)
      .on('broadcast', { event: 'message' }, ({ payload }) => {
        setMessages(prev => [...prev, payload]);
      })
      .on('broadcast', { event: 'state_update' }, ({ payload }) => {
        setSharedState(prev => ({ ...prev, ...payload.state }));
        setStateVersion(prev => prev + 1);
      })
      .on('broadcast', { event: 'user_action' }, ({ payload }) => {
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
  }, [user, roomId, setActiveUsers, setMessages, setSharedState, setStateVersion, setIsConnected, handlePresenceSync, handleUserJoin, handleUserLeave]);

  return channelRef;
};
