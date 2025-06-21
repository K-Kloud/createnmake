
import { useCallback, useRef } from 'react';
import { SharedState, RealtimeMessage } from './types';

export const useCollaborationActions = (user: any) => {
  const channelRef = useRef<any>(null);

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

  const updateCursor = useCallback(async (x: number, y: number) => {
    if (!channelRef.current || !user) return;

    await channelRef.current.track({
      user_id: user.id,
      name: user.user_metadata?.full_name || user.email,
      cursor: { x, y },
      online_at: new Date().toISOString()
    });
  }, [user]);

  const updateSharedState = useCallback(async (updates: Partial<SharedState>) => {
    if (!channelRef.current) return;

    await channelRef.current.send({
      type: 'broadcast',
      event: 'state_update',
      payload: { state: updates }
    });
  }, []);

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

  return {
    channelRef,
    sendMessage,
    updateCursor,
    updateSharedState,
    broadcastUserAction
  };
};
