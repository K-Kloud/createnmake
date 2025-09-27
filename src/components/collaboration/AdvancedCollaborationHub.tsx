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
    pendingConflicts,
    // resolveConflict // Not available in current hook
  } = useRealtimeCollaboration(activeRoom || 'lobby', {
    selectedTool,
    canvasData: {},
    documentState: {}
  });

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
      },
      {
        id: 'review-room-1',
        name: 'Q3 Product Review',
        type: 'review',
        participants: 5,
        isActive: true,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        lastActivity: new Date(Date.now() - 2 * 60 * 1000).toISOString()
      },
      {
        id: 'brainstorm-room-1',
        name: 'Marketing Campaign Ideas',
        type: 'brainstorm',
        participants: 2,
        isActive: false,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        lastActivity: new Date(Date.now() - 30 * 60 * 1000).toISOString()
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
      },
      {
        id: 'session-2',
        name: 'Weekly Review Meeting',
        description: 'Team review and feedback session',
        participants: ['user1', 'user4', 'user5'],
        startTime: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        status: 'ended',
        tools: ['video', 'chat', 'document']
      }
    ];

    setRooms(sampleRooms);
    setSessions(sampleSessions);
  }, []);

  // Handle video/audio setup
  useEffect(() => {
    const setupMedia = async () => {
      if (isVideoEnabled || isAudioEnabled) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: isVideoEnabled,
            audio: isAudioEnabled
          });
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Failed to access media devices:', error);
          toast({
            title: "Media Access Error",
            description: "Could not access camera or microphone",
            variant: "destructive",
          });
        }
      }
    };

    setupMedia();
  }, [isVideoEnabled, isAudioEnabled, toast]);

  // Mouse tracking for cursor sharing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (activeRoom && isConnected) {
        const rect = document.body.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        
        updateCursor({ x, y, element: (e.target as Element)?.tagName });
      }
    };

    if (activeRoom) {
      document.addEventListener('mousemove', handleMouseMove);
      return () => document.removeEventListener('mousemove', handleMouseMove);
    }
  }, [activeRoom, isConnected, updateCursor]);

  const joinRoom = useCallback((roomId: string) => {
    setActiveRoom(roomId);
    
    // Update room participants
    setRooms(prev => prev.map(room => 
      room.id === roomId 
        ? { ...room, participants: room.participants + (activeRoom ? 0 : 1), isActive: true }
        : room.id === activeRoom
        ? { ...room, participants: Math.max(0, room.participants - 1) }
        : room
    ));

    toast({
      title: "Joined Room",
      description: `Connected to ${rooms.find(r => r.id === roomId)?.name}`,
    });
  }, [activeRoom, rooms, toast]);

  const leaveRoom = useCallback(() => {
    if (activeRoom) {
      setRooms(prev => prev.map(room => 
        room.id === activeRoom 
          ? { ...room, participants: Math.max(0, room.participants - 1) }
          : room
      ));
      
      setActiveRoom(null);
      toast({
        title: "Left Room",
        description: "Disconnected from collaboration room",
      });
    }
  }, [activeRoom, toast]);

  const createRoom = useCallback(() => {
    const newRoom: CollaborationRoom = {
      id: `room-${Date.now()}`,
      name: `New Room ${rooms.length + 1}`,
      type: 'design',
      participants: 1,
      isActive: true,
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString()
    };

    setRooms(prev => [...prev, newRoom]);
    setActiveRoom(newRoom.id);
    
    toast({
      title: "Room Created",
      description: `Created and joined ${newRoom.name}`,
    });
  }, [rooms.length, toast]);

  const toggleVideo = useCallback(() => {
    setIsVideoEnabled(prev => !prev);
    if (isVideoEnabled) {
      // Stop video stream
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getVideoTracks().forEach(track => track.stop());
      }
    }
  }, [isVideoEnabled]);

  const toggleAudio = useCallback(() => {
    setIsAudioEnabled(prev => !prev);
  }, []);

  const toggleScreenShare = useCallback(async () => {
    if (!isScreenSharing) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        setIsScreenSharing(true);
        
        // Handle stream end
        stream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
        };
        
        toast({
          title: "Screen Sharing Started",
          description: "Your screen is now being shared",
        });
      } catch (error) {
        console.error('Failed to start screen sharing:', error);
        toast({
          title: "Screen Share Failed",
          description: "Could not start screen sharing",
          variant: "destructive",
        });
      }
    } else {
      setIsScreenSharing(false);
      toast({
        title: "Screen Sharing Stopped",
        description: "Screen sharing has been stopped",
      });
    }
  }, [isScreenSharing, toast]);

  const handleSendMessage = useCallback(() => {
    if (newMessage.trim() && activeRoom) {
      sendMessage(newMessage.trim(), 'text');
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

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-500' : 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Collaboration Hub</h2>
          <p className="text-muted-foreground">Real-time collaboration and communication</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={createRoom}>
            <Users className="w-4 h-4 mr-2" />
            Create Room
          </Button>
          {activeRoom && (
            <Button variant="outline" onClick={leaveRoom}>
              Leave Room
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Rooms and Sessions Panel */}
        <div className="lg:col-span-1">
          <Tabs defaultValue="rooms" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="rooms">Rooms</TabsTrigger>
              <TabsTrigger value="sessions">Sessions</TabsTrigger>
            </TabsList>

            <TabsContent value="rooms" className="space-y-3">
              {rooms.map((room) => (
                <Card key={room.id} 
                      className={`cursor-pointer transition-all ${
                        activeRoom === room.id ? 'ring-2 ring-primary' : 'hover:shadow-md'
                      }`}
                      onClick={() => activeRoom !== room.id ? joinRoom(room.id) : null}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getRoomTypeIcon(room.type)}
                        <span className="font-medium">{room.name}</span>
                      </div>
                      <Badge className={getStatusColor(room.isActive)}>
                        {room.isActive ? 'Active' : 'Idle'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{room.participants} participants</span>
                      <span>{new Date(room.lastActivity).toLocaleTimeString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="sessions" className="space-y-3">
              {sessions.map((session) => (
                <Card key={session.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{session.name}</span>
                      <Badge className={getStatusColor(session.status === 'active')}>
                        {session.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{session.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span>{session.participants.length} participants</span>
                      <span>{new Date(session.startTime).toLocaleTimeString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>

        {/* Main Collaboration Area */}
        <div className="lg:col-span-2 space-y-4">
          {activeRoom ? (
            <>
              {/* Connection Status */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="font-medium">
                        {rooms.find(r => r.id === activeRoom)?.name}
                      </span>
                      <Badge variant="outline">{activeUsers.length} online</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant={isAudioEnabled ? "default" : "outline"}
                        onClick={toggleAudio}
                      >
                        {isAudioEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                      </Button>
                      <Button 
                        size="sm" 
                        variant={isVideoEnabled ? "default" : "outline"}
                        onClick={toggleVideo}
                      >
                        {isVideoEnabled ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                      </Button>
                      <Button 
                        size="sm" 
                        variant={isScreenSharing ? "default" : "outline"}
                        onClick={toggleScreenShare}
                      >
                        <Monitor className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Participants */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Participants</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {activeUsers.map((user) => (
                      <div key={user.id} className="flex items-center gap-2 p-2 bg-muted rounded-lg">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{user.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{user.name}</span>
                        <div className={`w-2 h-2 rounded-full ${
                          user.presence === 'online' ? 'bg-green-500' : 
                          user.presence === 'away' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Video/Screen Share Area */}
              {(isVideoEnabled || isScreenSharing) && (
                <Card>
                  <CardContent className="p-4">
                    <video 
                      ref={videoRef}
                      autoPlay
                      muted
                      className="w-full rounded-lg bg-black"
                      style={{ maxHeight: '300px' }}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Chat */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Chat
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                    {messages.slice(-10).map((message) => (
                      <div key={message.id} className={`flex gap-2 ${
                        message.type === 'system' ? 'justify-center' : ''
                      }`}>
                        {message.type !== 'system' && (
                          <Avatar className="w-6 h-6">
                            <AvatarFallback>{message.userName[0]}</AvatarFallback>
                          </Avatar>
                        )}
                        <div className={`flex-1 ${message.type === 'system' ? 'text-center' : ''}`}>
                          {message.type !== 'system' && (
                            <div className="text-xs text-muted-foreground">{message.userName}</div>
                          )}
                          <div className={`text-sm ${
                            message.type === 'system' ? 'text-muted-foreground italic' : ''
                          }`}>
                            {message.content}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      onKeyPress={(e) => e.key === 'Enter' ? handleSendMessage() : null}
                    />
                    <Button onClick={handleSendMessage}>Send</Button>
                  </div>
                </CardContent>
              </Card>

              {/* Conflict Resolution */}
              {pendingConflicts.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-500" />
                      Pending Conflicts ({pendingConflicts.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {pendingConflicts.map((conflict) => (
                      <div key={conflict.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-medium">Conflict in: {conflict.key}</span>
                          <Badge variant="outline">{conflict.strategy}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                          <div>
                            <span className="text-muted-foreground">Local:</span>
                            <div className="bg-muted p-2 rounded">
                              {JSON.stringify(conflict.localValue)}
                            </div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Remote:</span>
                            <div className="bg-muted p-2 rounded">
                              {JSON.stringify(conflict.remoteValue)}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => resolveConflict(conflict.id, 'local')}>
                            Keep Local
                          </Button>
                          <Button size="sm" onClick={() => resolveConflict(conflict.id, 'remote')}>
                            Keep Remote
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => resolveConflict(conflict.id, 'merged')}>
                            Auto Merge
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Active Room</h3>
                <p className="text-muted-foreground mb-4">
                  Join a room or create a new one to start collaborating
                </p>
                <Button onClick={createRoom}>
                  <Users className="w-4 h-4 mr-2" />
                  Create New Room
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};