
// TODO: TEMPORARY BYPASS - useUserProfile returns mock data instead of Supabase data
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MOCK_PROFILE } from '@/utils/mockUser';

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
  // TODO: TEMPORARY BYPASS - Always return mock profile
  const [profile, setProfile] = useState<UserProfile | null>(MOCK_PROFILE);
  const [loading, setLoading] = useState(false); // No loading for mock data
  const [error, setError] = useState<string | null>(null);

  const loadProfile = async () => {
    // TODO: TEMPORARY BYPASS - Skip Supabase calls, use mock data
    console.log('MOCK: Profile loading bypassed, using mock data');
    setProfile(MOCK_PROFILE);
    setLoading(false);
    setError(null);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    // TODO: TEMPORARY BYPASS - Mock profile update
    console.log('MOCK: Profile update would be processed:', updates);
    
    if (profile) {
      setProfile({ ...profile, ...updates });
      toast({
        title: "Demo Mode",
        description: "Profile updated locally (no database changes in demo mode)."
      });
    }

    return profile;
  };

  const updateAvatar = async (avatarUrl: string) => {
    return updateProfile({ avatar_url: avatarUrl });
  };

  const refetchProfile = () => {
    loadProfile();
  };

  useEffect(() => {
    // TODO: TEMPORARY BYPASS - Load mock profile immediately
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
