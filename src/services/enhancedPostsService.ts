import { supabase } from '@/integrations/supabase/client';
import { PostFilter, Post, DatabasePost, Profile, PostReactions, EnhancedPostData } from '@/types/posts';
import { NotificationService } from '@/services/notificationService';

const PAGE_SIZE = 20;

// Utility function to safely convert JSON to PostReactions
const safeParseReactions = (reactions: any): PostReactions => {
  if (!reactions || typeof reactions !== 'object' || Array.isArray(reactions)) {
    return {};
  }
  
  const result: PostReactions = {};
  for (const [key, value] of Object.entries(reactions)) {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const reaction = value as any;
      result[key] = {
        count: typeof reaction.count === 'number' ? reaction.count : 0,
        users: Array.isArray(reaction.users) ? reaction.users : [],
        hasReacted: typeof reaction.hasReacted === 'boolean' ? reaction.hasReacted : false,
      };
    }
  }
  return result;
};

// Utility function to transform database post to client post
const transformDatabasePostToPost = (post: DatabasePost, profile: Profile | undefined): EnhancedPostData => {
  // Safely parse reactions from database JSON
  const reactions = safeParseReactions(post.reactions);

  return {
    ...post,
    post_type: (post.post_type as 'text' | 'image' | 'video' | 'poll') || 'text',
    visibility: (post.visibility as 'public' | 'friends' | 'private') || 'public',
    hashtags: post.hashtags || [],
    mentions: post.mentions || [],
    reactions,
    author: {
      id: post.user_id,
      display_name: profile?.display_name || 'Anonymous',
      avatar_url: profile?.avatar_url,
      major: profile?.major,
      year: profile?.year,
    },
    is_liked: false,
    is_saved: false,
    user_reaction: undefined,
    likes_count: post.likes_count || 0,
    comments_count: post.comments_count || 0,
    shares_count: post.shares_count || 0,
    saves_count: post.saves_count || 0,
  };
};

export class EnhancedPostsService {
  static async getPosts(filter: PostFilter = {}, page: number = 0): Promise<EnhancedPostData[]> {
    let query = supabase
      .from('posts')
      .select(
        `
        id,
        user_id,
        title,
        content,
        image_url,
        post_type,
        tags,
        likes_count,
        comments_count,
        shares_count,
        saves_count,
        created_at,
        updated_at,
        visibility,
        community_id,
        file_name,
        file_url,
        is_pinned,
        reactions,
        profiles:user_id (
          id,
          display_name,
          avatar_url,
          major,
          year
        )
      `
      )
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (filter.type) {
      query = query.eq('post_type', filter.type);
    }

    if (filter.visibility) {
      query = query.eq('visibility', filter.visibility);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }

    if (!data) {
      return [];
    }

    return data
      .filter((item): item is NonNullable<typeof item> => {
        if (!item || typeof item !== 'object' || !('id' in item)) {
          console.warn('Invalid post data received:', item);
          return false;
        }
        return true;
      })
      .map((validItem) => {
        // Use type assertion to tell TypeScript this is the expected structure
        const rawPost = validItem as any;
        
        // Create a proper DatabasePost object
        const post: DatabasePost = {
          id: rawPost.id,
          user_id: rawPost.user_id,
          title: rawPost.title || undefined,
          content: rawPost.content,
          image_url: rawPost.image_url || undefined,
          post_type: rawPost.post_type,
          tags: rawPost.tags || [],
          likes_count: rawPost.likes_count || 0,
          comments_count: rawPost.comments_count || 0,
          shares_count: rawPost.shares_count || 0,
          saves_count: rawPost.saves_count || 0,
          created_at: rawPost.created_at,
          updated_at: rawPost.updated_at,
          visibility: rawPost.visibility,
          hashtags: [], // Default empty array since column doesn't exist
          mentions: [], // Default empty array since column doesn't exist
          community_id: rawPost.community_id || undefined,
          file_name: rawPost.file_name || undefined,
          file_url: rawPost.file_url || undefined,
          is_pinned: rawPost.is_pinned || false,
          reactions: rawPost.reactions,
          profiles: rawPost.profiles,
        };
        
        // Safely access profiles with null check
        const profile = post.profiles && Array.isArray(post.profiles) 
          ? post.profiles[0] 
          : post.profiles;
        
        return transformDatabasePostToPost(post, profile);
      });
  }

