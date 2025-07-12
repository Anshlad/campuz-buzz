
import React, { useState } from 'react';
import { CreatePostModal } from '@/components/posts/CreatePostModal';
import { FeedContent } from '@/components/feed/FeedContent';
import { FeedSidebar } from '@/components/feed/FeedSidebar';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { usePosts } from '@/hooks/usePosts';

const HomeFeed = () => {
  const [showCreatePost, setShowCreatePost] = useState(false);
  const { posts, loading, handleCreatePost, handleLikePost } = usePosts();

  const onCreatePost = async (postData: any) => {
    await handleCreatePost(postData);
    setShowCreatePost(false);
  };

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
        <div className="lg:col-span-3">
          <FeedContent
            posts={posts}
            loading={loading}
            onCreatePostClick={() => setShowCreatePost(true)}
            onLikePost={handleLikePost}
          />
        </div>
        
        {/* Sidebar */}
        <FeedSidebar />
      </div>

      <CreatePostModal
        open={showCreatePost}
        onClose={() => setShowCreatePost(false)}
        onSubmit={onCreatePost}
      />
    </div>
  );
};

export default HomeFeed;
