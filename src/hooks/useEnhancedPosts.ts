
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  type: 'text' | 'image' | 'video' | 'poll';
  images?: string[];
  location?: string;
  tags?: string[];
  mentions?: string[];
  visibility: 'public' | 'private' | 'community';
}

export const useEnhancedPosts = () => {
  const [posts, setPosts] = useState<EnhancedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPosts = async () => {
    try {
      setLoading(true);
      
      const { data: postsData, error: postsError } = await supabase
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
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      const enhancedPosts = await Promise.all(
        (postsData || []).map(async (post) => {
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

          // Get hashtags
          const { data: hashtagsData } = await supabase
            .from('post_hashtags')
            .select(`
              hashtags (
                name
              )
            `)
            .eq('post_id', post.id);

          // Process reactions
          const reactions: Record<string, PostReaction> = {
            like: { reaction_type: 'like', count: 0, hasReacted: false },
            love: { reaction_type: 'love', count: 0, hasReacted: false },
            laugh: { reaction_type: 'laugh', count: 0, hasReacted: false },
            wow: { reaction_type: 'wow', count: 0, hasReacted: false },
            sad: { reaction_type: 'sad', count: 0, hasReacted: false },
            angry: { reaction_type: 'angry', count: 0, hasReacted: false }
          };

          const currentUserId = (await supabase.auth.getUser()).data.user?.id;

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
          const hashtags = hashtagsData?.map(h => (h.hashtags as any)?.name).filter(Boolean) || [];

          return {
            ...post,
            reactions,
            is_saved: isSaved,
            hashtags,
            profiles: Array.isArray(post.profiles) ? post.profiles[0] : post.profiles
          } as EnhancedPost;
        })
      );

      setPosts(enhancedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error loading posts",
        description: "Please try refreshing the page.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (postData: PostCreationData) => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Not authenticated');

      // Create the post
      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: user.data.user.id,
          title: postData.title,
          content: postData.content,
          image_url: postData.images?.[0], // Use first image for now
          post_type: postData.type,
          tags: postData.tags || [],
          visibility: postData.visibility
        })
        .select()
        .single();

      if (error) throw error;

      // Process hashtags and mentions
      if (postData.tags && postData.tags.length > 0) {
        // Insert hashtags and link them to the post
        for (const tag of postData.tags) {
          // Insert or update hashtag
          const { data: hashtag } = await supabase
            .from('hashtags')
            .upsert(
              { name: tag.toLowerCase() },
              { onConflict: 'name', ignoreDuplicates: false }
            )
            .select()
            .single();

          if (hashtag) {
            // Link hashtag to post
            await supabase
              .from('post_hashtags')
              .insert({
                post_id: data.id,
                hashtag_id: hashtag.id
              });
          }
        }
      }

      // Process mentions
      if (postData.mentions && postData.mentions.length > 0) {
        for (const mention of postData.mentions) {
          // Find user by display name (simplified)
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('user_id')
            .ilike('display_name', mention)
            .single();

          if (userProfile) {
            await supabase
              .from('post_mentions')
              .insert({
                post_id: data.id,
                mentioned_user_id: userProfile.user_id
              });
          }
        }
      }

      toast({
        title: "Post created!",
        description: "Your post has been shared successfully."
      });

      // Refresh posts
      fetchPosts();
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error creating post",
        description: "Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const reactToPost = async (postId: string, reactionType: string) => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Not authenticated');

      // Check if user already reacted with this type
      const { data: existingReaction } = await supabase
        .from('post_reactions')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.data.user.id)
        .eq('reaction_type', reactionType)
        .single();

      if (existingReaction) {
        // Remove reaction
        await supabase
          .from('post_reactions')
          .delete()
          .eq('id', existingReaction.id);
      } else {
        // Remove any existing reactions from this user on this post
        await supabase
          .from('post_reactions')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.data.user.id);

        // Add new reaction
        await supabase
          .from('post_reactions')
          .insert({
            post_id: postId,
            user_id: user.data.user.id,
            reaction_type: reactionType
          });
      }

      fetchPosts();
    } catch (error) {
      console.error('Error reacting to post:', error);
      toast({
        title: "Error",
        description: "Failed to react to post.",
        variant: "destructive"
      });
    }
  };

  const savePost = async (postId: string) => {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) throw new Error('Not authenticated');

      const { data: existingSave } = await supabase
        .from('post_saves')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.data.user.id)
        .single();

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

      fetchPosts();
    } catch (error) {
      console.error('Error saving post:', error);
      toast({
        title: "Error",
        description: "Failed to save post.",
        variant: "destructive"
      });
    }
  };

  const sharePost = async (postId: string) => {
    try {
      toast({ title: "Share feature coming soon!" });
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return {
    posts,
    loading,
    createPost,
    reactToPost,
    savePost,
    sharePost,
    refetch: fetchPosts
  };
};
