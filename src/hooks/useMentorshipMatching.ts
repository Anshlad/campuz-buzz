
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface MentorProfile {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url?: string;
  major?: string;
  year?: string;
  bio?: string;
  skills?: string[];
  engagement_score: number;
  is_mentor: boolean;
}

export interface MentorshipRequest {
  id: string;
  mentor_id: string;
  mentee_id: string;
  status: 'pending' | 'accepted' | 'declined';
  message?: string;
  created_at: string;
  mentor?: MentorProfile;
  mentee?: MentorProfile;
}

export const useMentorshipMatching = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [mentors, setMentors] = useState<MentorProfile[]>([]);
  const [mentorshipRequests, setMentorshipRequests] = useState<MentorshipRequest[]>([]);
  const [myMentees, setMyMentees] = useState<MentorProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const loadMentors = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'mentor')
        .gte('engagement_score', 50)
        .order('engagement_score', { ascending: false })
        .limit(20);

      if (error) throw error;
      setMentors(data || []);
    } catch (error) {
      console.error('Error loading mentors:', error);
    }
  };

  const loadMentorshipRequests = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('mentorship_matches')
        .select(`
          *,
          mentor:mentor_id (id, display_name, avatar_url, major, year),
          mentee:mentee_id (id, display_name, avatar_url, major, year)
        `)
        .or(`mentor_id.eq.${user.id},mentee_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMentorshipRequests(data || []);
    } catch (error) {
      console.error('Error loading mentorship requests:', error);
    }
  };

  const requestMentorship = async (mentorId: string, message?: string) => {
    if (!user?.id) return false;

    try {
      const { error } = await supabase
        .from('mentorship_matches')
        .insert({
          mentor_id: mentorId,
          mentee_id: user.id,
          status: 'pending',
          message: message || ''
        });

      if (error) throw error;

      toast({
        title: "Mentorship request sent!",
        description: "Your mentor will be notified of your request."
      });

      await loadMentorshipRequests();
      return true;
    } catch (error) {
      console.error('Error requesting mentorship:', error);
      toast({
        title: "Error",
        description: "Failed to send mentorship request.",
        variant: "destructive"
      });
      return false;
    }
  };

  const respondToRequest = async (requestId: string, status: 'accepted' | 'declined') => {
    try {
      const { error } = await supabase
        .from('mentorship_matches')
        .update({ status })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: status === 'accepted' ? "Request accepted!" : "Request declined",
        description: status === 'accepted' 
          ? "You now have a new mentee!" 
          : "The request has been declined."
      });

      await loadMentorshipRequests();
      return true;
    } catch (error) {
      console.error('Error responding to request:', error);
      toast({
        title: "Error",
        description: "Failed to respond to request.",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        loadMentors(),
        loadMentorshipRequests()
      ]);
      setLoading(false);
    };

    loadData();
  }, [user?.id]);

  return {
    mentors,
    mentorshipRequests,
    myMentees,
    loading,
    requestMentorship,
    respondToRequest,
    refetch: () => {
      loadMentors();
      loadMentorshipRequests();
    }
  };
};
