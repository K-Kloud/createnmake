import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import type { Profile } from '@/types/auth';

export interface OnboardingTask {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  icon: string;
}

type UserRole = 'creator' | 'artisan' | 'manufacturer' | 'buyer';

const CREATOR_TASKS: Omit<OnboardingTask, 'completed'>[] = [
  {
    id: 'setup_profile',
    title: 'Complete Your Creator Profile',
    description: 'Add your avatar, bio, and portfolio information',
    icon: 'User',
  },
  {
    id: 'create_design',
    title: 'Generate Your First Design',
    description: 'Use AI to create your first unique design',
    icon: 'Sparkles',
  },
  {
    id: 'list_design',
    title: 'List Design on Marketplace',
    description: 'Make your design available for purchase',
    icon: 'Store',
  },
  {
    id: 'explore_tools',
    title: 'Explore Creator Tools',
    description: 'Check out virtual try-on and design variations',
    icon: 'Wand2',
  },
];

const ARTISAN_TASKS: Omit<OnboardingTask, 'completed'>[] = [
  {
    id: 'setup_profile',
    title: 'Set Up Your Artisan Profile',
    description: 'Add business details, specialties, and portfolio',
    icon: 'User',
  },
  {
    id: 'browse_orders',
    title: 'Review Order Dashboard',
    description: 'Learn how to manage incoming production requests',
    icon: 'ClipboardList',
  },
  {
    id: 'accept_quote',
    title: 'Accept Your First Quote',
    description: 'Review and accept a production quote request',
    icon: 'CheckCircle',
  },
  {
    id: 'update_status',
    title: 'Update Order Status',
    description: 'Keep customers informed with status updates',
    icon: 'RefreshCw',
  },
];

const MANUFACTURER_TASKS: Omit<OnboardingTask, 'completed'>[] = [
  {
    id: 'setup_profile',
    title: 'Complete Company Profile',
    description: 'Add business information and manufacturing capabilities',
    icon: 'Building',
  },
  {
    id: 'set_capacity',
    title: 'Set Production Capacity',
    description: 'Define your manufacturing capabilities and MOQ',
    icon: 'Factory',
  },
  {
    id: 'browse_orders',
    title: 'Review Order Management',
    description: 'Learn the bulk order fulfillment workflow',
    icon: 'PackageOpen',
  },
  {
    id: 'accept_quote',
    title: 'Process First Quote',
    description: 'Review and respond to a production quote',
    icon: 'FileCheck',
  },
];

const BUYER_TASKS: Omit<OnboardingTask, 'completed'>[] = [
  {
    id: 'setup_profile',
    title: 'Set Up Your Profile',
    description: 'Add your avatar and preferences',
    icon: 'User',
  },
  {
    id: 'browse_marketplace',
    title: 'Explore the Marketplace',
    description: 'Browse unique designs from talented creators',
    icon: 'Store',
  },
  {
    id: 'try_ai_generator',
    title: 'Try AI Design Generator',
    description: 'Create custom designs with AI assistance',
    icon: 'Sparkles',
  },
  {
    id: 'make_purchase',
    title: 'Make Your First Purchase',
    description: 'Get a custom product made by artisans',
    icon: 'ShoppingCart',
  },
];

const STORAGE_KEY = 'onboarding_progress';

