
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { EnhancedPostData } from '@/types/posts';
import { safeParseReactions } from '@/services/posts/postTransformers';
import { imageService } from '@/services/imageService';

export interface EnhancedPost extends EnhancedPostData {
  is_liked: boolean;
  is_saved: boolean;
  user_reaction?: string;
}

export const useEnhancedPosts = () => {
  const [posts, setPosts] = useState<EnhancedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const loadPosts = async () => {
    try {
      setLoading(true);
      console.log('Loading posts with images...');
      
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

      if (error) {
        console.error('Error loading posts:', error);
        throw error;
      }

      console.log('Raw posts data:', data);

      const enhancedPosts: EnhancedPost[] = (data || []).map(post => {
        // Validate and log image URLs
        const validImageUrl = imageService.validateImageUrl(post.image_url);
        
        if (post.image_url && !validImageUrl) {
          console.warn('Invalid image URL detected:', post.image_url, 'for post:', post.id);
        } else if (validImageUrl) {
          console.log('Valid image URL for post', post.id, ':', validImageUrl);
        }

        return {
          ...post,
          post_type: post.post_type as 'text' | 'image' | 'video' | 'poll',
          visibility: post.visibility as 'public' | 'friends' | 'private',
          author: Array.isArray(post.profiles) ? post.profiles[0] : post.profiles || {
            id: post.user_id,
            user_id: post.user_id,
            display_name: 'Anonymous User',
            avatar_url: undefined,
            major: undefined,
            year: undefined
          },
          is_liked: false,
          is_saved: false,
          user_reaction: undefined,
          reactions: safeParseReactions(post.reactions),
          hashtags: [],
          mentions: [],
          tags: post.tags || [],
          image_url: validImageUrl, // Use validated URL
          profiles: Array.isArray(post.profiles) ? post.profiles[0] : post.profiles || {
            id: post.user_id,
            user_id: post.user_id,
            display_name: 'Anonymous User',
            avatar_url: undefined,
            major: undefined,
            year: undefined
          }
        };
      });

      console.log('Enhanced posts with validated images:', enhancedPosts);
      setPosts(enhancedPosts);
    } catch (err: any) {
      console.error('Error in loadPosts:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (postData: any) => {
    try {
      setIsCreating(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Validate image URL before creating post
      const validImageUrl = imageService.validateImageUrl(postData.image_url);
      
      if (postData.image_url && !validImageUrl) {
        console.warn('Invalid image URL provided for new post:', postData.image_url);
      }

      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: postData.content,
          title: postData.title,
          post_type: postData.post_type,
          visibility: postData.visibility,
          tags: postData.tags || [],
          image_url: validImageUrl, // Use validated URL
          reactions: {}
        })
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
        .single();

      if (error) throw error;

      const newPost: EnhancedPost = {
        ...data,
        post_type: data.post_type as 'text' | 'image' | 'video' | 'poll',
        visibility: data.visibility as 'public' | 'friends' | 'private',
        author: Array.isArray(data.profiles) ? data.profiles[0] : data.profiles || {
          id: data.user_id,
          user_id: data.user_id,
          display_name: 'Anonymous User',
          avatar_url: undefined,
          major: undefined,
          year: undefined
        },
        is_liked: false,
        is_saved: false,
        user_reaction: undefined,
        reactions: safeParseReactions(data.reactions),
        hashtags: [],
        mentions: [],
        tags: data.tags || [],
        profiles: Array.isArray(data.profiles) ? data.profiles[0] : data.profiles || {
          id: data.user_id,
          user_id: data.user_id,
          display_name: 'Anonymous User',
          avatar_url: undefined,
          major: undefined,
          year: undefined
        }
      };

      setPosts(prev => [newPost, ...prev]);
      return newPost;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsCreating(false);
    }
  };

  const retry = () => {
    setError(null);
    loadPosts();
  };

  useEffect(() => {
    loadPosts();
  }, []);

  return { posts, loading, error, refetch: loadPosts, createPost, isCreating, retry };
};
