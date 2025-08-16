
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
  is_liked?: boolean;
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

      // Handle empty posts case
      if (!postsData || postsData.length === 0) {
        setPosts([]);
        return;
      }

      // Get profiles separately for better performance
      const userIds = [...new Set(postsData.map(p => p.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, avatar_url')
        .in('user_id', userIds);

      const profileMap = new Map(
        (profiles || []).map(p => [p.user_id, p])
      );

      // Get current user's likes
      const { data: { user } } = await supabase.auth.getUser();
      let userLikes: Set<string> = new Set();
      
      if (user) {
        const { data: likesData } = await supabase
          .from('likes')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', postsData.map(p => p.id));
        
        userLikes = new Set((likesData || []).map(like => like.post_id));
      }

      const fastPosts: FastPost[] = postsData.map(post => {
        const profile = profileMap.get(post.user_id);
        return {
          id: post.id,
          user_id: post.user_id,
          content: post.content,
          image_url: post.image_url,
          likes_count: post.likes_count || 0,
          comments_count: post.comments_count || 0,
          created_at: post.created_at,
          is_liked: userLikes.has(post.id),
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
        is_liked: false,
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

  // Handle like toggle
  const toggleLike = useCallback(async (postId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please log in to like posts.",
          variant: "destructive"
        });
        return;
      }

      const currentPost = posts.find(p => p.id === postId);
      if (!currentPost) return;

      const wasLiked = currentPost.is_liked;
      const currentCount = currentPost.likes_count;

      // Optimistic update
      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            is_liked: !wasLiked,
            likes_count: wasLiked ? Math.max(0, currentCount - 1) : currentCount + 1
          };
        }
        return p;
      }));

      if (wasLiked) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
        
        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('likes')
          .insert({
            post_id: postId,
            user_id: user.id
          });
        
        if (error) throw error;
      }

      // Refresh the post to get accurate count from database
      const { data: updatedPost } = await supabase
        .from('posts')
        .select('likes_count')
        .eq('id', postId)
        .single();

      if (updatedPost) {
        setPosts(prev => prev.map(p => {
          if (p.id === postId) {
            return {
              ...p,
              likes_count: updatedPost.likes_count || 0
            };
          }
          return p;
        }));
      }

    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert optimistic update on error
      const originalPost = posts.find(p => p.id === postId);
      if (originalPost) {
        setPosts(prev => prev.map(p => {
          if (p.id === postId) {
            return {
              ...p,
              is_liked: originalPost.is_liked,
              likes_count: originalPost.likes_count
            };
          }
          return p;
        }));
      }
      
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive"
      });
    }
  }, [posts, toast]);

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
    toggleLike,
    retry: fetchPosts
  }), [posts, loading, error, createPost, isCreating, toggleLike, fetchPosts]);

  return value;
};
