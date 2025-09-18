import { supabase } from '@/integrations/supabase/client';

export interface PostData {
  id: string;
  author_id: string;
  content: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
  author: {
    id: string;
    username: string;
    display_name: string;
    avatar: string;
  };
  likes: number;
  comments: number;
  is_liked: boolean;
}

export interface CommentData {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  author: {
    id: string;
    username: string;
    display_name: string;
    avatar: string;
  };
}

export class PostsService {
  static async getPosts(limit = 20, offset = 0): Promise<PostData[]> {
    const user = await supabase.auth.getUser();
    const userId = user.data.user?.id;

    const { data: posts, error } = await supabase
      .from('posts')
      .select(`
        id,
        user_id,
        content,
        image_url,
        created_at,
        updated_at,
        likes_count,
        comments_count,
        profiles:user_id (
          id,
          username,
          display_name,
          avatar
        ),
        user_likes:likes!left(user_id)
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }

    return posts?.map(post => ({
      id: post.id,
      author_id: post.user_id,
      content: post.content,
      image_url: post.image_url,
      created_at: post.created_at,
      updated_at: post.updated_at,
      author: {
        id: post.profiles?.id || post.user_id,
        username: post.profiles?.username || 'unknown',
        display_name: post.profiles?.display_name || 'Unknown User',
        avatar: post.profiles?.avatar || ''
      },
      likes: post.likes_count || 0,
      comments: post.comments_count || 0,
      is_liked: post.user_likes?.some((like: any) => like.user_id === userId) || false
    })) || [];
  }

  static async likePost(postId: string): Promise<void> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('likes')
      .insert({
        user_id: user.data.user.id,
        post_id: postId
      });

    if (error && error.code !== '23505') { // Ignore duplicate key error
      console.error('Error liking post:', error);
      throw error;
    }
  }

  static async unlikePost(postId: string): Promise<void> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('likes')
      .delete()
      .eq('user_id', user.data.user.id)
      .eq('post_id', postId);

    if (error) {
      console.error('Error unliking post:', error);
      throw error;
    }
  }

  static async getComments(postId: string): Promise<CommentData[]> {
    const { data: comments, error } = await supabase
      .from('comments')
      .select(`
        id,
        post_id,
        user_id,
        content,
        created_at,
        updated_at
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching comments:', error);
      throw error;
    }

    if (!comments) return [];

    // Fetch profiles separately
    const userIds = [...new Set(comments.map(c => c.user_id))];
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, username, display_name, avatar')
      .in('user_id', userIds);

    const profilesMap = new Map();
    profiles?.forEach(profile => {
      profilesMap.set(profile.user_id, profile);
    });

    return comments.map(comment => ({
      id: comment.id,
      post_id: comment.post_id,
      author_id: comment.user_id,
      content: comment.content,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
      author: {
        id: comment.user_id,
        username: profilesMap.get(comment.user_id)?.username || 'unknown',
        display_name: profilesMap.get(comment.user_id)?.display_name || 'Unknown User',
        avatar: profilesMap.get(comment.user_id)?.avatar || ''
      }
    }));
  }

  static async addComment(postId: string, content: string): Promise<void> {
    const user = await supabase.auth.getUser();
    if (!user.data.user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        user_id: user.data.user.id,
        content
      });

    if (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }
}