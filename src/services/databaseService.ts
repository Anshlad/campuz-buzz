
import { supabase } from '@/integrations/supabase/client';
import { OptimizedUserProfile } from '@/hooks/useOptimizedProfile';
import { EnhancedPost } from '@/hooks/useEnhancedPosts';

class DatabaseService {
  // Profile operations
  async getProfile(userId: string): Promise<OptimizedUserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Profile doesn't exist
        }
        throw error;
      }

      return this.transformProfileData(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  }

  async createProfile(userId: string, userData: any): Promise<OptimizedUserProfile> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          display_name: userData.display_name || 'New User',
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
          ...userData
        })
        .select()
        .single();

      if (error) throw error;
      return this.transformProfileData(data);
    } catch (error) {
      console.error('Error creating profile:', error);
      throw error;
    }
  }

  async updateProfile(userId: string, updates: Partial<OptimizedUserProfile>): Promise<OptimizedUserProfile> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return this.transformProfileData(data);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  // Post operations
  async getPosts(limit: number = 20): Promise<EnhancedPost[]> {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            display_name,
            avatar_url,
            major,
            year
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []).map(post => this.transformPostData(post));
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  }

  async createPost(userId: string, postData: any): Promise<EnhancedPost> {
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: userId,
          content: postData.content,
          title: postData.title,
          post_type: postData.post_type || 'text',
          tags: postData.tags || [],
          image_url: postData.image_url,
          visibility: postData.visibility || 'public'
        })
        .select(`
          *,
          profiles:user_id (
            display_name,
            avatar_url,
            major,
            year
          )
        `)
        .single();

      if (error) throw error;
      return this.transformPostData(data);
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  async toggleLike(postId: string, userId: string): Promise<void> {
    try {
      const { data: existingLike } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();

      if (existingLike) {
        // Unlike
        await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId);
      } else {
        // Like
        await supabase
          .from('likes')
          .insert({
            post_id: postId,
            user_id: userId
          });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      throw error;
    }
  }

  async toggleSave(postId: string, userId: string): Promise<void> {
    try {
      const { data: existingSave } = await supabase
        .from('post_saves')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', userId)
        .single();

      if (existingSave) {
        // Unsave
        await supabase
          .from('post_saves')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId);
      } else {
        // Save
        await supabase
          .from('post_saves')
          .insert({
            post_id: postId,
            user_id: userId
          });
      }
    } catch (error) {
      console.error('Error toggling save:', error);
      throw error;
    }
  }

  // Communities operations
  async getCommunities(category?: string): Promise<any[]> {
    try {
      let query = supabase
        .from('communities')
        .select('*')
        .order('created_at', { ascending: false });

      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching communities:', error);
      throw error;
    }
  }

  async joinCommunity(communityId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('community_members')
        .insert({
          community_id: communityId,
          user_id: userId
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error joining community:', error);
      throw error;
    }
  }

  async leaveCommunity(communityId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('community_members')
        .delete()
        .eq('community_id', communityId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error leaving community:', error);
      throw error;
    }
  }

  // Helper methods
  private transformProfileData(data: any): OptimizedUserProfile {
    return {
      ...data,
      social_links: this.convertJsonToRecord(data.social_links),
      privacy_settings: this.convertJsonToRecord(data.privacy_settings)
    } as OptimizedUserProfile;
  }

  private transformPostData(data: any): EnhancedPost {
    const profile = Array.isArray(data.profiles) ? data.profiles[0] : data.profiles;
    
    return {
      ...data,
      post_type: (data.post_type as 'text' | 'image' | 'video' | 'poll') || 'text',
      updated_at: data.updated_at || data.created_at,
      visibility: (data.visibility as 'public' | 'friends' | 'private') || 'public',
      reactions: this.convertReactions(data.reactions),
      is_saved: false, // Will be loaded separately
      hashtags: [],
      profiles: profile,
      author: {
        id: data.user_id,
        display_name: profile?.display_name || 'Anonymous User',
        avatar_url: profile?.avatar_url,
        major: profile?.major,
        year: profile?.year
      },
      likes_count: data.likes_count || 0,
      comments_count: data.comments_count || 0,
      shares_count: data.shares_count || 0,
      saves_count: data.saves_count || 0,
    };
  }

  private convertJsonToRecord(json: any): Record<string, any> | null {
    if (!json) return null;
    if (typeof json === 'object' && json !== null) {
      return json as Record<string, any>;
    }
    return null;
  }

  private convertReactions(reactions: any): Record<string, any> {
    const defaultReactions = {
      like: { reaction_type: 'like', count: 0, hasReacted: false },
      love: { reaction_type: 'love', count: 0, hasReacted: false },
      laugh: { reaction_type: 'laugh', count: 0, hasReacted: false },
      wow: { reaction_type: 'wow', count: 0, hasReacted: false },
      sad: { reaction_type: 'sad', count: 0, hasReacted: false },
      angry: { reaction_type: 'angry', count: 0, hasReacted: false }
    };

    if (!reactions || typeof reactions !== 'object') {
      return defaultReactions;
    }

    return { ...defaultReactions, ...reactions };
  }
}

export const databaseService = new DatabaseService();
