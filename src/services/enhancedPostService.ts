
import { supabase } from '@/integrations/supabase/client';
import { NotificationService } from '@/services/notificationService';

export interface EnhancedPost {
  id: string;
  user_id: string;
  title?: string;
  content: string;
  image_url?: string;
  post_type: 'text' | 'image' | 'video' | 'poll';
  tags?: string[];
  likes_count: number;
  comments_count: number;
  shares_count: number;
  saves_count: number;
  created_at: string;
  updated_at: string;
  visibility: 'public' | 'friends' | 'private';
  hashtags: string[];
  mentions: string[];
  reactions: Record<string, any>;
  author: {
    id: string;
    display_name: string;
    avatar_url?: string;
    major?: string;
    year?: string;
  };
  is_liked: boolean;
  is_saved: boolean;
}

export class EnhancedPostService {
  static async deletePost(postId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check if user owns the post
      const { data: post } = await supabase
        .from('posts')
        .select('user_id, title')
        .eq('id', postId)
        .single();

      if (!post) {
        throw new Error('Post not found');
      }

      if (post.user_id !== user.id) {
        throw new Error('You can only delete your own posts');
      }

      // Use the secure deletion function
      const { error } = await supabase.rpc('delete_post_cascade', {
        post_uuid: postId
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting post:', error);
      throw error;
    }
  }

  static async extractHashtags(content: string): Promise<string[]> {
    const hashtagRegex = /#(\w+)/g;
    const hashtags: string[] = [];
    let match;

    while ((match = hashtagRegex.exec(content)) !== null) {
      hashtags.push(match[1].toLowerCase());
    }

    return [...new Set(hashtags)]; // Remove duplicates
  }

  static async extractMentions(content: string): Promise<string[]> {
    const mentionRegex = /@(\w+)/g;
    const mentions: string[] = [];
    let match;

    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1]);
    }

    return [...new Set(mentions)]; // Remove duplicates
  }

  static async getPostsByHashtag(hashtag: string): Promise<EnhancedPost[]> {
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
        .contains('hashtags', [hashtag])
        .order('created_at', { ascending: false });

      if (error) throw error;

      return this.transformPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts by hashtag:', error);
      throw error;
    }
  }

  static async getUserProfile(userId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  static async getUserPostsByMention(displayName: string): Promise<{
    user: any;
    posts: EnhancedPost[];
  }> {
    try {
      // First get the user by display name
      const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .eq('display_name', displayName)
        .single();

      if (userError) throw userError;

      // Then get their posts
      const { data: posts, error: postsError } = await supabase
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
        .eq('user_id', user.user_id)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      return {
        user,
        posts: this.transformPosts(posts || [])
      };
    } catch (error) {
      console.error('Error fetching user posts by mention:', error);
      throw error;
    }
  }

  private static transformPosts(dbPosts: any[]): EnhancedPost[] {
    return dbPosts.map(post => {
      const profile = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles;
      
      return {
        id: post.id,
        user_id: post.user_id,
        title: post.title,
        content: post.content,
        image_url: post.image_url,
        post_type: post.post_type as 'text' | 'image' | 'video' | 'poll',
        tags: post.tags || [],
        likes_count: post.likes_count || 0,
        comments_count: post.comments_count || 0,
        shares_count: post.shares_count || 0,
        saves_count: post.saves_count || 0,
        created_at: post.created_at,
        updated_at: post.updated_at || post.created_at,
        visibility: post.visibility as 'public' | 'friends' | 'private',
        hashtags: post.hashtags || [],
        mentions: post.mentions || [],
        reactions: post.reactions || {},
        author: {
          id: post.user_id,
          display_name: profile?.display_name || 'Anonymous User',
          avatar_url: profile?.avatar_url,
          major: profile?.major,
          year: profile?.year,
        },
        is_liked: false, // Will be populated separately
        is_saved: false, // Will be populated separately
      };
    });
  }

  static async processMentionsAndHashtags(content: string, postId: string, authorId: string): Promise<void> {
    try {
      // Process mentions
      const mentions = await this.extractMentions(content);
      if (mentions.length > 0) {
        // Get mentioned users
        const { data: mentionedUsers } = await supabase
          .from('profiles')
          .select('user_id, display_name')
          .in('display_name', mentions);

        if (mentionedUsers && mentionedUsers.length > 0) {
          // Send notifications to mentioned users
          const { data: authorProfile } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('user_id', authorId)
            .single();

          const authorName = authorProfile?.display_name || 'Someone';

          for (const mentionedUser of mentionedUsers) {
            if (mentionedUser.user_id !== authorId) {
              await NotificationService.createNotification(
                mentionedUser.user_id,
                'mention',
                'You were mentioned',
                `${authorName} mentioned you in a post`,
                { 
                  type: 'mention',
                  postId: postId,
                  authorId: authorId
                }
              );
            }
          }
        }
      }

      // Process hashtags - update hashtag usage counts
      const hashtags = await this.extractHashtags(content);
      if (hashtags.length > 0) {
        for (const hashtag of hashtags) {
          await supabase
            .from('hashtags')
            .upsert(
              { name: hashtag, usage_count: 1 },
              { 
                onConflict: 'name',
                ignoreDuplicates: false
              }
            );
        }
      }
    } catch (error) {
      console.error('Error processing mentions and hashtags:', error);
    }
  }
}
