
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

// Helper function to safely convert Json to Record<string, any>
const convertJsonToRecord = (json: any): Record<string, any> | null => {
  if (!json) return null;
  if (typeof json === 'object' && json !== null) {
    return json as Record<string, any>;
  }
  return null;
};

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

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create one
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
          
          // Convert the data to match our interface
          const convertedProfile: UserProfile = {
            ...newProfile,
            social_links: convertJsonToRecord(newProfile.social_links),
            privacy_settings: convertJsonToRecord(newProfile.privacy_settings)
          };
          setProfile(convertedProfile);
        } else {
          throw error;
        }
      } else {
        // Convert the data to match our interface
        const convertedProfile: UserProfile = {
          ...data,
          social_links: convertJsonToRecord(data.social_links),
          privacy_settings: convertJsonToRecord(data.privacy_settings)
        };
        setProfile(convertedProfile);
      }
    } catch (error: any) {
      console.error('Error loading profile:', error);
      setError(error.message);
      toast({
        title: "Error loading profile",
        description: "Please try refreshing the page.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !profile) {
      throw new Error('No user or profile found');
    }

    try {
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

      // Convert the data to match our interface
      const convertedProfile: UserProfile = {
        ...data,
        social_links: convertJsonToRecord(data.social_links),
        privacy_settings: convertJsonToRecord(data.privacy_settings)
      };
      setProfile(convertedProfile);
      
      toast({
        title: "Profile updated!",
        description: "Your changes have been saved successfully."
      });

      return convertedProfile;
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive"
      });
      throw error;
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
