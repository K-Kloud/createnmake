
import React, { useState, useEffect } from 'react';
import { useRealtimeCollaboration } from '@/hooks/useRealtimeCollaboration';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, MousePointer, Edit, Share } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface CollaborativeUser {
  id: string;
  username: string;
  last_seen: string;
  status: 'online' | 'offline' | 'away';
  avatar_url?: string;
}

export const CollaborativeWorkspace: React.FC<{
  roomId: string;
  documentType: 'design' | 'text' | 'canvas';
}> = ({ roomId, documentType }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [documentContent, setDocumentContent] = useState<string>('');
  const [isEditing, setIsEditing] = useState(false);

  const {
    sharedState,
    isConnected,
    activeUsers,
    updateSharedState,
    broadcastUserAction,
    getStateValue,
    setConflictResolutionStrategy,
    conflictResolution,
    stateVersion,
    pendingConflicts,
  } = useRealtimeCollaboration(roomId, {
    document_content: '',
    document_type: documentType,
    last_modified: new Date().toISOString(),
  });

  // Convert presence data to CollaborativeUser format
  const collaborativeUsers: CollaborativeUser[] = activeUsers.map((user: any) => ({
    id: user.id || user.user_id || 'unknown',
    username: user.username || user.name || 'Anonymous',
    last_seen: user.joined_at || new Date().toISOString(),
    status: 'online' as const,
    avatar_url: user.avatar_url,
  }));

  useEffect(() => {
    const content = getStateValue('document_content');
    if (content && content !== documentContent) {
      setDocumentContent(content);
    }
  }, [sharedState, getStateValue, documentContent]);

  const handleContentChange = (newContent: string) => {
    setDocumentContent(newContent);
    updateSharedState({
      document_content: newContent,
      last_modified: new Date().toISOString(),
    });
  };

  const handleCursorMove = (position: { x: number; y: number }) => {
    broadcastUserAction('cursor_move', { position });
  };

  const toggleEditing = () => {
    const newEditingState = !isEditing;
    setIsEditing(newEditingState);
    
    if (newEditingState) {
      broadcastUserAction('start_editing', { section: 'main_document' });
    } else {
      broadcastUserAction('stop_editing', { section: 'main_document' });
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <p>Please sign in to access collaborative features.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Collaboration Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Share className="h-5 w-5" />
              Collaborative {documentType.charAt(0).toUpperCase() + documentType.slice(1)}
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isConnected ? 'default' : 'destructive'}>
                {isConnected ? 'Connected' : 'Disconnected'}
              </Badge>
              <Badge variant="outline">
                v{stateVersion}
              </Badge>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Active Users */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Active Users ({collaborativeUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {collaborativeUsers.map((collaborativeUser) => (
              <Badge key={collaborativeUser.id} variant="secondary" className="flex items-center gap-1">
                <MousePointer className="h-3 w-3" />
                {collaborativeUser.username}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Document Editor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Document Content</span>
            <div className="flex items-center gap-2">
              <Button
                variant={isEditing ? "destructive" : "default"}
                size="sm"
                onClick={toggleEditing}
              >
                <Edit className="h-4 w-4 mr-1" />
                {isEditing ? 'Stop Editing' : 'Start Editing'}
              </Button>
              <select
                value={conflictResolution}
                onChange={(e) => setConflictResolutionStrategy(e.target.value as any)}
                className="px-2 py-1 border rounded text-sm"
              >
                <option value="last_write_wins">Last Write Wins</option>
                <option value="merge">Auto Merge</option>
                <option value="manual">Manual Resolution</option>
              </select>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            value={documentContent}
            onChange={(e) => handleContentChange(e.target.value)}
            disabled={!isEditing}
            className="w-full h-64 p-3 border rounded-md resize-none"
            placeholder="Start typing to collaborate with others in real-time..."
            onMouseMove={(e) => {
              if (isEditing) {
                handleCursorMove({ x: e.clientX, y: e.clientY });
              }
            }}
          />
          
          {pendingConflicts > 0 && (
            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-sm text-yellow-800">
                {pendingConflicts} pending conflict(s) require manual resolution.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Document Metadata */}
      <Card>
        <CardHeader>
          <CardTitle>Document Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="text-sm">
            <strong>Room ID:</strong> {roomId}
          </div>
          <div className="text-sm">
            <strong>Document Type:</strong> {documentType}
          </div>
          <div className="text-sm">
            <strong>Last Modified:</strong> {getStateValue('last_modified') || 'Never'}
          </div>
          <div className="text-sm">
            <strong>Conflict Resolution:</strong> {conflictResolution}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
