import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreVertical, Reply, Edit2, Trash2, Download } from 'lucide-react';
import { Message } from '@/types/messaging';
import { useAuth } from '@/hooks/useAuth';
import { useMessages } from '@/hooks/useMessages';
import { formatDistanceToNow } from 'date-fns';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const { user } = useAuth();
  const { editMessage, deleteMessage } = useMessages(message.conversation_id);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  const isOwnMessage = message.sender_id === user?.id;
  const isSystemMessage = message.message_type === 'system';

  const handleEdit = () => {
    if (editContent.trim() && editContent !== message.content) {
      editMessage.mutate({ messageId: message.id, content: editContent });
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteMessage.mutate(message.id);
  };

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (isSystemMessage) {
    return (
      <div className="flex justify-center my-4">
        <Badge variant="secondary" className="text-xs px-3 py-1">
          {message.content}
        </Badge>
      </div>
    );
  }

  return (
    <div className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
      {!isOwnMessage && (
        <Avatar className="h-8 w-8">
          <AvatarImage src={message.sender?.avatar_url} />
          <AvatarFallback className="text-xs">
            {getInitials(message.sender?.display_name)}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={`flex flex-col max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'}`}>
        {!isOwnMessage && (
          <span className="text-xs text-muted-foreground mb-1">
            {message.sender?.display_name || 'Unknown User'}
          </span>
        )}

        <div
          className={`relative group rounded-lg px-3 py-2 ${
            isOwnMessage
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted'
          }`}
        >
          {isEditing ? (
            <div className="flex flex-col gap-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="bg-transparent border-none resize-none focus:outline-none text-sm"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleEdit();
                  }
                  if (e.key === 'Escape') {
                    setIsEditing(false);
                    setEditContent(message.content);
                  }
                }}
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleEdit}>Save</Button>
                <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <>
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              
              {message.attachments && message.attachments.length > 0 && (
                <div className="mt-2 space-y-2">
                  {message.attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center gap-2 p-2 bg-background/10 rounded">
                      <span className="text-xs truncate">{attachment.file_name}</span>
                      <Button size="sm" variant="ghost" asChild>
                        <a href={attachment.file_url} download target="_blank" rel="noopener noreferrer">
                          <Download className="h-3 w-3" />
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Message options */}
              {isOwnMessage && (
                <div className="absolute -right-2 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                        <MoreVertical className="h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setIsEditing(true)}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
          </span>
          {message.edited_at && (
            <span className="text-xs text-muted-foreground">(edited)</span>
          )}
        </div>
      </div>
    </div>
  );
};