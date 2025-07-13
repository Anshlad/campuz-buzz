
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserProfile {
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
  privacy_settings?: Record<string, boolean>;
  created_at: string;
  updated_at: string;
}

export const useUserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        // Handle JSON fields properly
        const profileData = {
          ...data,
          social_links: typeof data.social_links === 'string' 
            ? JSON.parse(data.social_links) 
            : data.social_links || {},
          privacy_settings: typeof data.privacy_settings === 'string'
            ? JSON.parse(data.privacy_settings)
            : data.privacy_settings || {}
        };
        setProfile(profileData);
      } else {
        // Create default profile if none exists
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            display_name: user.email?.split('@')[0] || 'Anonymous',
            role: 'student'
          })
          .select()
          .single();

        if (createError) throw createError;
        
        const profileData = {
          ...newProfile,
          social_links: typeof newProfile.social_links === 'string' 
            ? JSON.parse(newProfile.social_links) 
            : newProfile.social_links || {},
          privacy_settings: typeof newProfile.privacy_settings === 'string'
            ? JSON.parse(newProfile.privacy_settings)
            : newProfile.privacy_settings || {}
        };
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !profile) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;

      setProfile({ ...profile, ...updates });
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  return {
    profile,
    loading,
    updateProfile,
    refetchProfile: fetchProfile
  };
};
