
import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import { 
  CollaborativeUser, 
  SharedState, 
  RealtimeMessage, 
  ConflictResolutionStrategy 
} from './collaboration/types';
import { useRealtimeChannel } from './collaboration/useRealtimeChannel';
import { useCollaborationActions } from './collaboration/useCollaborationActions';

export const useRealtimeCollaboration = (roomId: string, initialState?: SharedState) => {
  const { user } = useAuth();
  const [activeUsers, setActiveUsers] = useState<CollaborativeUser[]>([]);
  const [sharedState, setSharedState] = useState<SharedState>(initialState || {});
  const [messages, setMessages] = useState<RealtimeMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [conflictResolution, setConflictResolution] = useState<ConflictResolutionStrategy>('last_write_wins');
  const [stateVersion, setStateVersion] = useState(1);
  const [pendingConflicts, setPendingConflicts] = useState(0);

  // Initialize realtime channel
  const channelRef = useRealtimeChannel({
    user,
    roomId,
    setActiveUsers,
    setMessages,
    setSharedState,
    setStateVersion,
    setIsConnected
  });

  // Initialize collaboration actions
  const {
    sendMessage,
    updateCursor,
    updateSharedState,
    broadcastUserAction
  } = useCollaborationActions(user);

  // Update channel ref for actions
  if (channelRef.current) {
    const actions = useCollaborationActions(user);
    actions.channelRef.current = channelRef.current;
  }

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
