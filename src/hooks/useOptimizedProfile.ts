
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useRetryableQuery } from './useRetryableQuery';

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
  const [profile, setProfile] = useState<OptimizedUserProfile | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchProfile = useCallback(async (): Promise<OptimizedUserProfile | null> => {
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Create profile if it doesn't exist
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            display_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'New User',
            role: 'student',
            engagement_score: 0,
            privacy_settings: {
              email_visible: false,
              profile_visible: true,
              academic_info_visible: true,
              notifications: {
                posts: true,
                comments: true,
                mentions: true,
                messages: true,
                events: true
              }
            }
          })
          .select()
          .single();

        if (createError) throw createError;
        return newProfile as OptimizedUserProfile;
      }
      throw error;
    }

    return data as OptimizedUserProfile;
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
    if (fetchedProfile) {
      setProfile(fetchedProfile);
    }
  }, [fetchedProfile]);

  const updateProfile = useCallback(async (updates: Partial<OptimizedUserProfile>) => {
    if (!user || !profile) {
      throw new Error('No user or profile found');
    }

    try {
      setIsUpdating(true);

      // Optimistically update local state
      setProfile(prev => prev ? { ...prev, ...updates } : null);

      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setProfile(data as OptimizedUserProfile);
      return true;
    } catch (error) {
      // Revert optimistic update on error
      setProfile(profile);
      console.error('Profile update error:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [user, profile]);

  return {
    profile,
    loading,
    error,
    updateProfile,
    refetchProfile: retry,
    isUpdating,
  };
};