export const useOnboardingProgress = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<OnboardingTask[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole>('buyer');

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    loadProgress();
  }, [user]);

  const getUserRole = async (): Promise<UserRole> => {
    if (!user) return 'buyer';

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const typedProfile = profile as unknown as Profile;

      if (typedProfile?.is_manufacturer) return 'manufacturer';
      if (typedProfile?.is_artisan) return 'artisan';
      if (typedProfile?.is_creator) return 'creator';
      return 'buyer';
    } catch (error) {
      console.error('Error fetching user role:', error);
      return 'buyer';
    }
  };

  const getTasksForRole = (role: UserRole): Omit<OnboardingTask, 'completed'>[] => {
    switch (role) {
      case 'creator':
        return CREATOR_TASKS;
      case 'artisan':
        return ARTISAN_TASKS;
      case 'manufacturer':
        return MANUFACTURER_TASKS;
      case 'buyer':
      default:
        return BUYER_TASKS;
    }
  };

  const loadProgress = async () => {
    if (!user) return;

    try {
      // Determine user role
      const role = await getUserRole();
      setUserRole(role);

      // Get tasks for this role
      const roleTasks = getTasksForRole(role);

      // Check database for actual progress
      const [profile, designs, orders, quotes] = await Promise.all([
        supabase.from('profiles').select('avatar_url, username, bio, business_name').eq('id', user.id).single(),
        supabase.from('generated_images').select('id').eq('user_id', user.id).limit(1),
        supabase.from('artisan_quotes').select('id, status').eq('customer_id', user.id).limit(1),
        supabase.from('artisan_quotes').select('id, status').eq('artisan_id', user.id).limit(1),
      ]);

      // Get stored progress from localStorage
      const storedProgress = localStorage.getItem(`${STORAGE_KEY}_${user.id}`);
      const savedProgress = storedProgress ? JSON.parse(storedProgress) : {};

      // Build progress based on role
      const progress: Record<string, boolean> = {
        setup_profile: !!(profile.data?.avatar_url && profile.data?.username),
        create_design: (designs.data?.length ?? 0) > 0,
        browse_marketplace: savedProgress.browse_marketplace || false,
        make_purchase: (orders.data?.length ?? 0) > 0,
        list_design: savedProgress.list_design || false,
        explore_tools: savedProgress.explore_tools || false,
        try_ai_generator: (designs.data?.length ?? 0) > 0,
        browse_orders: savedProgress.browse_orders || false,
        accept_quote: (quotes.data?.some(q => q.status === 'accepted') ?? false),
        update_status: savedProgress.update_status || false,
        set_capacity: !!(profile.data?.business_name),
      };

      const tasksWithProgress = roleTasks.map(task => ({
        ...task,
        completed: progress[task.id] || false,
      }));

      setTasks(tasksWithProgress);

      // Check if dismissed
      const dismissed = localStorage.getItem(`${STORAGE_KEY}_${user.id}_dismissed`);
      
      // Show checklist if not all tasks are completed and not dismissed
      const allCompleted = tasksWithProgress.every(task => task.completed);
      setIsVisible(!allCompleted && !dismissed);
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

      // Store progress in localStorage for tasks that need it
      if (user) {
        const storedProgress = localStorage.getItem(`${STORAGE_KEY}_${user.id}`);
        const progress = storedProgress ? JSON.parse(storedProgress) : {};
        progress[taskId] = true;
        localStorage.setItem(`${STORAGE_KEY}_${user.id}`, JSON.stringify(progress));
      }

      // Hide checklist if all tasks completed
      const allCompleted = updatedTasks.every(task => task.completed);
      if (allCompleted) {
        setTimeout(() => setIsVisible(false), 2000);

        // Save completion to leaderboard database (async)
        if (user) {
          const startTime = localStorage.getItem(`onboarding_start_${user.id}`);
          if (startTime) {
            const completionTimeSeconds = Math.floor(
              (Date.now() - parseInt(startTime)) / 1000
            );

            // Calculate achievement count based on completion percentage
            const completedCount = updatedTasks.filter(t => t.completed).length;
            const totalCount = updatedTasks.length;
            const percentage = (completedCount / totalCount) * 100;
            
            const achievementCount = 
              percentage === 100 ? 4 :
              percentage >= 75 ? 3 :
              percentage >= 50 ? 2 : 1;

            // Save asynchronously without blocking
            (async () => {
              try {
                // Check if completion already exists
                const { data: existing } = await supabase
                  .from('onboarding_completions')
                  .select('id')
                  .eq('user_id', user.id)
                  .eq('user_role', userRole)
                  .single();

                if (!existing) {
                  await supabase.from('onboarding_completions').insert({
                    user_id: user.id,
                    user_role: userRole,
                    completion_time_seconds: completionTimeSeconds,
                    tasks_completed: completedCount,
                    total_tasks: totalCount,
                    achievement_count: achievementCount,
                  });
                }
              } catch (error) {
                console.error('Error saving completion to leaderboard:', error);
              }
            })();
          }
        }
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
    userRole,
    markTaskComplete,
    dismissChecklist,
    refreshProgress: loadProgress,
  };
};
