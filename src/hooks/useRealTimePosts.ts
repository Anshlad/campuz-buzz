
import { useState, useEffect, useCallback } from 'react';
import { enhancedPostsService } from '@/services/enhancedPostsService';
import { EnhancedPostData, PostFilter } from '@/types/posts';
import { useToast } from '@/hooks/use-toast';

export const useRealTimePosts = (initialFilter: PostFilter = {}) => {
  const [posts, setPosts] = useState<EnhancedPostData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filter, setFilter] = useState<PostFilter>(initialFilter);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const { toast } = useToast();

  const loadPosts = useCallback(async (resetPosts = false) => {
    try {
      setLoading(true);
      setError(null);
      
      const currentPage = resetPosts ? 1 : page;
      const newPosts = await enhancedPostsService.getPosts(filter, currentPage);
      
      if (resetPosts) {
        setPosts(newPosts);
        setPage(2);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
        setPage(prev => prev + 1);
      }
      
      setHasMore(newPosts.length === 20); // Assuming 20 is the limit
    } catch (err) {
      const error = err as Error;
      setError(error);
      toast({
        title: "Error loading posts",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [filter, page, toast]);

  const refreshPosts = useCallback(() => {
    setPage(1);
    loadPosts(true);
  }, [loadPosts]);

  const loadMorePosts = useCallback(() => {
    if (!loading && hasMore) {
      loadPosts(false);
    }
  }, [loading, hasMore, loadPosts]);

  const updateFilter = useCallback((newFilter: Partial<PostFilter>) => {
    setFilter(prev => ({ ...prev, ...newFilter }));
    setPage(1);
  }, []);

  const handlePostUpdate = useCallback((updatedPost: EnhancedPostData) => {
    setPosts(prev => {
      const existingIndex = prev.findIndex(p => p.id === updatedPost.id);
      if (existingIndex >= 0) {
        const newPosts = [...prev];
        newPosts[existingIndex] = updatedPost;
        return newPosts;
      } else {
        // New post, add to beginning
        return [updatedPost, ...prev];
      }
    });
  }, []);

  const handlePostReaction = useCallback(async (postId: string, reactionType: string) => {
    try {
      await enhancedPostsService.reactToPost(postId, reactionType);
      
      // Optimistically update UI
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          const reactions = { ...post.reactions };
          const currentReaction = reactions[reactionType] || { count: 0, users: [] };
          
          if (post.user_reaction === reactionType) {
            // Remove reaction
            currentReaction.count = Math.max(0, currentReaction.count - 1);
            return { ...post, user_reaction: undefined, reactions };
          } else {
            // Add or change reaction
            if (post.user_reaction && reactions[post.user_reaction]) {
              reactions[post.user_reaction].count = Math.max(0, reactions[post.user_reaction].count - 1);
            }
            currentReaction.count += 1;
            return { ...post, user_reaction: reactionType, reactions: { ...reactions, [reactionType]: currentReaction } };
          }
        }
        return post;
      }));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to react to post",
        variant: "destructive"
      });
    }
  }, [toast]);

  const handlePostSave = useCallback(async (postId: string) => {
    try {
      await enhancedPostsService.savePost(postId);
      
      // Optimistically update UI
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, is_saved: !post.is_saved }
          : post
      ));
      
      toast({
        title: "Success",
        description: "Post saved successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save post",
        variant: "destructive"
      });
    }
  }, [toast]);

  const handlePostShare = useCallback(async (postId: string) => {
    try {
      await enhancedPostsService.sharePost(postId);
      
      // Update shares count
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, shares_count: post.shares_count + 1 }
          : post
      ));
      
      if (navigator.share) {
        await navigator.share({
          title: 'Check out this post',
          url: `${window.location.origin}/post/${postId}`
        });
      } else {
        await navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
        toast({
          title: "Success",
          description: "Link copied to clipboard"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share post",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Set up real-time subscriptions
  useEffect(() => {
    const unsubscribe = enhancedPostsService.subscribeToPostUpdates(handlePostUpdate);
    return () => {
      unsubscribe();
    };
  }, [handlePostUpdate]);

  // Load initial posts
  useEffect(() => {
    refreshPosts();
  }, [filter]);

  return {
    posts,
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
