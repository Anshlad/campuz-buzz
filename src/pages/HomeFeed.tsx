
import React, { useState, useEffect } from 'react';
import { PostCard } from '@/components/posts/PostCard';
import { CreatePostModal } from '@/components/posts/CreatePostModal';
import { StudySuggestions } from '@/components/ai/StudySuggestions';
import { TrendingTopics } from '@/components/feed/TrendingTopics';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, PenTool } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Post {
  id: string;
  user_id: string;
  title?: string;
  content: string;
  image_url?: string;
  post_type: string;
  tags?: string[];
  likes_count: number;
  comments_count: number;
  created_at: string;
  profiles?: {
    display_name: string;
    avatar_url?: string;
    major?: string;
    year?: string;
  };
}

const HomeFeed = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
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
        .limit(20);

      if (error) throw error;
      setPosts(data || []);
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

  const handleCreatePost = async (postData: any) => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: user?.id!,
          content: postData.content,
          title: postData.title,
          post_type: postData.type || 'text',
          tags: postData.tags,
          image_url: postData.image
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

      setPosts(prev => [data, ...prev]);
      setShowCreatePost(false);
      
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

  const handleLikePost = async (postId: string) => {
    try {
      // Check if already liked
      const { data: existingLike } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user?.id!)
        .single();

      if (existingLike) {
        // Unlike
        await supabase
          .from('likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user?.id!);

        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, likes_count: post.likes_count - 1 }
            : post
        ));
      } else {
        // Like
        await supabase
          .from('likes')
          .insert({
            post_id: postId,
            user_id: user?.id!
          });

        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, likes_count: post.likes_count + 1 }
            : post
        ));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Campus Buzz Feed</h1>
        <Button onClick={() => setShowCreatePost(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Post
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Feed */}
        <div className="lg:col-span-3 space-y-6">
          {/* Quick Post Card */}
          <Card>
            <CardContent className="p-4">
              <Button 
                variant="outline" 
                className="w-full justify-start text-muted-foreground"
                onClick={() => setShowCreatePost(true)}
              >
                <PenTool className="h-4 w-4 mr-2" />
                What's on your mind?
              </Button>
            </CardContent>
          </Card>

          {/* Posts */}
          {posts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <h3 className="text-lg font-medium mb-2">No posts yet</h3>
                <p className="text-muted-foreground mb-4">
                  Be the first to share something with your campus community!
                </p>
                <Button onClick={() => setShowCreatePost(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Post
                </Button>
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <PostCard 
                key={post.id} 
                post={{
                  id: post.id,
                  author: {
                    name: post.profiles?.display_name || 'Anonymous',
                    avatar: post.profiles?.avatar_url || '',
                    major: post.profiles?.major || '',
                    year: post.profiles?.year || ''
                  },
                  content: post.content,
                  title: post.title,
                  image: post.image_url,
                  timestamp: post.created_at,
                  likes: post.likes_count,
                  comments: post.comments_count,
                  tags: post.tags || [],
                  isLiked: false // TODO: Check if user liked this post
                }}
                onLike={() => handleLikePost(post.id)} 
              />
            ))
          )}
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          <StudySuggestions />
          <TrendingTopics />
        </div>
      </div>

      <CreatePostModal
        open={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        onSubmit={handleCreatePost}
      />
    </div>
  );
};

export default HomeFeed;