  static async createPost(postData: {
    content: string;
    title?: string;
    post_type: 'text' | 'image' | 'video' | 'poll';
    user_id: string;
    visibility: 'public' | 'friends' | 'private';
    tags?: string[];
    mentions?: string[];
    image_url?: string;
  }): Promise<Post> {
    try {
      const insertData = {
        content: postData.content,
        title: postData.title,
        post_type: postData.post_type,
        user_id: postData.user_id,
        visibility: postData.visibility,
        tags: postData.tags || [],
        mentions: postData.mentions || [],
        image_url: postData.image_url,
        hashtags: [] as string[],
        reactions: {} as Record<string, any>,
        likes_count: 0,
        comments_count: 0,
        shares_count: 0,
        saves_count: 0,
      };

      const { data, error } = await supabase
        .from('posts')
        .insert([insertData])
        .select('*')
        .single();

      if (error) {
        console.error('Error creating post:', error);
        throw error;
      }

      if (!data) {
        throw new Error('No data returned from post creation');
      }

      // Safely parse reactions with proper type checking
      const reactions = safeParseReactions(data.reactions);

      return {
        ...data,
        post_type: data.post_type as 'text' | 'image' | 'video' | 'poll',
        visibility: data.visibility as 'public' | 'friends' | 'private',
        hashtags: (data as any).hashtags || [],
        mentions: (data as any).mentions || [],
        reactions,
      } as Post;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  // Enhanced reaction method with notifications
  static async reactToPost(postId: string, reactionType: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get post details for notification
      const { data: postData } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (display_name, avatar_url)
        `)
        .eq('id', postId)
        .single();

      if (!postData) throw new Error('Post not found');

      // Check if user already reacted with this type
      const { data: existingReaction } = await supabase
        .from('post_reactions')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .eq('reaction_type', reactionType)
        .maybeSingle();

      if (existingReaction) {
        // Remove existing reaction
        await supabase
          .from('post_reactions')
          .delete()
          .eq('id', existingReaction.id);
      } else {
        // Remove any other reactions from this user first
        await supabase
          .from('post_reactions')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        // Add new reaction
        await supabase
          .from('post_reactions')
          .insert({
            post_id: postId,
            user_id: user.id,
            reaction_type: reactionType
          });

        // Send notification to post author (if not reacting to own post)
        if (postData.user_id !== user.id) {
          const profile = Array.isArray(postData.profiles) ? postData.profiles[0] : postData.profiles;
          const userName = profile?.display_name || 'Someone';
          
          const reactionEmoji = this.getReactionEmoji(reactionType);
          await NotificationService.createNotification(
            postData.user_id,
            'like',
            'New Reaction',
            `${userName} reacted ${reactionEmoji} to your post`,
            { 
              type: 'reaction',
              postId: postId,
              reactionType: reactionType,
              reactorId: user.id
            }
          );
        }
      }
    } catch (error) {
      console.error('Error reacting to post:', error);
      throw error;
    }
  }

  // Enhanced comment method with notifications
  static async addComment(postId: string, content: string, parentId?: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get post details for notification
      const { data: postData } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (display_name, avatar_url)
        `)
        .eq('id', postId)
        .single();

      if (!postData) throw new Error('Post not found');

      // Add comment
      const { data: comment } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: content,
          parent_id: parentId
        })
        .select(`
          *,
          profiles:user_id (display_name, avatar_url)
        `)
        .single();

      if (!comment) throw new Error('Failed to create comment');

      // Send notification to post author (if not commenting on own post)
      if (postData.user_id !== user.id) {
        const { data: commenterProfile } = await supabase
          .from('profiles')
          .select('display_name')
          .eq('user_id', user.id)
          .single();

        const commenterName = commenterProfile?.display_name || 'Someone';
        
        await NotificationService.createNotification(
          postData.user_id,
          'comment',
          'New Comment',
          `${commenterName} commented on your post`,
          { 
            type: 'comment',
            postId: postId,
            commentId: comment.id,
            commenterId: user.id
          }
        );
      }

      // Check for mentions in comment content and send notifications
      await this.processMentions(content, user.id, 'comment', { postId, commentId: comment.id });

    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  // Process mentions in content and send notifications
  private static async processMentions(
    content: string, 
    authorId: string, 
    type: 'post' | 'comment', 
    metadata: any
  ): Promise<void> {
    const mentionRegex = /@(\w+)/g;
    const mentions = [];
    let match;

    while ((match = mentionRegex.exec(content)) !== null) {
      mentions.push(match[1]);
    }

    if (mentions.length === 0) return;

    // Get mentioned users
    const { data: mentionedUsers } = await supabase
      .from('profiles')
      .select('user_id, display_name')
      .in('display_name', mentions);

    if (!mentionedUsers || mentionedUsers.length === 0) return;

    // Get author info
    const { data: authorProfile } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('user_id', authorId)
      .single();

    const authorName = authorProfile?.display_name || 'Someone';

    // Send notification to each mentioned user
    for (const mentionedUser of mentionedUsers) {
      if (mentionedUser.user_id !== authorId) { // Don't notify self
        await NotificationService.createNotification(
          mentionedUser.user_id,
          'mention',
          'You were mentioned',
          `${authorName} mentioned you in a ${type}`,
          { 
            type: 'mention',
            mentionType: type,
            authorId: authorId,
            ...metadata
          }
        );
      }
    }
  }

  private static getReactionEmoji(reactionType: string): string {
    const emojiMap: Record<string, string> = {
      like: '👍',
      love: '❤️',
      laugh: '😂',
      wow: '😮',
      sad: '😢',
      angry: '😠'
    };
    return emojiMap[reactionType] || '👍';
  }

  static async savePost(postId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if the post is already saved
      const { data: existingSave } = await supabase
        .from('post_saves')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingSave) {
        // If it's saved, remove the save
        await supabase
          .from('post_saves')
          .delete()
          .eq('id', existingSave.id);
      } else {
        // If it's not saved, add a save
        await supabase
          .from('post_saves')
          .insert({
            post_id: postId,
            user_id: user.id
          });
      }
    } catch (error) {
      console.error('Error saving post:', error);
      throw error;
    }
  }

  static async sharePost(postId: string): Promise<void> {
    try {
      // Sharing logic (can be implemented later)
      console.log(`Post ${postId} shared`);
    } catch (error) {
      console.error('Error sharing post:', error);
      throw error;
    }
  }
}

// Export types and service
export type { PostFilter, EnhancedPostData };
export { EnhancedPostsService as enhancedPostsService };
