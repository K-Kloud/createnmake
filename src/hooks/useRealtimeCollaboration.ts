
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface CollaborationState {
  [key: string]: any;
}

interface CollaborationEvent {
  type: 'state_update' | 'user_action' | 'cursor_move' | 'selection_change';
  payload: any;
  user_id: string;
  timestamp: string;
}

export const useRealtimeCollaboration = (roomId: string, initialState: CollaborationState = {}) => {
  const [sharedState, setSharedState] = useState<CollaborationState>(initialState);
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState<any[]>([]);
  const [conflictResolution, setConflictResolution] = useState<'last_write_wins' | 'merge' | 'manual'>('last_write_wins');
  
  const { user } = useAuth();
  const { toast } = useToast();
  const channelRef = useRef<any>(null);
  const stateVersionRef = useRef(0);
  const pendingUpdatesRef = useRef<Map<string, any>>(new Map());

  // Initialize collaboration
  useEffect(() => {
    if (!user || !roomId) return;

    const channel = supabase.channel(`collaboration_${roomId}`, {
      config: {
        presence: { key: user.id },
        broadcast: { self: true },
      },
    });

    channelRef.current = channel;

    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const users = Object.values(presenceState).flat();
        setActiveUsers(users);
      })
      .on('broadcast', { event: 'state_update' }, ({ payload }) => {
        handleRemoteStateUpdate(payload);
      })
      .on('broadcast', { event: 'conflict_resolution' }, ({ payload }) => {
        handleConflictResolution(payload);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          
          // Track presence
          await channel.track({
            id: user.id,
            username: user.user_metadata?.username || user.email?.split('@')[0] || 'Anonymous',
            avatar_url: user.user_metadata?.avatar_url,
            joined_at: new Date().toISOString(),
          });

          // Request current state from other users
          channel.send({
            type: 'broadcast',
            event: 'request_state',
            payload: { requester: user.id },
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, roomId]);

  // Handle remote state updates
  const handleRemoteStateUpdate = useCallback((payload: CollaborationEvent) => {
    if (payload.user_id === user?.id) return; // Ignore own updates

    const { type, payload: updatePayload, timestamp } = payload;
    
    switch (type) {
      case 'state_update':
        applyStateUpdate(updatePayload, timestamp);
        break;
      case 'user_action':
        handleUserAction(updatePayload);
        break;
    }
  }, [user?.id]);

  // Apply state updates with conflict resolution
  const applyStateUpdate = useCallback((update: any, timestamp: string) => {
    setSharedState(prevState => {
      const newState = { ...prevState };
      
      // Apply updates based on conflict resolution strategy
      switch (conflictResolution) {
        case 'last_write_wins':
          Object.assign(newState, update);
          break;
        case 'merge':
          // Implement deep merge logic
          Object.keys(update).forEach(key => {
            if (typeof update[key] === 'object' && typeof newState[key] === 'object') {
              newState[key] = { ...newState[key], ...update[key] };
            } else {
              newState[key] = update[key];
            }
          });
          break;
        case 'manual':
          // Store conflicts for manual resolution
          pendingUpdatesRef.current.set(timestamp, { update, previousState: prevState });
          toast({
            title: "State conflict detected",
            description: "Manual resolution required",
            action: (
              <button
                onClick={() => resolveConflictManually(timestamp)}
                className="px-3 py-1 bg-primary text-primary-foreground rounded text-sm"
              >
                Resolve
              </button>
            ),
          });
          return prevState; // Don't apply automatically
      }
      
      stateVersionRef.current++;
      return newState;
    });
  }, [conflictResolution, toast]);

  // Handle user actions (like cursor moves, selections)
  const handleUserAction = useCallback((actionPayload: any) => {
    // Handle non-state user actions like cursor position, selections, etc.
    console.log('User action:', actionPayload);
  }, []);

  // Broadcast state update
  const updateSharedState = useCallback((updates: Partial<CollaborationState>, options?: {
    merge?: boolean;
    immediate?: boolean;
  }) => {
    const { merge = true, immediate = false } = options || {};
    
    setSharedState(prevState => {
      const newState = merge ? { ...prevState, ...updates } : { ...prevState, ...updates };
      
      // Broadcast to other users
      if (channelRef.current && user) {
        const event: CollaborationEvent = {
          type: 'state_update',
          payload: updates,
          user_id: user.id,
          timestamp: new Date().toISOString(),
        };
        
        if (immediate) {
          channelRef.current.send({
            type: 'broadcast',
            event: 'state_update',
            payload: event,
          });
        } else {
          // Debounce updates for performance
          setTimeout(() => {
            channelRef.current?.send({
              type: 'broadcast',
              event: 'state_update',
              payload: event,
            });
          }, 100);
        }
      }
      
      stateVersionRef.current++;
      return newState;
    });
  }, [user]);

  // Broadcast user action
  const broadcastUserAction = useCallback((action: string, payload: any) => {
    if (channelRef.current && user) {
      const event: CollaborationEvent = {
        type: 'user_action',
        payload: { action, ...payload },
        user_id: user.id,
        timestamp: new Date().toISOString(),
      };
      
      channelRef.current.send({
        type: 'broadcast',
        event: 'state_update',
        payload: event,
      });
    }
  }, [user]);

  // Handle conflict resolution
  const handleConflictResolution = useCallback((payload: any) => {
    // Implement conflict resolution logic
    console.log('Conflict resolution:', payload);
  }, []);

  // Manually resolve conflicts
  const resolveConflictManually = useCallback((timestamp: string) => {
    const conflict = pendingUpdatesRef.current.get(timestamp);
    if (conflict) {
      // Show conflict resolution UI or apply default resolution
      updateSharedState(conflict.update, { immediate: true });
      pendingUpdatesRef.current.delete(timestamp);
      
      toast({
        title: "Conflict resolved",
        description: "Changes have been applied",
      });
    }
  }, [updateSharedState, toast]);

  // Get state value
  const getStateValue = useCallback((key: string) => {
    return sharedState[key];
  }, [sharedState]);

  // Set conflict resolution strategy
  const setConflictResolutionStrategy = useCallback((strategy: 'last_write_wins' | 'merge' | 'manual') => {
    setConflictResolution(strategy);
  }, []);

  return {
    sharedState,
    isConnected,
    activeUsers,
    updateSharedState,
    broadcastUserAction,
    getStateValue,
    setConflictResolutionStrategy,
    conflictResolution,
    stateVersion: stateVersionRef.current,
    pendingConflicts: pendingUpdatesRef.current.size,
  };
};
