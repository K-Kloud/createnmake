import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface OnboardingTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  icon: string;
}

const ONBOARDING_TASKS: Omit<OnboardingTask, 'completed'>[] = [
  {
    id: 'setup_profile',
    title: 'Set Up Your Profile',
    description: 'Add your avatar and complete your profile information',
    icon: 'User',
  },
  {
    id: 'create_design',
    title: 'Create Your First Design',
    description: 'Use our AI generator to create your first design',
    icon: 'Sparkles',
  },
  {
    id: 'browse_marketplace',
    title: 'Browse the Marketplace',
    description: 'Explore designs from talented creators',
    icon: 'Store',
  },
  {
    id: 'make_purchase',
    title: 'Make Your First Purchase',
    description: 'Buy a design or product from the marketplace',
    icon: 'ShoppingCart',
  },
];

const STORAGE_KEY = 'onboarding_progress';

export const useOnboardingProgress = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<OnboardingTask[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    loadProgress();
  }, [user]);

  const loadProgress = async () => {
    if (!user) return;

    try {
      // Check database for actual progress
      const [profile, designs, orders] = await Promise.all([
        supabase.from('profiles').select('avatar_url, username').eq('id', user.id).single(),
        supabase.from('generated_images').select('id').eq('user_id', user.id).limit(1),
        supabase.from('artisan_quotes').select('id').eq('customer_id', user.id).limit(1),
      ]);

      // Get stored progress from localStorage
      const storedProgress = localStorage.getItem(`${STORAGE_KEY}_${user.id}`);
      const browsedMarketplace = storedProgress ? JSON.parse(storedProgress).browse_marketplace : false;

      const progress: Record<string, boolean> = {
        setup_profile: !!(profile.data?.avatar_url && profile.data?.username),
        create_design: (designs.data?.length ?? 0) > 0,
        browse_marketplace: browsedMarketplace,
        make_purchase: (orders.data?.length ?? 0) > 0,
      };

      const tasksWithProgress = ONBOARDING_TASKS.map(task => ({
        ...task,
        completed: progress[task.id] || false,
      }));

      setTasks(tasksWithProgress);

      // Show checklist if not all tasks are completed
      const allCompleted = tasksWithProgress.every(task => task.completed);
      setIsVisible(!allCompleted);
    } catch (error) {
      console.error('Error loading onboarding progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const markTaskComplete = (taskId: string) => {
    setTasks(prevTasks => {
      const updatedTasks = prevTasks.map(task =>
        task.id === taskId ? { ...task, completed: true } : task
      );

      // Store browse_marketplace in localStorage
      if (taskId === 'browse_marketplace' && user) {
        const progress = { browse_marketplace: true };
        localStorage.setItem(`${STORAGE_KEY}_${user.id}`, JSON.stringify(progress));
      }

      // Hide checklist if all tasks completed
      const allCompleted = updatedTasks.every(task => task.completed);
      if (allCompleted) {
        setTimeout(() => setIsVisible(false), 2000);
      }

      return updatedTasks;
    });
  };

  const dismissChecklist = () => {
    setIsVisible(false);
    if (user) {
      localStorage.setItem(`${STORAGE_KEY}_${user.id}_dismissed`, 'true');
    }
  };

  const completedCount = tasks.filter(task => task.completed).length;
  const progressPercentage = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  return {
    tasks,
    isVisible,
    loading,
    completedCount,
    totalCount: tasks.length,
    progressPercentage,
    markTaskComplete,
    dismissChecklist,
    refreshProgress: loadProgress,
  };
};
