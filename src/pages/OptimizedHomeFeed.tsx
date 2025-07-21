
import React, { Suspense, lazy, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { SmartSkeletonLoader } from '@/components/common/SmartSkeletonLoader';
import { ErrorBoundaryWithRetry } from '@/components/common/ErrorBoundaryWithRetry';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { useOptimizedPosts } from '@/hooks/useOptimizedPosts';
import { EnhancedPostCreator } from '@/components/posts/EnhancedPostCreator';
import { FloatingActionButton } from '@/components/ui/floating-action-button';

// Lazy load components for better performance
const EnhancedPostCard = lazy(() => import('@/components/posts/EnhancedPostCard').then(module => ({ default: module.EnhancedPostCard })));
const ProfileSidebar = lazy(() => import('@/components/feed/ProfileSidebar'));
const TrendingSidebar = lazy(() => import('@/components/feed/TrendingSidebar'));

export default function OptimizedHomeFeed() {
  const [showPostCreator, setShowPostCreator] = useState(false);
  const { posts, loading, error, retry, createPost, isCreating } = useOptimizedPosts();

  if (error && !posts.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold mb-2">Unable to load feed</h2>
          <p className="text-muted-foreground mb-4">
            Check your internet connection and try again.
          </p>
          <EnhancedButton onClick={retry}>
            Try Again
          </EnhancedButton>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundaryWithRetry>
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Left Sidebar - Profile Quick View */}
            <div className="lg:col-span-1">
              <Suspense fallback={<SmartSkeletonLoader type="profile" />}>
                <ProfileSidebar />
              </Suspense>
            </div>

            {/* Main Feed */}
            <div className="lg:col-span-2">
              {/* Create Post Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-6"
              >
                <EnhancedPostCreator
                  onSubmit={createPost}
                  placeholder="What's on your mind?"
                  expanded={showPostCreator}
                  onExpandedChange={setShowPostCreator}
                />
              </motion.div>

              {/* Posts Feed */}
              <div className="space-y-6">
                {loading && posts.length === 0 ? (
                  <SmartSkeletonLoader type="feed" />
                ) : posts.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <h3 className="text-lg font-medium text-foreground mb-2">No posts yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Be the first to share something with the community!
                    </p>
                    <EnhancedButton onClick={() => setShowPostCreator(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Post
                    </EnhancedButton>
                  </motion.div>
                ) : (
                  <AnimatePresence initial={false}>
                    {posts.map((post, index) => {
                      // Transform OptimizedPost to match Post interface
                      const transformedPost = {
                        ...post,
                        updated_at: post.updated_at || post.created_at,
                        visibility: (post.visibility as 'public' | 'friends' | 'private') || 'public',
                        author: post.author || {
                          id: post.user_id,
                          display_name: 'Anonymous User',
                          avatar_url: undefined,
                          major: undefined,
                          year: undefined
                        }
                      };

                      return (
                        <motion.div
                          key={post.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ delay: Math.min(index * 0.05, 0.3) }}
                        >
                          <Suspense fallback={<SmartSkeletonLoader type="post" />}>
                            <ErrorBoundaryWithRetry
                              fallback={<SmartSkeletonLoader type="post" />}
                            >
                              <EnhancedPostCard
                                post={transformedPost}
                                onReact={() => {}}
                                onSave={() => {}}
                                onShare={() => {}}
                              />
                            </ErrorBoundaryWithRetry>
                          </Suspense>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}

                {/* Loading indicator for additional posts */}
                {loading && posts.length > 0 && (
                  <div className="py-4">
                    <SmartSkeletonLoader type="post" count={2} />
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar - Trending & Suggestions */}
            <div className="lg:col-span-1">
              <Suspense fallback={<SmartSkeletonLoader type="community" count={3} />}>
                <TrendingSidebar />
              </Suspense>
            </div>
          </div>
        </div>

        {/* Mobile FAB */}
        <FloatingActionButton 
          onClick={() => setShowPostCreator(true)}
          disabled={isCreating}
        />
      </div>
    </ErrorBoundaryWithRetry>
  );
}
