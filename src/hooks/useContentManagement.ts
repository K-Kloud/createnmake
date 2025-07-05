import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ContentBlock {
  id: string;
  block_key: string;
  block_type: string;
  title: string;
  content: any;
  metadata: any;
  locale: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface ContentTemplate {
  id: string;
  template_name: string;
  template_schema: any;
  description: string;
  is_active: boolean;
}

export const useContentBlocks = () => {
  return useQuery({
    queryKey: ['content-blocks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_blocks')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ContentBlock[];
    },
  });
};

export const useContentTemplates = () => {
  return useQuery({
    queryKey: ['content-templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_templates')
        .select('*')
        .eq('is_active', true)
        .order('template_name');
      
      if (error) throw error;
      return data as ContentTemplate[];
    },
  });
};

export const useCreateContentBlock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contentBlock: Omit<ContentBlock, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('content_blocks')
        .insert(contentBlock)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-blocks'] });
      toast({
        title: "Content block created",
        description: "The content block has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating content block",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateContentBlock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ContentBlock> & { id: string }) => {
      const { data, error } = await supabase
        .from('content_blocks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-blocks'] });
      toast({
        title: "Content block updated",
        description: "The content block has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating content block",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteContentBlock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('content_blocks')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-blocks'] });
      toast({
        title: "Content block deleted",
        description: "The content block has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting content block",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};