
import { supabase } from '@/integrations/supabase/client';
import { realtimeNotificationsService } from './realtimeNotificationsService';

export interface EnhancedCommunity {
  id: string;
  name: string;
  description: string;
  category?: string;
  avatar_url?: string;
  banner_url?: string;
  is_private: boolean;
  member_count: number;
  created_by: string;
  created_at: string;
  updated_at: string;
  invite_code?: string;
  welcome_message?: string;
  rules?: string;
  isJoined: boolean;
}

export interface CommunityCreateData {
  name: string;
  description: string;
  category?: string;
  is_private?: boolean;
  welcome_message?: string;
  rules?: string;
  avatar_url?: string;
  banner_url?: string;
}

class EnhancedCommunitiesService {
  // Get communities with real-time member count
  async getCommunities(category?: string): Promise<EnhancedCommunity[]> {
    try {
      let query = supabase
        .from('communities_enhanced')
        .select('*');

      if (category) {
        query = query.eq('category', category);
      }

      const { data: communitiesData, error } = await query
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      // Get membership status for each community
      const communitiesWithMembership = await Promise.all(
        (communitiesData || []).map(async (community) => {
          let isJoined = false;
          
          if (userId) {
            const { data: membership } = await supabase
              .from('community_members')
              .select('id')
              .eq('community_id', community.id)
              .eq('user_id', userId)
              .single();
            
            isJoined = !!membership;
          }

          return {
            ...community,
            isJoined
          } as EnhancedCommunity;
        })
      );

      return communitiesWithMembership;
    } catch (error) {
      console.error('Error in getCommunities:', error);
      throw error;
    }
  }

  // Create community with enhanced features
  async createCommunity(communityData: CommunityCreateData): Promise<EnhancedCommunity> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('communities_enhanced')
        .insert({
          ...communityData,
          created_by: user.id,
          member_count: 1
        })
        .select()
        .single();

      if (error) throw error;

      // Auto-join the creator
      await this.joinCommunity(data.id, user.id);

      // Create notification for community creation
      await realtimeNotificationsService.createNotification(
        user.id,
        'community',
        'Community Created',
        `Your community "${data.name}" has been created successfully!`,
        { community_id: data.id }
      );

      return {
        ...data,
        isJoined: true
      } as EnhancedCommunity;
    } catch (error) {
      console.error('Error in createCommunity:', error);
      throw error;
    }
  }

  // Join community
  async joinCommunity(communityId: string, userId: string): Promise<void> {
    try {
      // Check if already a member
      const { data: existingMember } = await supabase
        .from('community_members')
        .select('id')
        .eq('community_id', communityId)
        .eq('user_id', userId)
        .single();

      if (existingMember) {
        throw new Error('Already a member of this community');
      }

      // Join the community
      const { error } = await supabase
        .from('community_members')
        .insert({
          community_id: communityId,
          user_id: userId
        });

      if (error) throw error;

      // Update member count
      const { error: updateError } = await supabase
        .rpc('increment', {
          table_name: 'communities_enhanced',
          column_name: 'member_count',
          id: communityId
        });

      if (updateError) {
        console.warn('Error updating member count:', updateError);
      }

      // Notify community owner
      const { data: community } = await supabase
        .from('communities_enhanced')
        .select('name, created_by')
        .eq('id', communityId)
        .single();

      if (community && community.created_by !== userId) {
        await realtimeNotificationsService.createNotification(
          community.created_by,
          'community',
          'New Member',
          `Someone joined your community "${community.name}"`,
          { community_id: communityId }
        );
      }
    } catch (error) {
      console.error('Error in joinCommunity:', error);
      throw error;
    }
  }

  // Leave community
  async leaveCommunity(communityId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('community_members')
        .delete()
        .eq('community_id', communityId)
        .eq('user_id', userId);

      if (error) throw error;

      // Update member count
      const { error: updateError } = await supabase
        .rpc('decrement', {
          table_name: 'communities_enhanced',
          column_name: 'member_count',
          id: communityId
        });

      if (updateError) {
        console.warn('Error updating member count:', updateError);
      }
    } catch (error) {
      console.error('Error in leaveCommunity:', error);
      throw error;
    }
  }

  // Get community by invite code
  async getCommunityByInviteCode(inviteCode: string): Promise<EnhancedCommunity | null> {
    try {
      const { data, error } = await supabase
        .from('communities_enhanced')
        .select('*')
        .eq('invite_code', inviteCode)
        .single();

      if (error) throw error;

      return data as EnhancedCommunity;
    } catch (error) {
      console.error('Error getting community by invite code:', error);
      return null;
    }
  }
}

export const enhancedCommunitiesService = new EnhancedCommunitiesService();
