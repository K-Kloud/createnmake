import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export interface Component {
  id: string;
  name: string;
  type: 'page' | 'component' | 'layout' | 'widget';
  category: string;
  description?: string;
  version: string;
  is_active: boolean;
  props_schema?: any;
  dependencies: string[];
  created_at: string;
  updated_at: string;
}

// Mock data for component registry
const mockComponents: Component[] = [
  {
    id: '1',
    name: 'AdminDashboard',
    type: 'page',
    category: 'admin',
    description: 'Main admin dashboard page',
    version: '1.0.0',
    is_active: true,
    dependencies: ['react', 'lucide-react'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'UserCard',
    type: 'component',
    category: 'ui',
    description: 'Reusable user card component',
    version: '1.2.0',
    is_active: true,
    dependencies: ['react'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'HeaderLayout',
    type: 'layout',
    category: 'layout',
    description: 'Standard header layout',
    version: '2.0.0',
    is_active: false,
    dependencies: ['react', 'react-router-dom'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const useComponents = () => {
  const [components, setComponents] = useState<Component[]>(mockComponents);
  const [isLoading, setIsLoading] = useState(false);

  const createComponent = async (componentData: Omit<Component, 'id' | 'created_at' | 'updated_at'>) => {
    setIsLoading(true);
    try {
      const newComponent: Component = {
        ...componentData,
        id: Date.now().toString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      setComponents(prev => [...prev, newComponent]);
      toast.success('Component registered successfully');
    } catch (error) {
      toast.error('Failed to register component');
    } finally {
      setIsLoading(false);
    }
  };

  const updateComponent = async (componentData: Partial<Component> & { id: string }) => {
    setIsLoading(true);
    try {
      setComponents(prev => prev.map(comp => 
        comp.id === componentData.id 
          ? { ...comp, ...componentData, updated_at: new Date().toISOString() }
          : comp
      ));
      toast.success('Component updated successfully');
    } catch (error) {
      toast.error('Failed to update component');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteComponent = async (id: string) => {
    setIsLoading(true);
    try {
      setComponents(prev => prev.filter(comp => comp.id !== id));
      toast.success('Component deleted successfully');
    } catch (error) {
      toast.error('Failed to delete component');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    components,
    isLoading,
    createComponent,
    updateComponent,
    deleteComponent,
  };
};