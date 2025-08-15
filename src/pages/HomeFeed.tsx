
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { FeedContent } from '@/components/feed/FeedContent';
import { ProfileSidebar } from '@/components/feed/ProfileSidebar';
import { TrendingSidebar } from '@/components/feed/TrendingSidebar';
import { useEnhancedPosts } from '@/hooks/useEnhancedPosts';
import { CreatePostModal } from '@/components/posts/CreatePostModal';
import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const HomeFeed = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showCreatePost, setShowCreatePost] = useState(false);
  const { 
    posts, 
    loading, 
    error, 
    createPost, 
    reactToPost, 
    savePost, 
    sharePost,
    isCreating 
  } = useEnhancedPosts();

  const handleCreatePost = async (postData: any) => {
    try {
      await createPost(postData);
      setShowCreatePost(false);
    } catch (error) {
      console.error('Failed to create post:', error);
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      await reactToPost(postId, 'like');
    } catch (error) {
      console.error('Failed to like post:', error);
      toast({
        title: "Error",
        description: "Failed to like post. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSavePost = async (postId: string) => {
    try {
      await savePost(postId);
    } catch (error) {
      console.error('Failed to save post:', error);
      toast({
        title: "Error",
        description: "Failed to save post. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSharePost = async (postId: string) => {
    try {
      await sharePost(postId);
    } catch (error) {
      console.error('Failed to share post:', error);
      toast({
        title: "Error",
        description: "Failed to share post. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Error loading feed</h1>
            <p className="text-muted-foreground mb-4">{error.message}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            <ProfileSidebar />
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-6">
            <div className="space-y-6">
              {/* Create Post Button */}
              <div className="bg-card rounded-lg border p-4">
                <Button 
                  onClick={() => setShowCreatePost(true)}
                  className="w-full"
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  What's on your mind?
                </Button>
              </div>

              {/* Feed Content */}
              <FeedContent 
                posts={posts}
                loading={loading}
                onLike={handleLikePost}
                onSave={handleSavePost}
                onShare={handleSharePost}
              />
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            <TrendingSidebar />
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        open={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        onSubmit={handleCreatePost}
      />
    </div>
  );
};

export default HomeFeed;
