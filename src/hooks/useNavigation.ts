import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useErrorHandler } from './useErrorHandler';
import { useRetry } from './useRetry';
import { supabase } from '@/integrations/supabase/client';

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
  parent_id?: string;
  order_index: number;
  is_active: boolean;
  requires_auth: boolean;
  allowed_roles: string[];
  is_external?: boolean;
  target?: '_blank' | '_self';
  description?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

// Mock data for navigation management
const mockNavigationItems: NavigationItem[] = [
  {
    id: '1',
    label: 'Dashboard',
    path: '/dashboard',
    icon: 'Home',
    order_index: 1,
    is_active: true,
    requires_auth: true,
    allowed_roles: ['user', 'admin'],
    is_external: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    label: 'Products',
    path: '/products',
    icon: 'Package',
    order_index: 2,
    is_active: true,
    requires_auth: false,
    allowed_roles: ['user', 'admin', 'guest'],
    is_external: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    label: 'Admin Panel',
    path: '/admin',
    icon: 'Shield',
    order_index: 3,
    is_active: true,
    requires_auth: true,
    allowed_roles: ['admin'],
    is_external: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    label: 'External Link',
    path: 'https://example.com',
    icon: 'ExternalLink',
    order_index: 4,
    is_active: true,
    requires_auth: false,
    allowed_roles: ['user', 'admin', 'guest'],
    is_external: true,
    target: '_blank',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const useNavigation = () => {
  const [navigationItems, setNavigationItems] = useState<NavigationItem[]>(mockNavigationItems);
  const [isLoading, setIsLoading] = useState(false);
  const { handleError } = useErrorHandler();
  const { executeWithRetry } = useRetry({
    config: { maxRetries: 2, delay: 500 },
  });

  // Load navigation items from database on mount
  useEffect(() => {
    loadNavigationItems();
  }, []);

  const loadNavigationItems = async () => {
    try {
      setIsLoading(true);
      const data = await executeWithRetry(async () => {
        const { data, error } = await supabase
          .from('navigation_items')
          .select('*')
          .eq('is_active', true)
          .order('order_index', { ascending: true });

        if (error) throw error;
        return data;
      }, 'load navigation items');
      
      if (data && data.length > 0) {
        setNavigationItems(data);
      }
    } catch (error) {
      handleError(error, 'Failed to load navigation items');
      // Keep using mock data as fallback
    } finally {
      setIsLoading(false);
    }
  };

  const createNavigationItem = async (itemData: Omit<NavigationItem, 'id' | 'created_at' | 'updated_at'>) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('navigation_items')
        .insert([itemData])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setNavigationItems(prev => [...prev, data].sort((a, b) => a.order_index - b.order_index));
        toast.success('Navigation item created successfully');
      }
    } catch (error) {
      handleError(error, 'Failed to create navigation item');
      // Fallback to local state update
      const newItem: NavigationItem = {
        ...itemData,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setNavigationItems(prev => [...prev, newItem].sort((a, b) => a.order_index - b.order_index));
    } finally {
      setIsLoading(false);
    }
  };

  const updateNavigationItem = async (itemData: Partial<NavigationItem> & { id: string }) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('navigation_items')
        .update({ ...itemData, updated_at: new Date().toISOString() })
        .eq('id', itemData.id);

      if (error) throw error;

      setNavigationItems(prev => prev.map(item => 
        item.id === itemData.id 
          ? { ...item, ...itemData, updated_at: new Date().toISOString() }
          : item
      ).sort((a, b) => a.order_index - b.order_index));
      toast.success('Navigation item updated successfully');
    } catch (error) {
      handleError(error, 'Failed to update navigation item');
      // Fallback to local state update
      setNavigationItems(prev => prev.map(item => 
        item.id === itemData.id 
          ? { ...item, ...itemData, updated_at: new Date().toISOString() }
          : item
      ).sort((a, b) => a.order_index - b.order_index));
    } finally {
      setIsLoading(false);
    }
  };

  const deleteNavigationItem = async (id: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('navigation_items')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setNavigationItems(prev => prev.filter(item => item.id !== id));
      toast.success('Navigation item deleted successfully');
    } catch (error) {
      handleError(error, 'Failed to delete navigation item');
      // Fallback to local state update
      setNavigationItems(prev => prev.filter(item => item.id !== id));
    } finally {
      setIsLoading(false);
    }
  };

  const reorderItems = async (items: NavigationItem[]) => {
    setIsLoading(true);
    try {
      const reorderedItems = items.map((item, index) => ({
        ...item,
        order_index: index + 1,
        updated_at: new Date().toISOString(),
      }));
      setNavigationItems(reorderedItems);
      toast.success('Navigation order updated successfully');
    } catch (error) {
      toast.error('Failed to reorder navigation items');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    navigationItems,
    isLoading,
    createNavigationItem,
    updateNavigationItem,
    deleteNavigationItem,
    reorderItems,
  };
};