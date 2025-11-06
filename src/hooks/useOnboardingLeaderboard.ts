import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LeaderboardEntry {
  id: string;
  user_id: string;
  user_role: string;
  completed_at: string;
  completion_time_seconds: number;
  tasks_completed: number;
  total_tasks: number;
  achievement_count: number;
  username?: string;
  avatar_url?: string;
}

export const useOnboardingLeaderboard = (role?: string) => {
  return useQuery({
    queryKey: ['onboarding-leaderboard', role],
    queryFn: async () => {
      let query = supabase
        .from('onboarding_completions')
        .select(`
          *,
          profiles!inner(username, avatar_url)
        `)
        .order('completion_time_seconds', { ascending: true })
        .limit(10);

      if (role && role !== 'all') {
        query = query.eq('user_role', role);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform the data to flatten profiles
      return (data || []).map((entry: any) => ({
        ...entry,
        username: entry.profiles?.username || 'Anonymous',
        avatar_url: entry.profiles?.avatar_url,
      })) as LeaderboardEntry[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useTopAchievers = (role?: string) => {
  return useQuery({
    queryKey: ['top-achievers', role],
    queryFn: async () => {
      let query = supabase
        .from('onboarding_completions')
        .select(`
          *,
          profiles!inner(username, avatar_url)
        `)
        .order('achievement_count', { ascending: false })
        .order('completion_time_seconds', { ascending: true })
        .limit(10);

      if (role && role !== 'all') {
        query = query.eq('user_role', role);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map((entry: any) => ({
        ...entry,
        username: entry.profiles?.username || 'Anonymous',
        avatar_url: entry.profiles?.avatar_url,
      })) as LeaderboardEntry[];
    },
    staleTime: 1000 * 60 * 5,
  });
};
