import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Plus, Search, Archive } from 'lucide-react';
import { useConversations } from '@/hooks/useConversations';
import { ConversationWithParticipants } from '@/types/messaging';
import { formatDistanceToNow } from 'date-fns';

interface ConversationListProps {
  onConversationSelect: (conversation: ConversationWithParticipants) => void;
  selectedConversationId?: string;
  onCreateNew: () => void;
}

export const ConversationList = ({ 
  onConversationSelect, 
  selectedConversationId, 
  onCreateNew 
}: ConversationListProps) => {
  const { conversations, isLoading } = useConversations();
  const [searchTerm, setSearchTerm] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.latest_message?.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesArchive = showArchived ? conv.is_archived : !conv.is_archived;
    return matchesSearch && matchesArchive;
  });

  const getConversationTitle = (conversation: ConversationWithParticipants) => {
    if (conversation.title) return conversation.title;
    
    if (conversation.conversation_type === 'order') {
      return `Order #${conversation.order_id}`;
    }
    
    if (conversation.conversation_type === 'quote') {
      return `Quote Request #${conversation.quote_request_id}`;
    }
    
    return 'Direct Message';
  };

  const getConversationIcon = (type: string) => {
    switch (type) {
      case 'order':
        return '📦';
      case 'quote':
        return '💰';
      default:
        return '💬';
    }
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Messages
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowArchived(!showArchived)}
            >
              <Archive className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={onCreateNew}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full">
          {filteredConversations.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">
                {showArchived ? 'No archived conversations' : 'No conversations yet'}
              </p>
              {!showArchived && (
                <Button variant="link" className="mt-2" onClick={onCreateNew}>
                  Start a new conversation
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedConversationId === conversation.id ? 'bg-muted' : ''
                  }`}
                  onClick={() => onConversationSelect(conversation)}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-lg">
                      {getConversationIcon(conversation.conversation_type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm truncate">
                          {getConversationTitle(conversation)}
                        </p>
                        <span className="text-xs text-muted-foreground ml-2">
                          {conversation.last_message_at && 
                            formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })
                          }
                        </span>
                      </div>
                      
                      {conversation.latest_message && (
                        <p className="text-sm text-muted-foreground truncate mt-1">
                          {conversation.latest_message.content}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">
                          {conversation.conversation_type}
                        </Badge>
                        
                        {conversation.unread_count > 0 && (
                          <Badge variant="default" className="text-xs">
                            {conversation.unread_count}
                          </Badge>
                        )}
                        
                        {conversation.is_archived && (
                          <Badge variant="outline" className="text-xs">
                            Archived
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};