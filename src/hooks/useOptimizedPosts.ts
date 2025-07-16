import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useRetryableQuery } from './useRetryableQuery';
import { useToast } from '@/hooks/use-toast';

export interface OptimizedPost {
  id: string;
  user_id: string;
  title?: string;
  content: string;
  image_url?: string;
  post_type: string;
  tags?: string[];
  likes_count: number;
  comments_count: number;
  shares_count: number;
  saves_count: number;
  created_at: string;
  profiles?: {
    display_name: string;
    avatar_url?: string;
    major?: string;
    year?: string;
  };
  is_saved: boolean;
  hashtags: string[];
  reactions: Record<string, {
    reaction_type: string;
    count: number;
    hasReacted: boolean;
  }>;
}

interface PostCreationData {
  content: string;
  title?: string;
  post_type: 'text' | 'image' | 'video' | 'poll';
  images?: any[];
  location?: string;
  tags?: string[];
  mentions?: string[];
  visibility: 'public' | 'private' | 'community';
}

export const useOptimizedPosts = () => {
  const [posts, setPosts] = useState<OptimizedPost[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const fetchPosts = useCallback(async (): Promise<OptimizedPost[]> => {
    const { data: postsData, error } = await supabase
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
      .limit(20); // Limit initial load for performance

    if (error) throw error;

    const currentUserId = (await supabase.auth.getUser()).data.user?.id;
    
    return (postsData || []).map(post => ({
      ...post,
      profiles: Array.isArray(post.profiles) ? post.profiles[0] : post.profiles,
      is_saved: false, // TODO: Optimize this query
      hashtags: [], // TODO: Optimize this query
      likes_count: post.likes_count || 0,
      comments_count: post.comments_count || 0,
      shares_count: post.shares_count || 0,
      saves_count: post.saves_count || 0,
    }));
  }, []);

  const { 
    data: fetchedPosts, 
    loading, 
    error, 
    retry 
  } = useRetryableQuery({
    queryFn: fetchPosts,
    retryAttempts: 3,
    retryDelay: 1000,
  });

  useEffect(() => {
    if (fetchedPosts) {
      setPosts(fetchedPosts);
    }
  }, [fetchedPosts]);

  const createPost = useCallback(async (postData: PostCreationData) => {
    try {
      setIsCreating(true);
      
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Not authenticated');

      let imageUrl = null;
      let postType = postData.post_type || 'text';
      
      if (postData.images && postData.images.length > 0) {
        imageUrl = postData.images[0].url || postData.images[0];
        postType = 'image';
      }

      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: user.data.user.id,
          title: postData.title,
          content: postData.content,
          image_url: imageUrl,
          post_type: postType,
          tags: postData.tags || [],
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

      // Optimistically update the posts list
      const newPost: OptimizedPost = {
        ...data,
        profiles: Array.isArray(data.profiles) ? data.profiles[0] : data.profiles,
        is_saved: false,
        hashtags: [],
        likes_count: 0,
        comments_count: 0,
        shares_count: 0,
        saves_count: 0,
      };

      setPosts(prevPosts => [newPost, ...prevPosts]);
      
      toast({
        title: "Post created!",
        description: "Your post has been shared successfully."
      });

    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error creating post",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsCreating(false);
    }
  }, [toast]);

  const memoizedPosts = useMemo(() => posts, [posts]);

  return {
    posts: memoizedPosts,
    loading,
    error,
    retry,
    createPost,
    isCreating,
  };
};
