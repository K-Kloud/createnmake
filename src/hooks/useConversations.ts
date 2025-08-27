import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Conversation, ConversationWithParticipants } from '@/types/messaging';
import { useToast } from '@/hooks/use-toast';

export const useConversations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          participants_data:conversation_participants(*),
          latest_message:messages(
            id,
            content,
            created_at,
            sender_id,
            message_type
          )
        `)
        .eq('conversation_participants.user_id', user.id)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to include unread_count
      const transformedData = (data || []).map(conv => ({
        ...conv,
        unread_count: 0, // TODO: Calculate actual unread count
        latest_message: Array.isArray(conv.latest_message) && conv.latest_message.length > 0 
          ? conv.latest_message[0] 
          : undefined
      }));
      
      return transformedData as ConversationWithParticipants[];
    },
    enabled: !!user?.id,
  });

  const createConversation = useMutation({
    mutationFn: async ({
      participants,
      title,
      conversationType = 'direct',
      orderId,
      quoteRequestId,
    }: {
      participants: string[];
      title?: string;
      conversationType?: 'direct' | 'order' | 'quote';
      orderId?: number;
      quoteRequestId?: number;
    }) => {
      if (!user?.id) throw new Error('User not authenticated');

      // Create conversation
      const { data: conversation, error: conversationError } = await supabase
        .from('conversations')
        .insert({
          title,
          conversation_type: conversationType,
          participants: [...participants, user.id],
          created_by: user.id,
          order_id: orderId,
          quote_request_id: quoteRequestId,
        })
        .select()
        .single();

      if (conversationError) throw conversationError;

      // Add participants
      const participantData = [...participants, user.id].map(userId => ({
        conversation_id: conversation.id,
        user_id: userId,
        role: userId === user.id ? 'admin' : 'participant',
      }));

      const { error: participantsError } = await supabase
        .from('conversation_participants')
        .insert(participantData);

      if (participantsError) throw participantsError;

      return conversation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast({
        title: 'Conversation created',
        description: 'You can now start messaging',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error creating conversation',
        description: error instanceof Error ? error.message : 'Failed to create conversation',
        variant: 'destructive',
      });
    },
  });

  const archiveConversation = useMutation({
    mutationFn: async (conversationId: string) => {
      const { error } = await supabase
        .from('conversations')
        .update({ is_archived: true })
        .eq('id', conversationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast({
        title: 'Conversation archived',
        description: 'The conversation has been moved to archives',
      });
    },
  });

  const markAsRead = useMutation({
    mutationFn: async (conversationId: string) => {
      if (!user?.id) return;

      const { error } = await supabase
        .from('conversation_participants')
        .update({ last_read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id);

      if (error) throw error;
    },
  });

  return {
    conversations: conversations || [],
    isLoading,
    createConversation,
    archiveConversation,
    markAsRead,
  };
};