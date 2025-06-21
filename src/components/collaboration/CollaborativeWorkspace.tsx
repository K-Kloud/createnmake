
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Users, MessageCircle, Eye, Edit, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface CollaborativeUser {
  id: string;
  username: string;
  avatar_url?: string;
  cursor_position?: { x: number; y: number };
  current_view?: string;
  last_seen: string;
  status: 'active' | 'idle' | 'away';
}

interface CollaborativeWorkspaceProps {
  workspaceId: string;
  children: React.ReactNode;
}

export const CollaborativeWorkspace: React.FC<CollaborativeWorkspaceProps> = ({
  workspaceId,
  children
}) => {
  const [activeUsers, setActiveUsers] = useState<CollaborativeUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [roomChannel, setRoomChannel] = useState<any>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const cursorRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Initialize collaborative session
  useEffect(() => {
    if (!user || !workspaceId) return;

    const channel = supabase.channel(`workspace_${workspaceId}`, {
      config: {
        presence: {
          key: user.id,
        },
      },
    });

    // Track presence
    channel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = channel.presenceState();
        const users = Object.values(presenceState).flat() as CollaborativeUser[];
        setActiveUsers(users);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        const newUsers = newPresences as CollaborativeUser[];
        newUsers.forEach(newUser => {
          if (newUser.id !== user.id) {
            toast({
              title: "User joined",
              description: `${newUser.username} is now viewing this workspace`,
            });
          }
        });
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        const leftUsers = leftPresences as CollaborativeUser[];
        leftUsers.forEach(leftUser => {
          if (leftUser.id !== user.id) {
            toast({
              title: "User left",
              description: `${leftUser.username} left the workspace`,
            });
          }
        });
      })
      .on('broadcast', { event: 'cursor_move' }, (payload) => {
        if (payload.user_id !== user.id) {
          setActiveUsers(prev => 
            prev.map(u => 
              u.id === payload.user_id 
                ? { ...u, cursor_position: payload.position }
                : u
            )
          );
        }
      })
      .on('broadcast', { event: 'view_change' }, (payload) => {
        if (payload.user_id !== user.id) {
          setActiveUsers(prev => 
            prev.map(u => 
              u.id === payload.user_id 
                ? { ...u, current_view: payload.view }
                : u
            )
          );
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          setIsConnected(true);
          setRoomChannel(channel);
          
          // Track initial presence
          await channel.track({
            id: user.id,
            username: user.user_metadata?.username || user.email?.split('@')[0] || 'Anonymous',
            avatar_url: user.user_metadata?.avatar_url,
            current_view: window.location.pathname,
            last_seen: new Date().toISOString(),
            status: 'active',
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, workspaceId, toast]);

  // Track cursor movements
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const newPosition = { x: e.clientX, y: e.clientY };
    cursorRef.current = newPosition;
    
    // Throttle cursor updates
    if (roomChannel) {
      roomChannel.send({
        type: 'broadcast',
        event: 'cursor_move',
        payload: {
          user_id: user?.id,
          position: newPosition,
        },
      });
    }
  }, [roomChannel, user?.id]);

  // Track view changes
  useEffect(() => {
    if (roomChannel && user) {
      roomChannel.send({
        type: 'broadcast',
        event: 'view_change',
        payload: {
          user_id: user.id,
          view: window.location.pathname,
        },
      });
    }
  }, [roomChannel, user, window.location.pathname]);

  // Add mouse move listener
  useEffect(() => {
    let throttleTimer: NodeJS.Timeout;
    
    const throttledMouseMove = (e: MouseEvent) => {
      if (throttleTimer) return;
      
      throttleTimer = setTimeout(() => {
        handleMouseMove(e);
        clearTimeout(throttleTimer);
      }, 100); // Throttle to 10fps
    };

    document.addEventListener('mousemove', throttledMouseMove);
    return () => {
      document.removeEventListener('mousemove', throttledMouseMove);
      if (throttleTimer) clearTimeout(throttleTimer);
    };
  }, [handleMouseMove]);

  // Render other users' cursors
  const renderUserCursors = () => {
    return activeUsers
      .filter(u => u.id !== user?.id && u.cursor_position)
      .map(u => (
        <div
          key={u.id}
          className="fixed pointer-events-none z-50 transition-all duration-100"
          style={{
            left: u.cursor_position!.x,
            top: u.cursor_position!.y,
            transform: 'translate(-2px, -2px)',
          }}
        >
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg" />
            <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded shadow-lg whitespace-nowrap">
              {u.username}
            </div>
          </div>
        </div>
      ));
  };

  return (
    <div className="relative">
      {/* Collaboration status bar */}
      <Card className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <CardTitle className="text-lg">Collaborative Workspace</CardTitle>
              <Badge variant={isConnected ? 'default' : 'secondary'}>
                {isConnected ? 'Connected' : 'Connecting...'}
              </Badge>
            </div>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Active users:</span>
            <div className="flex -space-x-2">
              {activeUsers.slice(0, 5).map((user) => (
                <Avatar key={user.id} className="h-8 w-8 border-2 border-background">
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback className="text-xs">
                    {user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
              {activeUsers.length > 5 && (
                <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                  <span className="text-xs text-muted-foreground">
                    +{activeUsers.length - 5}
                  </span>
                </div>
              )}
            </div>
            {activeUsers.length === 0 && (
              <span className="text-sm text-muted-foreground">Just you</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main workspace content */}
      <div className="relative">
        {children}
        {renderUserCursors()}
      </div>

      {/* Activity feed */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Activity Feed
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {activeUsers.map((user) => (
              <div key={user.id} className="flex items-center gap-2 text-sm">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback className="text-xs">
                    {user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{user.username}</span>
                <span className="text-muted-foreground">
                  {user.current_view ? `viewing ${user.current_view}` : 'active'}
                </span>
                <Badge variant="outline" className="text-xs">
                  {user.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
