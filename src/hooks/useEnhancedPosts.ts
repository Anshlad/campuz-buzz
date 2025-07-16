
import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRetryableQuery } from './useRetryableQuery';

export interface PostProfile {
  display_name: string;
  avatar_url?: string;
  major?: string;
  year?: string;
}

export interface PostReaction {
  reaction_type: string;
  count: number;
  hasReacted: boolean;
}

export interface EnhancedPost {
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
  reactions: Record<string, PostReaction>;
  created_at: string;
  profiles?: PostProfile;
  is_saved: boolean;
  hashtags: string[];
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

export const useEnhancedPosts = () => {
  const [posts, setPosts] = useState<EnhancedPost[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const fetchPosts = useCallback(async (): Promise<EnhancedPost[]> => {
    // First fetch basic post data quickly
    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select(`
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
        profiles:user_id (
          display_name,
          avatar_url,
          major,
          year
        )
      `)
      .order('created_at', { ascending: false })
      .limit(20);

    if (postsError) throw postsError;

    // Return basic posts first for immediate display
    const basicPosts = (postsData || []).map(post => ({
      ...post,
      reactions: {
        like: { reaction_type: 'like', count: 0, hasReacted: false },
        love: { reaction_type: 'love', count: 0, hasReacted: false },
        laugh: { reaction_type: 'laugh', count: 0, hasReacted: false },
        wow: { reaction_type: 'wow', count: 0, hasReacted: false },
        sad: { reaction_type: 'sad', count: 0, hasReacted: false },
        angry: { reaction_type: 'angry', count: 0, hasReacted: false }
      },
      is_saved: false,
      hashtags: [],
      profiles: Array.isArray(post.profiles) ? post.profiles[0] : post.profiles,
      likes_count: post.likes_count || 0,
      comments_count: post.comments_count || 0,
      shares_count: post.shares_count || 0,
      saves_count: post.saves_count || 0,
    }));

    // Load additional data in the background (reactions, saves, hashtags)
    setTimeout(async () => {
      try {
        const currentUserId = (await supabase.auth.getUser()).data.user?.id;
        
        const enhancedPosts = await Promise.all(
          basicPosts.map(async (post) => {
            try {
              // Get reactions
              const { data: reactionsData } = await supabase
                .from('post_reactions')
                .select('reaction_type, user_id')
                .eq('post_id', post.id);

              // Get saves
              const { data: savesData } = await supabase
                .from('post_saves')
                .select('user_id')
                .eq('post_id', post.id);

              // Process reactions
              const reactions = { ...post.reactions };
              if (reactionsData) {
                reactionsData.forEach(reaction => {
                  if (reactions[reaction.reaction_type]) {
                    reactions[reaction.reaction_type].count++;
                    if (reaction.user_id === currentUserId) {
                      reactions[reaction.reaction_type].hasReacted = true;
                    }
                  }
                });
              }

              const isSaved = savesData?.some(save => save.user_id === currentUserId) || false;

              return {
                ...post,
                reactions,
                is_saved: isSaved,
              };
            } catch (error) {
              console.warn('Failed to load enhanced data for post:', post.id, error);
              return post; // Return basic post if enhancement fails
            }
          })
        );

        setPosts(enhancedPosts);
      } catch (error) {
        console.warn('Failed to enhance posts:', error);
      }
    }, 100); // Small delay to allow basic posts to render first

    return basicPosts;
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
      if (!user.data.user) {
        toast({
          title: "Authentication required",
          description: "Please log in to create a post.",
          variant: "destructive"
        });
        throw new Error('Not authenticated');
      }

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

      // Optimistically add the new post to the beginning of the list
      const newPost: EnhancedPost = {
        ...data,
        reactions: {
          like: { reaction_type: 'like', count: 0, hasReacted: false },
          love: { reaction_type: 'love', count: 0, hasReacted: false },
          laugh: { reaction_type: 'laugh', count: 0, hasReacted: false },
          wow: { reaction_type: 'wow', count: 0, hasReacted: false },
          sad: { reaction_type: 'sad', count: 0, hasReacted: false },
          angry: { reaction_type: 'angry', count: 0, hasReacted: false }
        },
        is_saved: false,
        hashtags: [],
        profiles: Array.isArray(data.profiles) ? data.profiles[0] : data.profiles,
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

  // Memoize posts to prevent unnecessary re-renders
  const memoizedPosts = useMemo(() => posts, [posts]);

  // Additional optimized methods
  const reactToPost = useCallback(async (postId: string, reactionType: string) => {
    try {
      // Optimistic update
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post.id === postId) {
            const newReactions = { ...post.reactions };
            const currentReaction = newReactions[reactionType];
            
            if (currentReaction.hasReacted) {
              currentReaction.count = Math.max(0, currentReaction.count - 1);
              currentReaction.hasReacted = false;
            } else {
              currentReaction.count += 1;
              currentReaction.hasReacted = true;
            }
            
            return { ...post, reactions: newReactions };
          }
          return post;
        })
      );

      // Actual API call
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Not authenticated');

      const { data: existingReaction } = await supabase
        .from('post_reactions')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.data.user.id)
        .eq('reaction_type', reactionType)
        .maybeSingle();

      if (existingReaction) {
        await supabase
          .from('post_reactions')
          .delete()
          .eq('id', existingReaction.id);
      } else {
        await supabase
          .from('post_reactions')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.data.user.id);

        await supabase
          .from('post_reactions')
          .insert({
            post_id: postId,
            user_id: user.data.user.id,
            reaction_type: reactionType
          });
      }
    } catch (error) {
      console.error('Error reacting to post:', error);
      // Revert optimistic update on error
      retry();
    }
  }, [retry]);

  const savePost = useCallback(async (postId: string) => {
    try {
      // Optimistic update
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { ...post, is_saved: !post.is_saved }
            : post
        )
      );

      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Not authenticated');

      const { data: existingSave } = await supabase
        .from('post_saves')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.data.user.id)
        .maybeSingle();

      if (existingSave) {
        await supabase
          .from('post_saves')
          .delete()
          .eq('id', existingSave.id);
        toast({ title: "Post unsaved" });
      } else {
        await supabase
          .from('post_saves')
          .insert({
            post_id: postId,
            user_id: user.data.user.id
          });
        toast({ title: "Post saved" });
      }
    } catch (error) {
      console.error('Error saving post:', error);
      // Revert optimistic update on error
      retry();
    }
  }, [toast, retry]);

  const sharePost = useCallback(async (postId: string) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Check out this post on CampuzBuzz',
          url: `${window.location.origin}/post/${postId}`
        });
      } else {
        await navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
        toast({ title: "Link copied to clipboard!" });
      }
    } catch (error) {
      console.error('Error sharing post:', error);
      toast({
        title: "Error",
        description: "Failed to share post.",
        variant: "destructive"
      });
    }
  }, [toast]);

  return {
    posts: memoizedPosts,
    loading,
    error,
    createPost,
    reactToPost,
    savePost,
    sharePost,
    refetch: retry,
    isCreating,
  };
};
