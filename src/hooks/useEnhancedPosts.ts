
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PostProfile {
  display_name: string;
  avatar_url?: string;
  major?: string;
  year?: string;
}

interface PostReaction {
  reaction_type: string;
  count: number;
  hasReacted: boolean;
}

interface EnhancedPost {
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

export const useEnhancedPosts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<EnhancedPost[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
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
          reactions,
          created_at,
          profiles!posts_user_id_fkey (
            display_name,
            avatar_url,
            major,
            year
          ),
          post_hashtags!inner (
            hashtags!inner (name)
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      
      // Transform and enrich posts data
      const enrichedPosts: EnhancedPost[] = await Promise.all((data || []).map(async (post: any) => {
        // Check if user has saved this post
        let is_saved = false;
        if (user) {
          const { data: saveData } = await supabase
            .from('post_saves')
            .select('id')
            .eq('post_id', post.id)
            .eq('user_id', user.id)
            .single();
          is_saved = !!saveData;
        }

        // Process reactions
        const reactions: Record<string, PostReaction> = {};
        if (post.reactions) {
          for (const [type, userIds] of Object.entries(post.reactions)) {
            reactions[type] = {
              reaction_type: type,
              count: (userIds as string[]).length,
              hasReacted: user ? (userIds as string[]).includes(user.id) : false
            };
          }
        }

        // Extract hashtags
        const hashtags = post.post_hashtags?.map((ph: any) => ph.hashtags.name) || [];

        return {
          id: post.id,
          user_id: post.user_id,
          title: post.title,
          content: post.content,
          image_url: post.image_url,
          post_type: post.post_type,
          tags: post.tags,
          likes_count: post.likes_count || 0,
          comments_count: post.comments_count || 0,
          shares_count: post.shares_count || 0,
          saves_count: post.saves_count || 0,
          reactions,
          created_at: post.created_at,
          profiles: post.profiles,
          is_saved,
          hashtags
        };
      }));
      
      setPosts(enrichedPosts);
    } catch (error) {
      console.error('Error loading posts:', error);
      toast({
        title: "Error loading posts",
        description: "Please try refreshing the page.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (postData: {
    content: string;
    title?: string;
    image?: string;
    tags?: string[];
    type?: string;
  }) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: postData.content,
          title: postData.title,
          post_type: postData.type || 'text',
          tags: postData.tags,
          image_url: postData.image
        })
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
          reactions,
          created_at,
          profiles!posts_user_id_fkey (
            display_name,
            avatar_url,
            major,
            year
          )
        `)
        .single();

      if (error) throw error;

      const newPost: EnhancedPost = {
        ...data,
        reactions: {},
        is_saved: false,
        hashtags: []
      };

      setPosts(prev => [newPost, ...prev]);
      
      toast({
        title: "Post created!",
        description: "Your post has been shared successfully."
      });
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error creating post",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const reactToPost = async (postId: string, reactionType: string) => {
    if (!user) return;

    try {
      // Check if user already reacted with this type
      const { data: existingReaction } = await supabase
        .from('post_reactions')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .eq('reaction_type', reactionType)
        .single();

      if (existingReaction) {
        // Remove reaction
        await supabase
          .from('post_reactions')
          .delete()
          .eq('id', existingReaction.id);
      } else {
        // Add reaction
        await supabase
          .from('post_reactions')
          .insert({
            post_id: postId,
            user_id: user.id,
            reaction_type: reactionType
          });
      }

      // Refresh posts to get updated reactions
      loadPosts();
    } catch (error) {
      console.error('Error reacting to post:', error);
    }
  };

  const savePost = async (postId: string) => {
    if (!user) return;

    try {
      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (post.is_saved) {
        // Unsave post
        await supabase
          .from('post_saves')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
      } else {
        // Save post
        await supabase
          .from('post_saves')
          .insert({
            post_id: postId,
            user_id: user.id
          });
      }

      // Update local state
      setPosts(prev => prev.map(p => 
        p.id === postId 
          ? { ...p, is_saved: !p.is_saved, saves_count: p.saves_count + (p.is_saved ? -1 : 1) }
          : p
      ));
    } catch (error) {
      console.error('Error saving post:', error);
    }
  };

  const sharePost = async (postId: string) => {
    try {
      await supabase
        .from('posts')
        .update({ shares_count: posts.find(p => p.id === postId)?.shares_count + 1 || 1 })
        .eq('id', postId);

      setPosts(prev => prev.map(p => 
        p.id === postId ? { ...p, shares_count: p.shares_count + 1 } : p
      ));

      toast({
        title: "Post shared!",
        description: "Post has been shared successfully."
      });
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  return {
    posts,
    loading,
    createPost,
    reactToPost,
    savePost,
    sharePost,
    refetch: loadPosts
  };
};
