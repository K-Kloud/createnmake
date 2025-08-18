import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
  parent_id?: string;
  order: number;
  is_active: boolean;
  requires_auth: boolean;
  allowed_roles: string[];
  is_external: boolean;
  target?: '_blank' | '_self';
  description?: string;
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
    order: 1,
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
    order: 2,
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
    order: 3,
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
    order: 4,
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

  const createNavigationItem = async (itemData: Omit<NavigationItem, 'id' | 'created_at' | 'updated_at'>) => {
    setIsLoading(true);
    try {
      const newItem: NavigationItem = {
        ...itemData,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setNavigationItems(prev => [...prev, newItem].sort((a, b) => a.order - b.order));
      toast.success('Navigation item created successfully');
    } catch (error) {
      toast.error('Failed to create navigation item');
    } finally {
      setIsLoading(false);
    }
  };

  const updateNavigationItem = async (itemData: Partial<NavigationItem> & { id: string }) => {
    setIsLoading(true);
    try {
      setNavigationItems(prev => prev.map(item => 
        item.id === itemData.id 
          ? { ...item, ...itemData, updated_at: new Date().toISOString() }
          : item
      ).sort((a, b) => a.order - b.order));
      toast.success('Navigation item updated successfully');
    } catch (error) {
      toast.error('Failed to update navigation item');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteNavigationItem = async (id: string) => {
    setIsLoading(true);
    try {
      setNavigationItems(prev => prev.filter(item => item.id !== id));
      toast.success('Navigation item deleted successfully');
    } catch (error) {
      toast.error('Failed to delete navigation item');
    } finally {
      setIsLoading(false);
    }
  };

  const reorderItems = async (items: NavigationItem[]) => {
    setIsLoading(true);
    try {
      const reorderedItems = items.map((item, index) => ({
        ...item,
        order: index + 1,
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