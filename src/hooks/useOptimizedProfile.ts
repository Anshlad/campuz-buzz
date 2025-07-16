
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
      .maybeSingle(); // Use maybeSingle to avoid errors when no profile exists

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    if (!data) {
      // Create default profile
      const defaultProfile = {
        user_id: user.id,
        display_name: user.email?.split('@')[0] || 'Anonymous',
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
        },
        social_links: {}
      };

      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert(defaultProfile)
        .select()
        .single();

      if (createError) throw createError;
      return { ...newProfile, ...defaultProfile };
    }

    // Handle JSON fields properly
    return {
      ...data,
      social_links: typeof data.social_links === 'string' 
        ? JSON.parse(data.social_links) 
        : data.social_links || {},
      privacy_settings: typeof data.privacy_settings === 'string'
        ? JSON.parse(data.privacy_settings)
        : data.privacy_settings || {
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
    };
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

      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        // Revert optimistic update on error
        setProfile(prev => prev ? { ...prev, ...Object.fromEntries(
          Object.keys(updates).map(key => [key, (profile as any)[key]])
        ) } : null);
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Error updating profile:', error);
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
