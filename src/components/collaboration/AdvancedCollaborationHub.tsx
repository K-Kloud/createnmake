import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useRealtimeCollaboration } from '@/hooks/useRealtimeCollaboration';
import { useAuth } from '@/hooks/useAuth';
import { ConflictResolutionStrategy } from '@/hooks/collaboration/types';
import { 
  Users, 
  MessageSquare, 
  Video, 
  Share2, 
  FileText, 
  Eye,
  Mic,
  MicOff,
  VideoOff,
  Monitor,
  Settings,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';

interface CollaborationRoom {
  id: string;
  name: string;
  type: 'design' | 'review' | 'brainstorm' | 'presentation';
  participants: number;
  isActive: boolean;
  createdAt: string;
  lastActivity: string;
}

interface CollaborationSession {
  id: string;
  name: string;
  description: string;
  participants: string[];
  startTime: string;
  endTime?: string;
  status: 'active' | 'ended' | 'scheduled';
  tools: string[];
}

export const AdvancedCollaborationHub: React.FC = () => {
  const { user } = useAuth();
  const [activeRoom, setActiveRoom] = useState<string | null>(null);
  const [rooms, setRooms] = useState<CollaborationRoom[]>([]);
  const [sessions, setSessions] = useState<CollaborationSession[]>([]);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [selectedTool, setSelectedTool] = useState<string>('whiteboard');
  const [pendingConflicts, setPendingConflicts] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  // Use collaboration hooks for the active room
  const {
    activeUsers,
    messages,
    isConnected,
    sendMessage,
    updateCursor,
    sharedState,
    updateSharedState,
    conflictResolution,
  } = useRealtimeCollaboration(activeRoom || 'lobby', {
    selectedTool,
    canvasData: {},
    documentState: {}
  });

  // Conflict resolution function
  const resolveConflict = useCallback((key: string, strategy: ConflictResolutionStrategy) => {
    console.log(`Resolving conflict for ${key} using ${strategy}`);
    
    switch (strategy) {
      case 'last_write_wins':
        // Keep the current state value
        break;
      case 'merge':
        // Attempt to merge conflicting values
        break;
      case 'manual':
        // Prompt user for manual resolution
        break;
    }
    
    setPendingConflicts(prev => Math.max(0, prev - 1));
  }, []);

  // Initialize sample rooms and sessions
  useEffect(() => {
    const sampleRooms: CollaborationRoom[] = [
      {
        id: 'design-room-1',
        name: 'Summer Collection Design',
        type: 'design',
        participants: 3,
        isActive: true,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        lastActivity: new Date(Date.now() - 5 * 60 * 1000).toISOString()
      }
    ];

    const sampleSessions: CollaborationSession[] = [
      {
        id: 'session-1',
        name: 'Design Sprint Session',
        description: 'Collaborative design session for new product line',
        participants: ['user1', 'user2', 'user3'],
        startTime: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        status: 'active',
        tools: ['whiteboard', 'video', 'chat', 'screen-share']
      }
    ];

    setRooms(sampleRooms);
    setSessions(sampleSessions);
  }, []);

  const joinRoom = useCallback((roomId: string) => {
    setActiveRoom(roomId);
    updateSharedState({ selectedTool });
    
    toast({
      title: "Joined Room",
      description: `Connected to ${rooms.find(r => r.id === roomId)?.name}`,
    });
  }, [rooms, selectedTool, updateSharedState, toast]);

  const handleSendMessage = useCallback(() => {
    if (newMessage.trim() && activeRoom) {
      sendMessage(newMessage.trim());
      setNewMessage('');
    }
  }, [newMessage, activeRoom, sendMessage]);

  const getRoomTypeIcon = (type: string) => {
    switch (type) {
      case 'design': return <FileText className="w-4 h-4" />;
      case 'review': return <Eye className="w-4 h-4" />;
      case 'brainstorm': return <Zap className="w-4 h-4" />;
      case 'presentation': return <Monitor className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Collaboration Hub</h2>
          <p className="text-muted-foreground">Real-time collaboration and communication</p>
        </div>
        <Button>
          <Users className="w-4 h-4 mr-2" />
          Create Room
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Active Rooms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {rooms.map((room) => (
                  <div key={room.id} 
                       className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted"
                       onClick={() => joinRoom(room.id)}>
                    <div className="flex items-center gap-2">
                      {getRoomTypeIcon(room.type)}
                      <span className="font-medium">{room.name}</span>
                    </div>
                    <Badge variant="outline">{room.participants}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {activeRoom ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                  {rooms.find(r => r.id === activeRoom)?.name}
                  <Badge variant="outline">{activeUsers.length} online</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Chat Area */}
                  <div className="border rounded-lg p-4 h-60 overflow-y-auto">
                    <div className="space-y-2">
                      {messages.slice(-10).map((message) => (
                        <div key={message.id} className="flex gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback>{message.user_id[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="text-xs text-muted-foreground">{message.user_id}</div>
                            <div className="text-sm">{message.message}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Message Input */}
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button onClick={handleSendMessage}>Send</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Room Selected</h3>
                  <p className="text-muted-foreground">Join a room to start collaborating</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Conflict Resolution Panel */}
      {pendingConflicts > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-500" />
              Conflicts Detected ({pendingConflicts})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => resolveConflict('test', 'last_write_wins')}>
                Keep Latest
              </Button>
              <Button size="sm" variant="outline" onClick={() => resolveConflict('test', 'merge')}>
                Merge Changes
              </Button>
              <Button size="sm" variant="outline" onClick={() => resolveConflict('test', 'manual')}>
                Manual Review
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
