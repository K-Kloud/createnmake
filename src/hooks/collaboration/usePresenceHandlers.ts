
import { useCallback } from 'react';
import { useToast } from '../use-toast';
import { CollaborativeUser, PresenceData } from './types';

export const usePresenceHandlers = () => {
  const { toast } = useToast();

  const handlePresenceSync = useCallback((presenceState: any, setActiveUsers: (users: CollaborativeUser[]) => void) => {
    const users = Object.keys(presenceState).map(key => {
      const presenceList = presenceState[key] as PresenceData[];
      const presence = Array.isArray(presenceList) && presenceList.length > 0 ? presenceList[0] : {};
      
      return {
        id: presence.user_id || key,
        name: presence.name || 'Anonymous',
        avatar: presence.avatar,
        cursor: presence.cursor,
        isActive: true,
        lastSeen: presence.online_at || new Date().toISOString()
      };
    });
    setActiveUsers(users);
  }, []);

  const handleUserJoin = useCallback(({ newPresences }: { newPresences: any }) => {
    const presence = (newPresences && newPresences[0] ? newPresences[0] : {}) as PresenceData;
    toast({
      title: 'User joined',
      description: `${presence.name || 'Someone'} joined the collaboration`,
    });
  }, [toast]);

  const handleUserLeave = useCallback(({ leftPresences }: { leftPresences: any }) => {
    const presence = (leftPresences && leftPresences[0] ? leftPresences[0] : {}) as PresenceData;
    toast({
      title: 'User left',
      description: `${presence.name || 'Someone'} left the collaboration`,
    });
  }, [toast]);

  return {
    handlePresenceSync,
    handleUserJoin,
    handleUserLeave
  };
};
