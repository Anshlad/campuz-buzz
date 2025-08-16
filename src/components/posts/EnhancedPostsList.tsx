
import React, { useRef, useCallback } from 'react';
import { EnhancedPostCard } from '@/components/posts/EnhancedPostCard';
import { PostFilter } from '@/components/posts/PostFilter';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { useRealTimePosts } from '@/hooks/useRealTimePosts';
import { PostFilter as PostFilterType } from '@/services/enhancedPostsService';

interface EnhancedPostsListProps {
  initialFilter?: PostFilterType;
  showFilter?: boolean;
  className?: string;
}

export const EnhancedPostsList: React.FC<EnhancedPostsListProps> = ({
  initialFilter = {},
  showFilter = true,
  className = ''
}) => {
  const {
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
  } = useRealTimePosts(initialFilter);

  const observer = useRef<IntersectionObserver>();
  const lastElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMorePosts();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, loadMorePosts]);

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <div className="text-destructive mb-4">
            <h3 className="text-lg font-medium">Error loading posts</h3>
            <p className="text-sm text-muted-foreground">{error.message}</p>
          </div>
          <Button onClick={refreshPosts} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {showFilter && (
        <PostFilter
          filter={filter}
          onFilterChange={updateFilter}
          onClearFilters={() => updateFilter({})}
        />
      )}

      <div className="space-y-6">
        {posts.length === 0 && !loading ? (
          <Card>
            <CardContent className="p-8 text-center">
              <h3 className="text-lg font-medium mb-2">No posts found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your filters or create the first post!
              </p>
              <Button onClick={refreshPosts} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </CardContent>
          </Card>
        ) : (
          posts.map((post, index) => (
            <div
              key={post.id}
              ref={index === posts.length - 1 ? lastElementRef : null}
            >
              <EnhancedPostCard
                post={post}
                onLike={() => handlePostReaction(post.id, 'like')}
                onReact={handlePostReaction}
                onSave={() => handlePostSave(post.id)}
                onShare={() => handlePostShare(post.id)}
              />
            </div>
          ))
        )}

        {loading && (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <div className="flex items-center space-x-4 mt-4">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!hasMore && posts.length > 0 && (
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-sm text-muted-foreground">
                You've reached the end of the posts
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
