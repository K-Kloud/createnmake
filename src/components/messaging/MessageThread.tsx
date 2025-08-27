import { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MoreVertical, Phone, Video, Archive } from 'lucide-react';
import { useMessages } from '@/hooks/useMessages';
import { useConversations } from '@/hooks/useConversations';
import { ConversationWithParticipants } from '@/types/messaging';
import { MessageComposer } from './MessageComposer';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';

interface MessageThreadProps {
  conversation: ConversationWithParticipants;
}

export const MessageThread = ({ conversation }: MessageThreadProps) => {
  const { messages, isLoading } = useMessages(conversation.id);
  const { markAsRead, archiveConversation } = useConversations();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Mark conversation as read when opened
    markAsRead.mutate(conversation.id);
  }, [conversation.id, markAsRead]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const getConversationTitle = () => {
    if (conversation.title) return conversation.title;
    
    if (conversation.conversation_type === 'order') {
      return `Order #${conversation.order_id}`;
    }
    
    if (conversation.conversation_type === 'quote') {
      return `Quote Request #${conversation.quote_request_id}`;
    }
    
    return 'Direct Message';
  };

  const handleArchive = () => {
    archiveConversation.mutate(conversation.id);
  };

  return (
    <Card className="h-full flex flex-col">
      {/* Header */}
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-xl">
              {conversation.conversation_type === 'order' ? '📦' : 
               conversation.conversation_type === 'quote' ? '💰' : '💬'}
            </div>
            
            <div>
              <h3 className="font-semibold">{getConversationTitle()}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {conversation.conversation_type}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {conversation.participants_data.length} participants
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Phone className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Video className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleArchive}
            >
              <Archive className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 p-0 flex flex-col">
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              <div className="text-center">
                <p className="text-sm">No messages yet</p>
                <p className="text-xs mt-1">Start the conversation below</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              <TypingIndicator conversationId={conversation.id} />
            </div>
          )}
        </ScrollArea>

        {/* Message Composer */}
        <div className="border-t p-4">
          <MessageComposer conversationId={conversation.id} />
        </div>
      </CardContent>
    </Card>
  );
};