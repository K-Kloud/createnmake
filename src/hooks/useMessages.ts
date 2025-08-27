import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Message } from '@/types/messaging';
import { useToast } from '@/hooks/use-toast';

export const useMessages = (conversationId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: messages, isLoading } = useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];

      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:profiles!sender_id(
            id,
            display_name,
            avatar_url
          ),
          attachments:message_attachments(*)
        `)
        .eq('conversation_id', conversationId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Transform data to match Message interface
      const transformedData = (data || []).map(msg => ({
        ...msg,
        sender: Array.isArray(msg.sender) && msg.sender.length > 0 
          ? msg.sender[0] 
          : undefined
      }));
      
      return transformedData as Message[];
    },
    enabled: !!conversationId,
  });

  const sendMessage = useMutation({
    mutationFn: async ({
      content,
      messageType = 'text',
      replyToId,
      attachments,
    }: {
      content: string;
      messageType?: 'text' | 'file' | 'system' | 'quote_update';
      replyToId?: string;
      attachments?: File[];
    }) => {
      if (!user?.id || !conversationId) throw new Error('Missing required data');

      // Create message
      const { data: message, error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          content,
          message_type: messageType,
          reply_to_id: replyToId,
        })
        .select()
        .single();

      if (messageError) throw messageError;

      // Handle file attachments
      if (attachments && attachments.length > 0) {
        for (const file of attachments) {
          // Upload file to storage
          const fileName = `${Date.now()}_${file.name}`;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('generated-images')
            .upload(`messages/${conversationId}/${fileName}`, file);

          if (uploadError) {
            console.error('File upload error:', uploadError);
            continue;
          }

          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('generated-images')
            .getPublicUrl(uploadData.path);

          // Create attachment record
          await supabase.from('message_attachments').insert({
            message_id: message.id,
            file_name: file.name,
            file_url: publicUrl,
            file_type: file.type,
            file_size: file.size,
          });
        }
      }

      return message;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error) => {
      toast({
        title: 'Error sending message',
        description: error instanceof Error ? error.message : 'Failed to send message',
        variant: 'destructive',
      });
    },
  });

  const editMessage = useMutation({
    mutationFn: async ({ messageId, content }: { messageId: string; content: string }) => {
      const { error } = await supabase
        .from('messages')
        .update({ 
          content, 
          edited_at: new Date().toISOString() 
        })
        .eq('id', messageId)
        .eq('sender_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
    },
  });

  const deleteMessage = useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase
        .from('messages')
        .update({ is_deleted: true })
        .eq('id', messageId)
        .eq('sender_id', user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
    },
  });

  // Set up real-time subscription
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient]);

  return {
    messages: messages || [],
    isLoading,
    sendMessage,
    editMessage,
    deleteMessage,
  };
};