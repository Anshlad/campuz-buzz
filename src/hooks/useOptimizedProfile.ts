
// TODO: TEMPORARY BYPASS - useOptimizedProfile returns mock data instead of Supabase data
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useRetryableQuery } from './useRetryableQuery';
import { MOCK_PROFILE } from '@/utils/mockUser';

export interface OptimizedUserProfile {
  id: string;
  user_id: string;
  display_name: string;
  bio?: string;
  avatar_url?: string;
  major?: string;
  department?: string;
  year?: string;
  role: string;
  engagement_score: number;
  school?: string;
  gpa?: number;
  graduation_year?: number;
  skills?: string[];
  interests?: string[];
  social_links?: Record<string, string>;
  privacy_settings?: {
    email_visible?: boolean;
    profile_visible?: boolean;
    academic_info_visible?: boolean;
    notifications?: {
      posts: boolean;
      comments: boolean;
      mentions: boolean;
      messages: boolean;
      events: boolean;
    };
  };
  created_at: string;
  updated_at: string;
}

export const useOptimizedProfile = () => {
  const { user } = useAuth();
  // TODO: TEMPORARY BYPASS - Always return mock profile
  const [profile, setProfile] = useState<OptimizedUserProfile | null>(MOCK_PROFILE as OptimizedUserProfile);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchProfile = useCallback(async (): Promise<OptimizedUserProfile | null> => {
    // TODO: TEMPORARY BYPASS - Return mock data instead of Supabase call
    console.log('MOCK: Profile fetch bypassed, using mock data');
    return MOCK_PROFILE as OptimizedUserProfile;
  }, [user]);

  const { 
    data: fetchedProfile, 
    loading, 
    error, 
    retry 
  } = useRetryableQuery({
    queryFn: fetchProfile,
    retryAttempts: 2,
    retryDelay: 500,
  });

  useEffect(() => {
    // TODO: TEMPORARY BYPASS - Always use mock profile
    setProfile(MOCK_PROFILE as OptimizedUserProfile);
  }, [fetchedProfile]);

  const updateProfile = useCallback(async (updates: Partial<OptimizedUserProfile>) => {
    // TODO: TEMPORARY BYPASS - Mock profile update
    console.log('MOCK: Profile update would be processed:', updates);
    
    if (!user || !profile) {
      throw new Error('No user or profile found (demo mode)');
    }

    try {
      setIsUpdating(true);

      // Optimistically update local state
      setProfile(prev => prev ? { ...prev, ...updates } : null);

      console.log('MOCK: Profile updated locally in demo mode');
      return true;
    } catch (error) {
      console.error('Mock update error:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [user, profile]);

  return {
    profile,
    loading: false, // No loading for mock data
    error: null, // No errors in mock mode
    updateProfile,
    refetchProfile: retry,
    isUpdating,
  };
};
