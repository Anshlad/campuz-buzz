import React, { Suspense, lazy, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Wifi, WifiOff, Bell } from 'lucide-react';
import { SmartSkeletonLoader } from '@/components/common/SmartSkeletonLoader';
import { ErrorBoundaryWithRetry } from '@/components/common/ErrorBoundaryWithRetry';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { useRealtimePosts } from '@/hooks/useRealtimePosts';
import { realtimeNotificationsService } from '@/services/realtimeNotificationsService';
import { EnhancedPostCreator } from '@/components/posts/EnhancedPostCreator';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { usePWA } from '@/hooks/usePWA';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Lazy load components for better performance
const EnhancedPostCard = lazy(() => import('@/components/posts/EnhancedPostCard').then(module => ({ default: module.EnhancedPostCard })));
const ProfileSidebar = lazy(() => import('@/components/feed/ProfileSidebar'));
const TrendingSidebar = lazy(() => import('@/components/feed/TrendingSidebar'));

export default function OptimizedHomeFeed() {
  const { user } = useAuth();
  const [showPostCreator, setShowPostCreator] = useState(false);
  const { posts, loading, error, createPost, isCreating, retry, subscribeToPostUpdates } = useRealtimePosts();
  const { isOnline } = usePWA();
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);
  const [newPostsAvailable, setNewPostsAvailable] = useState(0);

  useEffect(() => {
    if (!isOnline) {
      setShowOfflineAlert(true);
      const timer = setTimeout(() => setShowOfflineAlert(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  // Request notification permission and set up real-time notifications
  useEffect(() => {
    if (!user) return;

    const requestNotificationPermission = async () => {
      if ('Notification' in window && Notification.permission === 'default') {
        await Notification.requestPermission();
      }
    };

    requestNotificationPermission();

    // Subscribe to user notifications
    const unsubscribe = realtimeNotificationsService.subscribeToUserNotifications(
      user.id,
      (notification) => {
        // Handle different types of notifications
        if (notification.type === 'like' || notification.type === 'comment') {
          setNewPostsAvailable(prev => prev + 1);
        }
      }
    );

    return () => {
      realtimeNotificationsService.unsubscribe(`user-notifications-${user.id}`);
    };
  }, [user]);

  // Subscribe to individual post updates for real-time reactions/comments
  useEffect(() => {
    const subscriptions = posts.map(post => subscribeToPostUpdates(post.id));
    
    return () => {
      subscriptions.forEach(unsub => unsub?.());
    };
  }, [posts, subscribeToPostUpdates]);

  if (error && !posts.length) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="mb-4">
            <WifiOff className="h-12 w-12 mx-auto text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Unable to load feed</h2>
          <p className="text-muted-foreground mb-4">
            {!isOnline 
              ? "You're offline. Check your internet connection." 
              : "Something went wrong. Please try again."
            }
          </p>
          <EnhancedButton onClick={retry} disabled={!isOnline}>
            {isOnline ? 'Try Again' : 'Offline'}
          </EnhancedButton>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundaryWithRetry>
      <div className="min-h-screen pb-20 md:pb-0">
        {/* Offline Alert */}
        <AnimatePresence>
          {showOfflineAlert && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
            >
              <Alert className="bg-orange-500/10 border-orange-500/20">
                <WifiOff className="h-4 w-4 text-orange-500" />
                <AlertDescription className="text-orange-600 dark:text-orange-400">
                  You're offline. Some features may be limited.
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* New Posts Alert */}
        <AnimatePresence>
          {newPostsAvailable > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40"
            >
              <Alert className="bg-primary/10 border-primary/20 cursor-pointer" onClick={() => setNewPostsAvailable(0)}>
                <Bell className="h-4 w-4 text-primary" />
                <AlertDescription className="text-primary">
                  {newPostsAvailable} new notification{newPostsAvailable > 1 ? 's' : ''}
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Left Sidebar - Profile Quick View */}
            <div className="lg:col-span-1 hidden lg:block">
              <div className="sticky top-6">
                <Suspense fallback={<SmartSkeletonLoader type="profile" />}>
                  <ProfileSidebar />
                </Suspense>
              </div>
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
                  disabled={!isOnline}
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
                    <EnhancedButton 
                      onClick={() => setShowPostCreator(true)}
                      disabled={!isOnline}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Post
                    </EnhancedButton>
                  </motion.div>
                ) : (
                  <AnimatePresence initial={false}>
                    {posts.map((post, index) => (
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
                              post={post}
                              onReact={() => {}}
                              onSave={() => {}}
                              onShare={() => {}}
                            />
                          </ErrorBoundaryWithRetry>
                        </Suspense>
                      </motion.div>
                    ))}
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
            <div className="lg:col-span-1 hidden lg:block">
              <div className="sticky top-6">
                <Suspense fallback={<SmartSkeletonLoader type="community" count={3} />}>
                  <TrendingSidebar />
                </Suspense>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile FAB */}
        <FloatingActionButton 
          onClick={() => setShowPostCreator(true)}
          disabled={isCreating || !isOnline}
        />

        {/* Online status indicator */}
        {!isOnline && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed bottom-20 right-4 md:bottom-4 bg-orange-500/10 border border-orange-500/20 rounded-full p-2"
          >
            <WifiOff className="h-4 w-4 text-orange-500" />
          </motion.div>
        )}
      </div>
    </ErrorBoundaryWithRetry>
  );
}
