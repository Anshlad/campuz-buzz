
import React from 'react';
import { PostCard } from '@/components/posts/PostCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, PenTool } from 'lucide-react';
import { Post } from '@/hooks/usePosts';

interface FeedContentProps {
  posts: Post[];
  loading: boolean;
  onCreatePostClick: () => void;
  onLikePost: (postId: string) => void;
}

export const FeedContent: React.FC<FeedContentProps> = ({
  posts,
  loading,
  onCreatePostClick,
  onLikePost
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Post Card */}
      <Card>
        <CardContent className="p-4">
          <Button 
            variant="outline" 
            className="w-full justify-start text-muted-foreground"
            onClick={onCreatePostClick}
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
            <Button onClick={onCreatePostClick}>
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
              image: post.image_url,
              timestamp: post.created_at,
              likes: post.likes_count,
              comments: post.comments_count,
              tags: post.tags || [],
              isLiked: false // TODO: Check if user liked this post
            }}
            onLike={() => onLikePost(post.id)} 
          />
        ))
      )}
    </div>
  );
};
