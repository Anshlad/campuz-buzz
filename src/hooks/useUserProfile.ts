
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface NotificationSettings {
  posts: boolean;
  comments: boolean;
  mentions: boolean;
  messages: boolean;
  events: boolean;
}

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
  privacy_settings?: {
    email_visible?: boolean;
    profile_visible?: boolean;
    academic_info_visible?: boolean;
    notifications?: NotificationSettings;
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

export const useUserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
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
        setProfile(profileData);
      } else {
        // Create default profile if none exists
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

        if (createError) {
          console.error('Error creating profile:', createError);
          throw createError;
        }
        
        setProfile({ ...newProfile, ...defaultProfile });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !profile) {
      throw new Error('No user or profile found');
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }

      // Update local state
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      
      return true;
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
