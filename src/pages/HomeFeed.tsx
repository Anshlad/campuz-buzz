
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Plus, TrendingUp, Users, Calendar, Bookmark } from 'lucide-react';
import { useEnhancedPosts } from '@/hooks/useEnhancedPosts';
import { useUserProfile } from '@/hooks/useUserProfile';
import { EnhancedPostCard } from '@/components/posts/EnhancedPostCard';
import { EnhancedCreatePostModal } from '@/components/posts/EnhancedCreatePostModal';
import { EnhancedEditProfileModal } from '@/components/profile/EnhancedEditProfileModal';
import { LoadingSkeletons } from '@/components/common/LoadingSkeletons';
import { TrendingTopics } from '@/components/feed/TrendingTopics';

export default function HomeFeed() {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const { posts, loading, createPost, reactToPost, savePost, sharePost } = useEnhancedPosts();
  const { profile, loading: profileLoading, refetchProfile } = useUserProfile();

  if (loading) {
    return <LoadingSkeletons type="feed" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Profile Quick View */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardContent className="p-6">
                <div className="text-center">
                  <Avatar className="h-16 w-16 mx-auto mb-4">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback>
                      {profile?.display_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <h3 className="font-semibold text-gray-900">
                    {profile?.display_name || 'Anonymous User'}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {profile?.major && profile?.year 
                      ? `${profile.major} • ${profile.year}`
                      : 'Student'
                    }
                  </p>
                  
                  {profile?.engagement_score && (
                    <div className="mb-4">
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {profile.engagement_score} points
                      </Badge>
                    </div>
                  )}

                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => setIsEditProfileOpen(true)}
                  >
                    Edit Profile
                  </Button>
                </div>

                {/* Quick Stats */}
                {!profileLoading && (
                  <div className="mt-6 pt-4 border-t space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Connections
                      </span>
                      <span className="font-medium">0</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <Bookmark className="h-4 w-4" />
                        Saved Posts
                      </span>
                      <span className="font-medium">0</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Events
                      </span>
                      <span className="font-medium">0</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-2">
            {/* Create Post Card */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback>
                      {profile?.display_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    variant="outline"
                    className="flex-1 justify-start text-gray-500"
                    onClick={() => setIsCreatePostOpen(true)}
                  >
                    What's on your mind?
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setIsCreatePostOpen(true)}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Posts Feed */}
            <div className="space-y-6">
              {posts.length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                    <p className="text-gray-500 mb-4">Be the first to share something with the community!</p>
                    <Button onClick={() => setIsCreatePostOpen(true)}>
                      Create First Post
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                posts.map((post) => (
                  <EnhancedPostCard
                    key={post.id}
                    post={post}
                    onReact={reactToPost}
                    onSave={savePost}
                    onShare={sharePost}
                  />
                ))
              )}
            </div>
          </div>

          {/* Right Sidebar - Trending & Suggestions */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              <TrendingTopics />
              
              {/* Suggested Communities */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Suggested Communities</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-gray-500">
                    Community suggestions coming soon...
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Events */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Upcoming Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-500">
                    No upcoming events
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EnhancedCreatePostModal
        open={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        onSubmit={createPost}
      />

      <EnhancedEditProfileModal
        open={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        profile={profile}
        onProfileUpdate={refetchProfile}
      />
    </div>
  );
}
