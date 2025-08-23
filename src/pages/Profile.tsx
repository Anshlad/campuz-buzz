import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOptimizedProfile } from '@/hooks/useOptimizedProfile';
import { databaseService } from '@/services/databaseService';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { EditProfileModal } from '@/components/profile/EditProfileModal';
import { PostCard } from '@/components/posts/PostCard';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { AchievementsDisplay } from '@/components/achievements/AchievementsDisplay';

export default function Profile() {
  const { user } = useAuth();
  const { profile, loading, refetchProfile } = useOptimizedProfile();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    refetchProfile();
  }, [user, refetchProfile]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6">
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-2xl font-semibold">
              {profile?.display_name || 'Loading...'}
            </CardTitle>
            <Button variant="ghost" onClick={() => setIsEditModalOpen(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              {loading ? (
                <Skeleton className="h-16 w-16 rounded-full" />
              ) : (
                <Avatar className="h-16 w-16">
                  <AvatarImage src={profile?.avatar_url} alt={profile?.display_name} />
                  <AvatarFallback>{profile?.display_name?.[0] || 'U'}</AvatarFallback>
                </Avatar>
              )}
              <div>
                <p className="text-sm text-muted-foreground">
                  {profile?.major} - {profile?.year}
                </p>
                <p className="text-sm text-muted-foreground">
                  {profile?.bio || 'No bio yet'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left sidebar with achievements */}
          <div className="lg:col-span-1 space-y-6">
            <AchievementsDisplay />
            
            {profile && (
              <Card>
                <CardHeader>
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm">
                    <span className="font-bold">Name:</span> {profile.display_name}
                  </div>
                  <div className="text-sm">
                    <span className="font-bold">Major:</span> {profile.major || 'N/A'}
                  </div>
                  <div className="text-sm">
                    <span className="font-bold">Year:</span> {profile.year || 'N/A'}
                  </div>
                  <div className="text-sm">
                    <span className="font-bold">School:</span> {profile.school || 'N/A'}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main content area */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="posts" className="w-full">
              <TabsList>
                <TabsTrigger value="posts">Posts</TabsTrigger>
                <TabsTrigger value="comments">Comments</TabsTrigger>
                <TabsTrigger value="likes">Likes</TabsTrigger>
              </TabsList>
              <TabsContent value="posts">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Posts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Here you can see all your posts.</p>
                    {[...Array(3)].map((_, i) => (
                      <PostCard
                        key={i}
                        post={{
                          id: `post-${i}`,
                          author: {
                            name: profile?.display_name || 'Loading...',
                            avatar: profile?.avatar_url,
                            major: profile?.major || '',
                            year: profile?.year || ''
                          },
                          content: 'This is a sample post content.',
                          image: 'https://source.unsplash.com/random',
                          timestamp: new Date().toISOString(),
                          likes: 10,
                          comments: 3,
                          tags: ['sample', 'post'],
                          isLiked: false
                        }}
                        onLike={() => {}}
                      />
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="comments">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Comments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Here you can see all your comments.</p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="likes">
                <Card>
                  <CardHeader>
                    <CardTitle>Posts You Liked</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Here you can see all the posts you liked.</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <EditProfileModal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profile={profile}
        refetchProfile={refetchProfile}
      />
    </div>
  );
}
