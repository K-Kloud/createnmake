import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export interface DynamicPage {
  id: string;
  route_path: string;
  page_title: string;
  component_name: string;
  meta_description?: string;
  is_active: boolean;
  requires_auth: boolean;
  allowed_roles: string[];
  layout_config: any;
  created_at: string;
  updated_at: string;
}

export const useDynamicPages = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get all dynamic pages
  const { data: pages, isLoading } = useQuery({
    queryKey: ['dynamic-pages'],
    queryFn: async (): Promise<DynamicPage[]> => {
      const { data, error } = await supabase
        .from('dynamic_pages')
        .select('*')
        .order('route_path');

      if (error) throw error;
      return data;
    },
  });

  // Create page
  const createPage = useMutation({
    mutationFn: async (page: Omit<DynamicPage, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('dynamic_pages')
        .insert([page])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dynamic-pages'] });
      toast({
        title: 'Page Created',
        description: 'Dynamic page has been created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to create page: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Update page
  const updatePage = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<DynamicPage> & { id: string }) => {
      const { data, error } = await supabase
        .from('dynamic_pages')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dynamic-pages'] });
      toast({
        title: 'Page Updated',
        description: 'Dynamic page has been updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to update page: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  // Delete page
  const deletePage = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('dynamic_pages')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dynamic-pages'] });
      toast({
        title: 'Page Deleted',
        description: 'Dynamic page has been deleted successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: `Failed to delete page: ${error.message}`,
        variant: 'destructive',
      });
    },
  });

  return {
    pages,
    isLoading,
    createPage: createPage.mutate,
    updatePage: updatePage.mutate,
    deletePage: deletePage.mutate,
    isCreating: createPage.isPending,
    isUpdating: updatePage.isPending,
    isDeleting: deletePage.isPending,
  };
};