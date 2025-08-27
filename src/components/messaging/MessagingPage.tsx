import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Users } from 'lucide-react';
import { ConversationList } from './ConversationList';
import { MessageThread } from './MessageThread';
import { ConversationWithParticipants } from '@/types/messaging';
import { useConversations } from '@/hooks/useConversations';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const MessagingPage = () => {
  const { user } = useAuth();
  const { createConversation } = useConversations();
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithParticipants | null>(null);
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [newConversationData, setNewConversationData] = useState({
    title: '',
    participants: [] as string[],
    conversationType: 'direct' as 'direct' | 'order' | 'quote',
  });

  // Fetch available users for new conversations
  const { data: availableUsers } = useQuery({
    queryKey: ['available-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, display_name, avatar_url')
        .neq('id', user?.id)
        .limit(50);

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  const handleCreateConversation = async () => {
    if (newConversationData.participants.length === 0) return;

    try {
      await createConversation.mutateAsync({
        participants: newConversationData.participants,
        title: newConversationData.title || undefined,
        conversationType: newConversationData.conversationType,
      });

      setShowNewConversation(false);
      setNewConversationData({
        title: '',
        participants: [],
        conversationType: 'direct',
      });
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  return (
    <div className="container mx-auto p-6 h-screen flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Messages</h1>
        <p className="text-muted-foreground">
          Communicate with artisans and customers about orders and quotes
        </p>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 min-h-0">
        {/* Conversations List */}
        <div className="md:col-span-1">
          <ConversationList
            onConversationSelect={setSelectedConversation}
            selectedConversationId={selectedConversation?.id}
            onCreateNew={() => setShowNewConversation(true)}
          />
        </div>

        {/* Message Thread */}
        <div className="md:col-span-2">
          {selectedConversation ? (
            <MessageThread conversation={selectedConversation} />
          ) : (
            <Card className="h-full flex items-center justify-center">
              <div className="text-center">
                <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
                <p className="text-muted-foreground mb-4">
                  Choose a conversation from the list to start messaging
                </p>
                <Button onClick={() => setShowNewConversation(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Start New Conversation
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* New Conversation Dialog */}
      <Dialog open={showNewConversation} onOpenChange={setShowNewConversation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start New Conversation</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title (optional)</Label>
              <Input
                id="title"
                placeholder="Enter conversation title..."
                value={newConversationData.title}
                onChange={(e) => setNewConversationData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="type">Conversation Type</Label>
              <Select
                value={newConversationData.conversationType}
                onValueChange={(value) => setNewConversationData(prev => ({ 
                  ...prev, 
                  conversationType: value as 'direct' | 'order' | 'quote' 
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="direct">Direct Message</SelectItem>
                  <SelectItem value="order">Order Discussion</SelectItem>
                  <SelectItem value="quote">Quote Negotiation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Participants</Label>
              <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                {availableUsers?.map((user) => (
                  <label key={user.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={newConversationData.participants.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNewConversationData(prev => ({
                            ...prev,
                            participants: [...prev.participants, user.id]
                          }));
                        } else {
                          setNewConversationData(prev => ({
                            ...prev,
                            participants: prev.participants.filter(id => id !== user.id)
                          }));
                        }
                      }}
                      className="rounded"
                    />
                    <span className="text-sm">{user.display_name || 'Unknown User'}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowNewConversation(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateConversation}
                disabled={newConversationData.participants.length === 0 || createConversation.isPending}
              >
                {createConversation.isPending ? 'Creating...' : 'Create Conversation'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};