import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useErrorHandler } from './useErrorHandler';
import { useToast } from './use-toast';
import { useAuth } from './useAuth';

interface AIRecommendation {
  id: string;
  user_id: string;
  recommendation_type: string;
  recommendation_data: any;
  confidence_score: number;
  is_applied: boolean;
  feedback_score?: number;
  created_at: string;
  expires_at: string;
  metadata: any;
}

interface AIContentHistory {
  id: string;
  user_id: string;
  content_type: string;
  input_data: any;
  generated_content: any;
  model_used: string;
  processing_time_ms: number;
  quality_score: number;
  created_at: string;
}

interface PersonalizationProfile {
  id: string;
  user_id: string;
  preferred_styles: string[];
  color_preferences: string[];
  activity_patterns: any;
  engagement_history: any;
  learning_data: any;
  last_updated: string;
  created_at: string;
}

interface SmartAutomationRule {
  id: string;
  rule_name: string;
  rule_type: string;
  trigger_conditions: any;
  actions: any;
  is_active: boolean;
  success_rate: number;
  execution_count: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export const useAdvancedAI = () => {
  const { handleError } = useErrorHandler();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Get AI recommendations for user
  const {
    data: recommendations,
    isLoading: recommendationsLoading,
    error: recommendationsError
  } = useQuery({
    queryKey: ['ai-recommendations'],
    queryFn: async (): Promise<AIRecommendation[]> => {
      const { data, error } = await supabase
        .from('ai_recommendations')
        .select('*')
        .gt('expires_at', new Date().toISOString())
        .order('confidence_score', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as AIRecommendation[] || [];
    },
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  // Get AI content history
  const {
    data: contentHistory,
    isLoading: historyLoading
  } = useQuery({
    queryKey: ['ai-content-history'],
    queryFn: async (): Promise<AIContentHistory[]> => {
      const { data, error } = await supabase
        .from('ai_content_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as AIContentHistory[] || [];
    },
  });

  // Get personalization profile
  const {
    data: personalizationProfile,
    isLoading: profileLoading
  } = useQuery({
    queryKey: ['personalization-profile'],
    queryFn: async (): Promise<PersonalizationProfile | null> => {
      const { data, error } = await supabase
        .from('personalization_profiles')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as PersonalizationProfile;
    },
  });

  // Get automation rules
  const {
    data: automationRules,
    isLoading: rulesLoading
  } = useQuery({
    queryKey: ['smart-automation-rules'],
    queryFn: async (): Promise<SmartAutomationRule[]> => {
      const { data, error } = await supabase
        .from('smart_automation_rules')
        .select('*')
        .eq('is_active', true)
        .order('success_rate', { ascending: false });

      if (error) throw error;
      return data as SmartAutomationRule[] || [];
    },
  });

  // Generate personalized recommendations
  const generateRecommendations = useMutation({
    mutationFn: async (input: { 
      type: string;
      context?: any;
    }) => {
      const { data, error } = await supabase.functions.invoke('ai-content-generation', {
        body: {
          action: 'generate_recommendations',
          type: input.type,
          context: input.context,
          user_profile: personalizationProfile
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-recommendations'] });
      toast({
        title: 'AI Recommendations Generated',
        description: 'New personalized recommendations are ready for you',
      });
    },
    onError: (error) => {
      handleError(error, 'generating AI recommendations');
    }
  });

  // Enhance prompt with AI
  const enhancePrompt = useMutation({
    mutationFn: async (input: { 
      prompt: string;
      style?: string;
      itemType?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('ai-content-generation', {
        body: {
          action: 'enhance_prompt',
          prompt: input.prompt,
          style: input.style,
          item_type: input.itemType,
          user_preferences: personalizationProfile?.preferred_styles || []
        }
      });

      if (error) throw error;

      // Log the enhancement to history
      if (user?.id) {
        await supabase.from('ai_content_history').insert({
          user_id: user.id,
          content_type: 'prompt_enhancement',
          input_data: input,
          generated_content: data,
          model_used: 'gpt-4o-mini',
          processing_time_ms: data.processing_time || 0,
          quality_score: 0.8
        });
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-content-history'] });
      toast({
        title: 'Prompt Enhanced',
        description: 'Your prompt has been enhanced with AI suggestions',
      });
    },
    onError: (error) => {
      handleError(error, 'enhancing prompt');
    }
  });

  // Generate smart tags
  const generateSmartTags = useMutation({
    mutationFn: async (input: { 
      prompt: string;
      imageUrl?: string;
    }) => {
      const { data, error } = await supabase.functions.invoke('ai-content-generation', {
        body: {
          action: 'generate_tags',
          prompt: input.prompt,
          image_url: input.imageUrl
        }
      });

      if (error) throw error;

      // Log to history
      if (user?.id) {
        await supabase.from('ai_content_history').insert({
          user_id: user.id,
          content_type: 'tag_generation',
          input_data: input,
          generated_content: data,
          model_used: 'gpt-4o-mini',
          processing_time_ms: data.processing_time || 0,
          quality_score: 0.85
        });
      }

      return data;
    },
    onError: (error) => {
      handleError(error, 'generating smart tags');
    }
  });

  // Update personalization profile
  const updatePersonalizationProfile = useMutation({
    mutationFn: async (updates: any) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const profileData = {
        ...updates,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('personalization_profiles')
        .upsert(profileData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personalization-profile'] });
      toast({
        title: 'Profile Updated',
        description: 'Your AI personalization settings have been saved',
      });
    },
    onError: (error) => {
      handleError(error, 'updating personalization profile');
    }
  });

  // Apply recommendation feedback
  const applyRecommendationFeedback = useMutation({
    mutationFn: async (input: {
      recommendationId: string;
      feedback: number; // 1-5 rating
      applied: boolean;
    }) => {
      const { data, error } = await supabase
        .from('ai_recommendations')
        .update({
          feedback_score: input.feedback,
          is_applied: input.applied
        })
        .eq('id', input.recommendationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-recommendations'] });
    },
    onError: (error) => {
      handleError(error, 'applying recommendation feedback');
    }
  });

  // Analyze user patterns
  const analyzeUserPatterns = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('ai-content-generation', {
        body: {
          action: 'analyze_patterns',
          user_id: personalizationProfile?.user_id
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Update personalization profile with new insights
      if (data.insights) {
        updatePersonalizationProfile.mutate({
          learning_data: data.insights,
          last_updated: new Date().toISOString()
        });
      }
      toast({
        title: 'Pattern Analysis Complete',
        description: 'Your preferences have been analyzed and updated',
      });
    },
    onError: (error) => {
      handleError(error, 'analyzing user patterns');
    }
  });

  // For backward compatibility with existing component
  const generatePersonalizedPrompt = (input: any) => enhancePrompt.mutate(input);
  const analyzeImageTrends = () => analyzeUserPatterns.mutate();

  return {
    // Data
    recommendations,
    contentHistory,
    personalizationProfile,
    automationRules,

    // Loading states
    isLoading: recommendationsLoading || historyLoading || profileLoading || rulesLoading,
    recommendationsLoading,
    historyLoading,
    profileLoading,
    rulesLoading,

    // Errors
    recommendationsError,

    // Mutations
    generateRecommendations: generateRecommendations.mutate,
    enhancePrompt: enhancePrompt.mutate,
    generateSmartTags: generateSmartTags.mutate,
    updatePersonalizationProfile: updatePersonalizationProfile.mutate,
    applyRecommendationFeedback: applyRecommendationFeedback.mutate,
    analyzeUserPatterns: analyzeUserPatterns.mutate,
    
    // Backward compatibility
    generatePersonalizedPrompt,
    analyzeImageTrends,

    // Mutation states
    isGeneratingRecommendations: generateRecommendations.isPending,
    isEnhancingPrompt: enhancePrompt.isPending,
    isGeneratingTags: generateSmartTags.isPending,
    isUpdatingProfile: updatePersonalizationProfile.isPending,
    isAnalyzingPatterns: analyzeUserPatterns.isPending,
    
    // Backward compatibility states
    isGeneratingPrompt: enhancePrompt.isPending,
    isAnalyzingTrends: analyzeUserPatterns.isPending
  };
};