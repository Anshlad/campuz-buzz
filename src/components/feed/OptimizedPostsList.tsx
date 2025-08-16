
import React, { memo, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { OptimizedImage } from '@/components/common/OptimizedImage';
import { useInfinitePagination } from '@/hooks/useInfinitePagination';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { analyticsService } from '@/services/analyticsService';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import { format } from 'date-fns';

interface Post {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  likes_count: number;
  comments_count: number;
  profiles: {
    display_name: string;
    avatar_url?: string;
  };
}

// Memoized post card component
const PostCard = memo(({ post }: { post: Post }) => {
  const handleLike = async () => {
    await analyticsService.trackPostLiked(post.id);
    // Like logic here
  };

  const handleComment = () => {
    analyticsService.trackEvent('comment_opened', { post_id: post.id });
  };

  const handleShare = () => {
    analyticsService.trackEvent('post_shared', { post_id: post.id });
  };

  const handleSave = () => {
    analyticsService.trackEvent('post_saved', { post_id: post.id });
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        {/* Author info */}
        <div className="flex items-center space-x-3 mb-4">
          <OptimizedImage
            src={post.profiles.avatar_url || '/placeholder.svg'}
            alt={post.profiles.display_name}
            className="w-10 h-10 rounded-full"
            placeholder="/placeholder.svg"
          />
          <div>
            <h3 className="font-medium text-foreground">
              {post.profiles.display_name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {format(new Date(post.created_at), 'MMM d, h:mm a')}
            </p>
          </div>
        </div>

        {/* Post content */}
        <div className="mb-4">
          <p className="text-foreground whitespace-pre-wrap">{post.content}</p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between border-t pt-4">
          <div className="flex items-center space-x-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLike}
              className="text-muted-foreground hover:text-red-500"
            >
              <Heart className="h-4 w-4 mr-1" />
              {post.likes_count}
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleComment}
              className="text-muted-foreground hover:text-blue-500"
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              {post.comments_count}
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleShare}
              className="text-muted-foreground hover:text-primary"
            >
              <Share2 className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSave}
              className="text-muted-foreground hover:text-primary"
            >
              <Bookmark className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

PostCard.displayName = 'PostCard';

// Loading skeleton component
const PostSkeleton = memo(() => (
  <Card className="mb-6">
    <CardContent className="p-6">
      <div className="flex items-center space-x-3 mb-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="flex items-center space-x-4 pt-4 border-t">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
      </div>
    </CardContent>
  </Card>
));

PostSkeleton.displayName = 'PostSkeleton';

interface OptimizedPostsListProps {
  className?: string;
}

export const OptimizedPostsList: React.FC<OptimizedPostsListProps> = ({ className }) => {
  usePerformanceMonitor('OptimizedPostsList');

  // Memoized fetch function
  const fetchPosts = useMemo(() => async (page: number, limit: number): Promise<Post[]> => {
    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (postsError) throw postsError;

    if (!postsData || postsData.length === 0) {
      return [];
    }

    // Get unique user IDs
    const userIds = [...new Set(postsData.map(post => post.user_id))];

    // Get profiles
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, display_name, avatar_url')
      .in('user_id', userIds);

    if (profilesError) throw profilesError;

    // Create profiles map
    const profilesMap = new Map();
    if (profilesData) {
      profilesData.forEach(profile => {
        profilesMap.set(profile.user_id, profile);
      });
    }

    // Combine data
    return postsData
      .map(post => {
        const profile = profilesMap.get(post.user_id);
        if (!profile) return null;

        return {
          id: post.id,
          content: post.content,
          created_at: post.created_at,
          user_id: post.user_id,
          likes_count: post.likes_count || 0,
          comments_count: post.comments_count || 0,
          profiles: {
            display_name: profile.display_name || 'Anonymous',
            avatar_url: profile.avatar_url
          }
        };
      })
      .filter(post => post !== null) as Post[];
  }, []);

  const {
    data: posts,
    loading,
    error,
    hasMore,
    sentryRef,
    refresh
  } = useInfinitePagination({
    fetchFunction: fetchPosts,
    initialLimit: 10,
    threshold: 0.3
  });

  // Track page view
  React.useEffect(() => {
    analyticsService.trackPageView('posts_feed');
  }, []);

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-destructive mb-4">Failed to load posts</p>
        <Button onClick={refresh} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Posts list */}
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}

      {/* Loading skeletons */}
      {loading && (
        <div>
          {Array.from({ length: 3 }).map((_, i) => (
            <PostSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Intersection observer target */}
      {hasMore && (
        <div ref={sentryRef} className="h-10 flex items-center justify-center">
          {loading && <span className="text-muted-foreground text-sm">Loading more posts...</span>}
        </div>
      )}

      {/* End of feed */}
      {!hasMore && posts.length > 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">You've reached the end of the feed</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && posts.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">No posts yet</h3>
          <p className="text-muted-foreground">Be the first to share something!</p>
        </div>
      )}
    </div>
  );
};
