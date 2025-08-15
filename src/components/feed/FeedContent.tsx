
import React from 'react';
import { EnhancedPostCard } from '@/components/posts/EnhancedPostCard';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { EnhancedPost } from '@/hooks/useEnhancedPosts';
import { Loader2 } from 'lucide-react';

interface FeedContentProps {
  posts: EnhancedPost[];
  loading: boolean;
  onLike: (postId: string) => void;
  onSave: (postId: string) => void;
  onShare: (postId: string) => void;
}

export const FeedContent: React.FC<FeedContentProps> = ({
  posts,
  loading,
  onLike,
  onSave,
  onShare
}) => {
  if (loading) {
    return (
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
    );
  }

  if (posts.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-muted-foreground">
            <h3 className="text-lg font-medium mb-2">No posts yet</h3>
            <p>Be the first to share something with the community!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <EnhancedPostCard
          key={post.id}
          post={post}
          onLike={() => onLike(post.id)}
          onSave={() => onSave(post.id)}
          onShare={() => onShare(post.id)}
        />
      ))}
    </div>
  );
};

export default FeedContent;
