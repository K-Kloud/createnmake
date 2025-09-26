import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CollaborationContextType {
  activeUsers: ActiveUser[];
  cursor: CursorPosition | null;
  connect: (roomId: string) => void;
  disconnect: () => void;
  updateCursor: (position: CursorPosition) => void;
  sendAction: (action: CollaborationAction) => void;
}

interface ActiveUser {
  id: string;
  name: string;
  avatar?: string;
  cursor?: CursorPosition;
}

interface CursorPosition {
  x: number;
  y: number;
  element?: string;
}

interface CollaborationAction {
  type: string;
  payload: any;
  timestamp: number;
  userId: string;
}

const CollaborationContext = createContext<CollaborationContextType | null>(null);

export const useCollaboration = () => {
  const context = useContext(CollaborationContext);
  if (!context) {
    throw new Error('useCollaboration must be used within CollaborationProvider');
  }
  return context;
};

interface CollaborationProviderProps {
  children: ReactNode;
}

export const CollaborationProvider: React.FC<CollaborationProviderProps> = ({ children }) => {
  const [activeUsers, setActiveUsers] = useState<ActiveUser[]>([]);
  const [cursor, setCursor] = useState<CursorPosition | null>(null);
  const [channel, setChannel] = useState<any>(null);
  const { toast } = useToast();

  const connect = async (roomId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const roomChannel = supabase.channel(`room:${roomId}`, {
        config: {
          presence: {
            key: user.id,
          },
        },
      });

      roomChannel
        .on('presence', { event: 'sync' }, () => {
          const state = roomChannel.presenceState();
          const users = Object.values(state).flat().map((presence: any) => ({
            id: presence.id || presence.user_id,
            name: presence.name || presence.display_name,
            avatar: presence.avatar,
            cursor: presence.cursor
          })) as ActiveUser[];
          setActiveUsers(users);
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          const newUser = newPresences[0] as any;
          toast({
            title: 'User joined',
            description: `${newUser?.name || 'Unknown user'} joined the collaboration`,
          });
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          const leftUser = leftPresences[0] as any;
          toast({
            title: 'User left',
            description: `${leftUser?.name || 'Unknown user'} left the collaboration`,
          });
        })
        .on('broadcast', { event: 'cursor' }, ({ payload }) => {
          const updatedUsers = activeUsers.map(u => 
            u.id === payload.userId ? { ...u, cursor: payload.position } : u
          );
          setActiveUsers(updatedUsers);
        })
        .on('broadcast', { event: 'action' }, ({ payload }) => {
          handleCollaborationAction(payload);
        })
        .subscribe(async (status) => {
          if (status !== 'SUBSCRIBED') return;

          await roomChannel.track({
            id: user.id,
            name: user.user_metadata?.name || user.email,
            avatar: user.user_metadata?.avatar_url,
            online_at: new Date().toISOString(),
          });
        });

      setChannel(roomChannel);
    } catch (error) {
      console.error('Failed to connect to collaboration room:', error);
      toast({
        title: 'Connection failed',
        description: 'Could not connect to collaboration room',
        variant: 'destructive',
      });
    }
  };

  const disconnect = () => {
    if (channel) {
      supabase.removeChannel(channel);
      setChannel(null);
      setActiveUsers([]);
    }
  };

  const updateCursor = (position: CursorPosition) => {
    setCursor(position);
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'cursor',
        payload: { position, userId: activeUsers.find(u => u.id)?.id }
      });
    }
  };

  const sendAction = (action: CollaborationAction) => {
    if (channel) {
      channel.send({
        type: 'broadcast',
        event: 'action',
        payload: action
      });
    }
  };

  const handleCollaborationAction = (action: CollaborationAction) => {
    // Handle different types of collaboration actions
    switch (action.type) {
      case 'selection_change':
        // Handle selection changes
        break;
      case 'content_edit':
        // Handle content edits
        break;
      default:
        console.log('Unknown collaboration action:', action);
    }
  };

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  const value: CollaborationContextType = {
    activeUsers,
    cursor,
    connect,
    disconnect,
    updateCursor,
    sendAction,
  };

  return (
    <CollaborationContext.Provider value={value}>
      {children}
    </CollaborationContext.Provider>
  );
};