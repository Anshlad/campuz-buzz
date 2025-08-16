import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface FastPost {
  id: string;
  user_id: string;
  content: string;
  image_url?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  author: {
    id: string;
    display_name: string;
    avatar_url?: string;
  };
}

interface PostCreationData {
  content: string;
  image_url?: string;
  visibility?: 'public' | 'friends' | 'private';
}

export const useFastPosts = () => {
  const [posts, setPosts] = useState<FastPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  // Optimized fetch with minimal data
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: postsData, error } = await supabase
        .from('posts')
        .select(`
          id,
          user_id,
          content,
          image_url,
          likes_count,
          comments_count,
          created_at
        `)
        .order('created_at', { ascending: false })
        .limit(10); // Start with fewer posts

      if (error) throw error;

      // Get profiles separately for better performance
      const userIds = [...new Set((postsData || []).map(p => p.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', userIds);

      const profileMap = new Map(
        (profiles || []).map(p => [p.user_id, p])
      );

      const fastPosts: FastPost[] = (postsData || []).map(post => {
        const profile = profileMap.get(post.user_id);
        return {
          id: post.id,
          user_id: post.user_id,
          content: post.content,
          image_url: post.image_url,
          likes_count: post.likes_count || 0,
          comments_count: post.comments_count || 0,
          created_at: post.created_at,
          author: {
            id: post.user_id,
            display_name: profile?.display_name || 'Anonymous',
            avatar_url: profile?.avatar_url
          }
        };
      });

      setPosts(fastPosts);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fast post creation
  const createPost = useCallback(async (postData: PostCreationData) => {
    try {
      setIsCreating(true);
      
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Authentication required');

      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: postData.content,
          image_url: postData.image_url,
          post_type: postData.image_url ? 'image' : 'text',
          visibility: postData.visibility || 'public',
          likes_count: 0,
          comments_count: 0,
          shares_count: 0,
          saves_count: 0
        })
        .select(`
          id,
          user_id,
          content,
          image_url,
          likes_count,
          comments_count,
          created_at
        `)
        .single();

      if (error) throw error;

      // Get user profile for the new post
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('user_id', user.id)
        .single();

      const newPost: FastPost = {
        ...data,
        author: {
          id: user.id,
          display_name: profile?.display_name || 'You',
          avatar_url: profile?.avatar_url
        }
      };

      // Optimistic update
      setPosts(prev => [newPost, ...prev]);
      
      toast({
        title: "Post created!",
        description: "Your post has been shared."
      });

    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsCreating(false);
    }
  }, [toast]);

  // Load posts on mount
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Memoize return value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    posts,
    loading,
    error,
    createPost,
    isCreating,
    retry: fetchPosts
  }), [posts, loading, error, createPost, isCreating, fetchPosts]);

  return value;
};