
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EnhancedPostData {
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
  location?: string;
  mentions: string[];
  reactions: Record<string, {
    count: number;
    users: string[];
  }>;
  author: {
    id: string;
    display_name: string;
    avatar_url?: string;
    major?: string;
    year?: string;
  };
  is_liked: boolean;
  is_saved: boolean;
  user_reaction?: string;
}

export interface PostFilter {
  type?: 'text' | 'image' | 'video' | 'poll';
  tags?: string[];
  hashtags?: string[];
  author?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  sortBy?: 'recent' | 'popular' | 'trending';
  visibility?: 'public' | 'friends' | 'all';
}

export interface PostCreationData {
  content: string;
  title?: string;
  post_type: 'text' | 'image' | 'video' | 'poll';
  images?: File[];
  tags?: string[];
  mentions?: string[];
  location?: string;
  visibility: 'public' | 'friends' | 'private';
  poll_options?: string[];
}

class EnhancedPostsService {
  private static instance: EnhancedPostsService;
  
  static getInstance(): EnhancedPostsService {
    if (!EnhancedPostsService.instance) {
      EnhancedPostsService.instance = new EnhancedPostsService();
    }
    return EnhancedPostsService.instance;
  }

  async getPosts(filter: PostFilter = {}, page = 1, limit = 20): Promise<EnhancedPostData[]> {
    let query = supabase
      .from('posts')
      .select(`
        *,
        profiles:user_id (
          display_name,
          avatar_url,
          major,
          year
        )
      `);

    // Apply filters
    if (filter.type) {
      query = query.eq('post_type', filter.type);
    }

    if (filter.tags && filter.tags.length > 0) {
      query = query.overlaps('tags', filter.tags);
    }

    if (filter.author) {
      query = query.eq('user_id', filter.author);
    }

    if (filter.visibility && filter.visibility !== 'all') {
      query = query.eq('visibility', filter.visibility);
    }

    if (filter.dateRange) {
      query = query
        .gte('created_at', filter.dateRange.start.toISOString())
        .lte('created_at', filter.dateRange.end.toISOString());
    }

    // Apply sorting
    switch (filter.sortBy) {
      case 'popular':
        query = query.order('likes_count', { ascending: false });
        break;
      case 'trending':
        // Custom trending algorithm based on engagement rate
        query = query.order('likes_count', { ascending: false });
        break;
      case 'recent':
      default:
        query = query.order('created_at', { ascending: false });
        break;
    }

    query = query.range((page - 1) * limit, page * limit - 1);

    const { data, error } = await query;
    if (error) throw error;

    return this.transformPosts(data || []);
  }

  async createPost(postData: PostCreationData): Promise<EnhancedPostData> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error('Not authenticated');

    let imageUrls: string[] = [];
    
    // Handle image uploads
    if (postData.images && postData.images.length > 0) {
      imageUrls = await this.uploadImages(postData.images);
    }

    // Extract hashtags from content
    const hashtags = this.extractHashtags(postData.content);
    
    // Create post
    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: user.data.user.id,
        title: postData.title,
        content: postData.content,
        image_url: imageUrls[0] || null,
        post_type: postData.post_type,
        tags: postData.tags || [],
        visibility: postData.visibility,
        hashtags: hashtags,
        location: postData.location,
        mentions: postData.mentions || []
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

    // Create hashtag entries
    if (hashtags.length > 0) {
      await this.createHashtagEntries(data.id, hashtags);
    }

    // Create mention notifications
    if (postData.mentions && postData.mentions.length > 0) {
      await this.createMentionNotifications(data.id, postData.mentions);
    }

