
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { EnhancedPostData } from '@/types/posts';
import { safeParseReactions } from '@/services/posts/postTransformers';

export interface EnhancedPost extends EnhancedPostData {
  is_liked: boolean;
  is_saved: boolean;
  user_reaction?: string;
}

export const useEnhancedPosts = () => {
  const [posts, setPosts] = useState<EnhancedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            id,
            user_id,
            display_name,
            avatar_url,
            major,
            year
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const enhancedPosts: EnhancedPost[] = (data || []).map(post => ({
        ...post,
        post_type: post.post_type as 'text' | 'image' | 'video' | 'poll',
        visibility: post.visibility as 'public' | 'friends' | 'private',
        author: Array.isArray(post.profiles) ? post.profiles[0] : post.profiles || {
          id: post.user_id,
          display_name: 'Anonymous User',
          avatar_url: undefined,
          major: undefined,
          year: undefined
        },
        is_liked: false,
        is_saved: false,
        user_reaction: undefined,
        reactions: safeParseReactions(post.reactions),
        hashtags: post.hashtags || [],
        mentions: post.mentions || [],
        tags: post.tags || []
      }));

      setPosts(enhancedPosts);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  return { posts, loading, error, refetch: loadPosts };
};
