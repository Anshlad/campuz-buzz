
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  major: string | null;
  department: string | null;
  year: string | null;
  role: string | null;
  school: string | null;
  skills: string[] | null;
  interests: string[] | null;
  engagement_score: number | null;
  gpa: number | null;
  graduation_year: number | null;
  social_links: Record<string, any> | null;
  privacy_settings: Record<string, any> | null;
  created_at: string;
  updated_at: string;
}

export const useUserProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      if (!data) {
        // Create a default profile if none exists
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'User',
            role: 'student'
          })
          .select()
          .single();

        if (createError) {
          throw createError;
        }

        setProfile({
          ...newProfile,
          social_links: (newProfile.social_links as Record<string, any>) || {},
          privacy_settings: (newProfile.privacy_settings as Record<string, any>) || {}
        });
      } else {
        setProfile({
          ...data,
          social_links: (data.social_links as Record<string, any>) || {},
          privacy_settings: (data.privacy_settings as Record<string, any>) || {}
        });
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !profile) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      setProfile({
        ...data,
        social_links: (data.social_links as Record<string, any>) || {},
        privacy_settings: (data.privacy_settings as Record<string, any>) || {}
      });
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      });

      return data;
    } catch (err) {
      console.error('Error updating profile:', err);
      toast({
        title: "Update failed",
        description: err instanceof Error ? err.message : 'Failed to update profile',
        variant: "destructive"
      });
      throw err;
    }
  };

  const updateAvatar = async (avatarUrl: string) => {
    return updateProfile({ avatar_url: avatarUrl });
  };

  const refetchProfile = () => {
    loadProfile();
  };

  useEffect(() => {
    loadProfile();
  }, [user]);

  return {
    profile,
    loading,
    error,
    updateProfile,
    updateAvatar,
    refetchProfile
  };
};