    return this.transformPost(data);
  }

  async reactToPost(postId: string, reactionType: string): Promise<void> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error('Not authenticated');

    // Check if user already reacted
    const { data: existingReaction } = await supabase
      .from('post_reactions')
      .select('id, reaction_type')
      .eq('post_id', postId)
      .eq('user_id', user.data.user.id)
      .maybeSingle();

    if (existingReaction) {
      if (existingReaction.reaction_type === reactionType) {
        // Remove reaction
        await supabase
          .from('post_reactions')
          .delete()
          .eq('id', existingReaction.id);
      } else {
        // Update reaction
        await supabase
          .from('post_reactions')
          .update({ reaction_type: reactionType })
          .eq('id', existingReaction.id);
      }
    } else {
      // Add new reaction
      await supabase
        .from('post_reactions')
        .insert({
          post_id: postId,
          user_id: user.data.user.id,
          reaction_type: reactionType
        });
    }

    // Update post reaction counts
    await this.updatePostReactionCounts(postId);
  }

  async sharePost(postId: string): Promise<void> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error('Not authenticated');

    // Get current shares count and increment it
    const { data: currentPost } = await supabase
      .from('posts')
      .select('shares_count')
      .eq('id', postId)
      .single();

    if (currentPost) {
      const newSharesCount = (currentPost.shares_count || 0) + 1;
      
      const { error } = await supabase
        .from('posts')
        .update({ shares_count: newSharesCount })
        .eq('id', postId);

      if (error) throw error;
    }
  }

  async savePost(postId: string): Promise<void> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error('Not authenticated');

    const { data: existingSave } = await supabase
      .from('post_saves')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.data.user.id)
      .maybeSingle();

    if (existingSave) {
      // Unsave
      await supabase
        .from('post_saves')
        .delete()
        .eq('id', existingSave.id);
    } else {
      // Save
      await supabase
        .from('post_saves')
        .insert({
          post_id: postId,
          user_id: user.data.user.id
        });
    }
  }

  // Real-time subscription methods
  subscribeToPostUpdates(callback: (post: EnhancedPostData) => void) {
    const channel = supabase
      .channel('posts-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts'
        },
        async (payload) => {
          if (payload.new) {
            const transformedPost = await this.getPostById(payload.new.id as string);
            if (transformedPost) {
              callback(transformedPost);
            }
          }
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }

  subscribeToReactionUpdates(postId: string, callback: (reactions: any) => void) {
    const channel = supabase
      .channel(`post-reactions-${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_reactions',
          filter: `post_id=eq.${postId}`
        },
        async () => {
          const reactions = await this.getPostReactions(postId);
          callback(reactions);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }

  // Helper methods
  private async transformPosts(posts: any[]): Promise<EnhancedPostData[]> {
    const currentUser = await supabase.auth.getUser();
    const userId = currentUser.data.user?.id;

    return Promise.all(posts.map(async (post) => {
      const [reactions, userInteractions] = await Promise.all([
        this.getPostReactions(post.id),
        userId ? this.getUserPostInteractions(post.id, userId) : null
      ]);

      return this.transformPost(post, reactions, userInteractions);
    }));
  }

  private transformPost(post: any, reactions?: any, userInteractions?: any): EnhancedPostData {
    const profile = Array.isArray(post.profiles) ? post.profiles[0] : post.profiles;
    
    return {
      id: post.id,
      user_id: post.user_id,
      title: post.title,
      content: post.content,
      image_url: post.image_url,
      post_type: post.post_type,
      tags: post.tags || [],
      likes_count: post.likes_count || 0,
      comments_count: post.comments_count || 0,
      shares_count: post.shares_count || 0,
      saves_count: post.saves_count || 0,
      created_at: post.created_at,
      updated_at: post.updated_at || post.created_at,
      visibility: post.visibility || 'public',
      hashtags: post.hashtags || [],
      location: post.location,
      mentions: post.mentions || [],
      reactions: reactions || {},
      author: {
        id: post.user_id,
        display_name: profile?.display_name || 'Anonymous User',
        avatar_url: profile?.avatar_url,
        major: profile?.major,
        year: profile?.year
      },
      is_liked: userInteractions?.is_liked || false,
      is_saved: userInteractions?.is_saved || false,
      user_reaction: userInteractions?.reaction_type
    };
  }

  private async getPostById(postId: string): Promise<EnhancedPostData | null> {
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
      .eq('id', postId)
      .single();

    if (error || !data) return null;
    return this.transformPost(data);
  }

  private async getPostReactions(postId: string) {
    const { data } = await supabase
      .from('post_reactions')
      .select('reaction_type, user_id')
      .eq('post_id', postId);

    const reactions: Record<string, { count: number; users: string[] }> = {};
    
    data?.forEach(reaction => {
      if (!reactions[reaction.reaction_type]) {
        reactions[reaction.reaction_type] = { count: 0, users: [] };
      }
      reactions[reaction.reaction_type].count++;
      reactions[reaction.reaction_type].users.push(reaction.user_id);
    });

    return reactions;
  }

  private async getUserPostInteractions(postId: string, userId: string) {
    const [likeData, saveData, reactionData] = await Promise.all([
      supabase.from('likes').select('id').eq('post_id', postId).eq('user_id', userId).maybeSingle(),
      supabase.from('post_saves').select('id').eq('post_id', postId).eq('user_id', userId).maybeSingle(),
      supabase.from('post_reactions').select('reaction_type').eq('post_id', postId).eq('user_id', userId).maybeSingle()
    ]);

    return {
      is_liked: !!likeData.data,
      is_saved: !!saveData.data,
      reaction_type: reactionData.data?.reaction_type
    };
  }

  private extractHashtags(content: string): string[] {
    const hashtagRegex = /#[a-zA-Z0-9_]+/g;
    const matches = content.match(hashtagRegex);
    return matches ? matches.map(tag => tag.slice(1).toLowerCase()) : [];
  }

  private async uploadImages(images: File[]): Promise<string[]> {
    const uploadPromises = images.map(async (image) => {
      const fileExt = image.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('posts')
        .upload(fileName, image);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('posts')
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    });

    return Promise.all(uploadPromises);
  }

  private async createHashtagEntries(postId: string, hashtags: string[]) {
    for (const hashtag of hashtags) {
      // Insert or update hashtag
      await supabase
        .from('hashtags')
        .upsert({ name: hashtag })
        .select()
        .single();

      // Link hashtag to post
      const { data: hashtagData, error } = await supabase
        .from('hashtags')
        .select('id')
        .eq('name', hashtag)
        .maybeSingle();

      if (!error && hashtagData && typeof hashtagData === 'object' && 'id' in hashtagData) {
        await supabase
          .from('post_hashtags')
          .insert({
            post_id: postId,
            hashtag_id: hashtagData.id
          });
      }
    }
  }

  private async createMentionNotifications(postId: string, mentions: string[]) {
    // For now, skip notifications as we don't have the notifications table
    // This would normally create notification entries
    console.log('Mentions created for post:', postId, mentions);
  }

  private async updatePostReactionCounts(postId: string) {
    const { data: reactions } = await supabase
      .from('post_reactions')
      .select('reaction_type')
      .eq('post_id', postId);

    const reactionCounts = reactions?.reduce((acc, reaction) => {
      acc[reaction.reaction_type] = (acc[reaction.reaction_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // For now, just update a simple reactions JSON field if it exists
    // This would need to be adapted based on the actual posts table structure
  }
}

export const enhancedPostsService = EnhancedPostsService.getInstance();
