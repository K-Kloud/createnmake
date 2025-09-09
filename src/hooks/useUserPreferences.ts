import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { UserStyleProfile } from '@/services/aiPromptEnhancer';

interface UserPreferences {
  styleProfile: UserStyleProfile;
  recentSearches: string[];
  favoritePrompts: Array<{
    prompt: string;
    itemType: string;
    timestamp: number;
    rating?: number;
  }>;
  generationSettings: {
    defaultAspectRatio: string;
    preferredProvider: string;
    autoEnhancePrompts: boolean;
    saveGenerationHistory: boolean;
  };
}

const DEFAULT_PREFERENCES: UserPreferences = {
  styleProfile: {
    preferredStyles: ['contemporary'],
    commonKeywords: ['professional'],
    colorPalette: ['neutral'],
    aspectRatioPreference: '1:1',
    qualityLevel: 'high'
  },
  recentSearches: [],
  favoritePrompts: [],
  generationSettings: {
    defaultAspectRatio: '1:1',
    preferredProvider: 'flux.schnell',
    autoEnhancePrompts: true,
    saveGenerationHistory: true
  }
};

export const useUserPreferences = () => {
  const { session } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [isLoading, setIsLoading] = useState(true);

  // Load preferences from localStorage and database
  useEffect(() => {
    const loadPreferences = async () => {
      setIsLoading(true);
      
      try {
        // Load from localStorage first (immediate)
        const localPrefs = localStorage.getItem('user-preferences');
        if (localPrefs) {
          setPreferences(JSON.parse(localPrefs));
        }

        // Then sync with database if logged in
        if (session?.user) {
          // For now, skip database sync since table doesn't exist yet
          // TODO: Create user_preferences table in database
          console.log("Database sync not yet implemented for user preferences");
        }
      } catch (error) {
        console.error('Error loading preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, [session]);

  const updatePreferences = useCallback(async (updates: Partial<UserPreferences>) => {
    const newPreferences = { ...preferences, ...updates };
    setPreferences(newPreferences);
    
    // Save to localStorage immediately
    localStorage.setItem('user-preferences', JSON.stringify(newPreferences));
    
    // Sync to database if logged in
    if (session?.user) {
      try {
        // TODO: Implement database sync when user_preferences table is created
        console.log("Database sync not yet implemented for user preferences");
      } catch (error) {
        console.error('Error saving preferences to database:', error);
      }
    }
  }, [preferences, session]);

  const addToRecentSearches = useCallback((search: string) => {
    const recentSearches = [
      search,
      ...preferences.recentSearches.filter(s => s !== search)
    ].slice(0, 10);
    
    updatePreferences({ recentSearches });
  }, [preferences.recentSearches, updatePreferences]);

  const addFavoritePrompt = useCallback((prompt: string, itemType: string, rating?: number) => {
    const favoritePrompts = [
      {
        prompt,
        itemType,
        timestamp: Date.now(),
        rating
      },
      ...preferences.favoritePrompts.filter(p => p.prompt !== prompt)
    ].slice(0, 20);
    
    updatePreferences({ favoritePrompts });
  }, [preferences.favoritePrompts, updatePreferences]);

  const updateStyleProfile = useCallback((updates: Partial<UserStyleProfile>) => {
    const styleProfile = { ...preferences.styleProfile, ...updates };
    updatePreferences({ styleProfile });
  }, [preferences.styleProfile, updatePreferences]);

  const updateGenerationSettings = useCallback((updates: Partial<UserPreferences['generationSettings']>) => {
    const generationSettings = { ...preferences.generationSettings, ...updates };
    updatePreferences({ generationSettings });
  }, [preferences.generationSettings, updatePreferences]);

  const learnFromGeneration = useCallback((prompt: string, itemType: string, success: boolean, rating?: number) => {
    if (!preferences.generationSettings.saveGenerationHistory) return;
    
    // Extract keywords and styles from successful generations
    if (success && rating && rating >= 4) {
      const keywords = prompt.toLowerCase().split(/\s+/).filter(word => 
        word.length > 3 && !['the', 'and', 'with', 'for', 'this', 'that'].includes(word)
      );
      
      const commonKeywords = [
        ...new Set([...preferences.styleProfile.commonKeywords, ...keywords.slice(0, 3)])
      ].slice(0, 10);
      
      updateStyleProfile({ commonKeywords });
      
      if (rating >= 4) {
        addFavoritePrompt(prompt, itemType, rating);
      }
    }
    
    addToRecentSearches(prompt);
  }, [preferences, updateStyleProfile, addFavoritePrompt, addToRecentSearches]);

  return {
    preferences,
    isLoading,
    updatePreferences,
    addToRecentSearches,
    addFavoritePrompt,
    updateStyleProfile,
    updateGenerationSettings,
    learnFromGeneration
  };
};