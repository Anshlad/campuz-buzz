
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { EnhancedPostsService, type PostFilter } from '@/services/enhancedPostsService';
import { type Post, type EnhancedPostData } from '@/types/posts';

export const useRealTimePosts = (initialFilter: PostFilter = {}) => {
  const [posts, setPosts] = useState<EnhancedPostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState<PostFilter>(initialFilter);
  const { toast } = useToast();

  // Load posts with real-time updates
  const loadPosts = useCallback(async (refresh = false) => {
    try {
      if (refresh) {
        setLoading(true);
        setError(null);
      }

      const data = await EnhancedPostsService.getPosts(filter);
      
      if (refresh) {
        setPosts(data);
      } else {
        setPosts(prev => [...prev, ...data]);
      }
      
      setHasMore(data.length === 20); // Assuming page size of 20
    } catch (err) {
      console.error('Error loading posts:', err);
      setError(err as Error);
      toast({
        title: "Error loading posts",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [filter, toast]);

  // Real-time subscription
  useEffect(() => {
    // Subscribe to new posts
    const channel = supabase
      .channel('posts_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'posts'
        },
        async (payload) => {
          console.log('New post created:', payload);
          // Reload posts to get the new one with proper joins
          await loadPosts(true);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'posts'
        },
        async (payload) => {
          console.log('Post updated:', payload);
          // Update specific post in the list
          setPosts(prev => prev.map(post => 
            post.id === payload.new.id 
              ? { ...post, ...payload.new } as EnhancedPostData
              : post
          ));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadPosts]);

  // Initial load
  useEffect(() => {
    loadPosts(true);
  }, [loadPosts]);

  const updateFilter = useCallback((newFilter: Partial<PostFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
  }, []);

  const refreshPosts = useCallback(() => {
    loadPosts(true);
  }, [loadPosts]);

  const loadMorePosts = useCallback(() => {
    if (!loading && hasMore) {
      loadPosts(false);
    }
  }, [loading, hasMore, loadPosts]);

  // Enhanced post interactions with notifications
  const handlePostReaction = useCallback(async (postId: string, reactionType: string) => {
    try {
      await EnhancedPostsService.reactToPost(postId, reactionType);
      
      // Optimistic update
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          const reactions = { ...post.reactions };
          const reaction = reactions[reactionType];
          
          if (reaction?.hasReacted) {
            reaction.count = Math.max(0, reaction.count - 1);
            reaction.hasReacted = false;
          } else {
            // Remove other reactions first
            Object.values(reactions).forEach(r => {
              if (r.hasReacted) {
                r.count = Math.max(0, r.count - 1);
                r.hasReacted = false;
              }
            });
            
            // Add new reaction
            if (reaction) {
              reaction.count += 1;
              reaction.hasReacted = true;
            } else {
              reactions[reactionType] = {
                count: 1,
                users: [],
                hasReacted: true
              };
            }
          }
          
          return { ...post, reactions };
        }
        return post;
      }));

      toast({
        title: "Reaction updated",
        description: "Your reaction has been recorded."
      });
    } catch (error) {
      console.error('Error reacting to post:', error);
      toast({
        title: "Error",
        description: "Failed to update reaction.",
        variant: "destructive"
      });
    }
  }, [toast]);

  const handlePostSave = useCallback(async (postId: string) => {
    try {
      await EnhancedPostsService.savePost(postId);
      
      // Optimistic update
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, is_saved: !post.is_saved }
          : post
      ));

      toast({
        title: "Post saved",
        description: "Post has been saved to your collection."
      });
    } catch (error) {
      console.error('Error saving post:', error);
      toast({
        title: "Error",
        description: "Failed to save post.",
        variant: "destructive"
      });
    }
  }, [toast]);

  const handlePostShare = useCallback(async (postId: string) => {
    try {
      await EnhancedPostsService.sharePost(postId);
    } catch (error) {
      console.error('Error sharing post:', error);
      toast({
        title: "Error",
        description: "Failed to share post.",
        variant: "destructive"
      });
    }
  }, [toast]);

  const memoizedPosts = useMemo(() => posts, [posts]);

  return {
    posts: memoizedPosts,
    loading,
    error,
    hasMore,
    filter,
    updateFilter,
    refreshPosts,
    loadMorePosts,
    handlePostReaction,
    handlePostSave,
    handlePostShare
  };
};
