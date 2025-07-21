
import React, { useState } from 'react';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Plus, TrendingUp, Users, Calendar, Bookmark } from 'lucide-react';
import { useEnhancedPosts } from '@/hooks/useEnhancedPosts';
import { useUserProfile } from '@/hooks/useUserProfile';
import { EnhancedPostCard } from '@/components/posts/EnhancedPostCard';
import { EnhancedPostCreator } from '@/components/posts/EnhancedPostCreator';
import { EnhancedProfileEditor } from '@/components/profile/EnhancedProfileEditor';
import { LoadingSkeletons } from '@/components/common/LoadingSkeletons';
import { TrendingTopics } from '@/components/feed/TrendingTopics';
import { FloatingActionButton } from '@/components/ui/floating-action-button';
import { motion } from 'framer-motion';

export default function HomeFeed() {
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [showPostCreator, setShowPostCreator] = useState(false);
  const { posts, loading, createPost, reactToPost, savePost, sharePost } = useEnhancedPosts();
  const { profile, loading: profileLoading, refetchProfile } = useUserProfile();

  if (loading) {
    return <LoadingSkeletons type="feed" />;
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Profile Quick View */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <EnhancedCard variant="glass" className="sticky top-6">
                <div className="p-6">
                  <div className="text-center">
                    <motion.div whileHover={{ scale: 1.05 }}>
                      <Avatar className="h-16 w-16 mx-auto mb-4 ring-4 ring-primary/20 hover:ring-primary/40 transition-all">
                        <AvatarImage src={profile?.avatar_url} />
                        <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-primary-foreground text-xl font-bold">
                          {profile?.display_name?.charAt(0) || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </motion.div>
                    <h3 className="font-semibold text-foreground mb-1">
                      {profile?.display_name || 'Anonymous User'}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      {profile?.major && profile?.year 
                        ? `${profile.major} • ${profile.year}`
                        : 'Student'
                      }
                    </p>
                    
                    {profile?.engagement_score && (
                      <div className="mb-4">
                        <Badge variant="secondary" className="flex items-center gap-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 dark:text-amber-300">
                          <TrendingUp className="h-3 w-3" />
                          {profile.engagement_score} points
                        </Badge>
                      </div>
                    )}

                    <EnhancedButton 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => setIsEditProfileOpen(true)}
                    >
                      Edit Profile
                    </EnhancedButton>
                  </div>

                  {/* Quick Stats */}
                  {!profileLoading && (
                    <div className="mt-6 pt-4 border-t border-border/50 space-y-3">
                      {[
                        { icon: Users, label: 'Connections', value: 0 },
                        { icon: Bookmark, label: 'Saved Posts', value: 0 },
                        { icon: Calendar, label: 'Events', value: 0 }
                      ].map((stat, index) => (
                        <motion.div 
                          key={stat.label}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 + index * 0.1 }}
                          className="flex items-center justify-between text-sm hover:bg-muted/50 p-2 rounded-lg transition-colors cursor-pointer"
                        >
                          <span className="flex items-center gap-2">
                            <stat.icon className="h-4 w-4 text-muted-foreground" />
                            {stat.label}
                          </span>
                          <span className="font-medium">{stat.value}</span>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </EnhancedCard>
            </motion.div>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-2">
            {/* Create Post Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <div data-post-creator>
                <EnhancedPostCreator
                  onSubmit={createPost}
                  placeholder="What's on your mind?"
                  expanded={showPostCreator}
                  onExpandedChange={setShowPostCreator}
                />
              </div>
            </motion.div>

            {/* Posts Feed */}
            <div className="space-y-6">
              {posts.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <EnhancedCard variant="glass">
                    <div className="p-8 text-center">
                      <h3 className="text-lg font-medium text-foreground mb-2">No posts yet</h3>
                      <p className="text-muted-foreground mb-4">Be the first to share something with the community!</p>
                      <EnhancedButton onClick={() => setShowPostCreator(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Post
                      </EnhancedButton>
                    </div>
                  </EnhancedCard>
                </motion.div>
              ) : (
                posts.map((post, index) => {
                  // Transform EnhancedPost to match Post interface
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
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      <EnhancedPostCard
                        post={transformedPost}
                        onReact={reactToPost}
                        onSave={savePost}
                        onShare={sharePost}
                      />
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Sidebar - Trending & Suggestions */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="sticky top-6 space-y-6"
            >
              <TrendingTopics />
              
              {/* Suggested Communities */}
              <EnhancedCard variant="glass">
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Suggested Communities</h3>
                  <div className="text-sm text-muted-foreground">
                    Community suggestions coming soon...
                  </div>
                </div>
              </EnhancedCard>

              {/* Upcoming Events */}
              <EnhancedCard variant="glass">
                <div className="p-6">
                  <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
                    <Calendar className="h-5 w-5 text-primary" />
                    Upcoming Events
                  </h3>
                  <div className="text-sm text-muted-foreground">
                    No upcoming events
                  </div>
                </div>
              </EnhancedCard>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mobile FAB */}
      <FloatingActionButton 
        onClick={() => setShowPostCreator(true)}
      />

      {/* Profile Editor Modal */}
      <EnhancedProfileEditor
        open={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        profile={profile}
        onProfileUpdate={refetchProfile}
      />
    </div>
  );
}
