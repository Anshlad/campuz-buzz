
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useOptimizedProfile } from '@/hooks/useOptimizedProfile';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { EditProfileModal } from '@/components/profile/EditProfileModal';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { AchievementsDisplay } from '@/components/achievements/AchievementsDisplay';
import { UserPostsTab } from '@/components/profile/UserPostsTab';
import { UserCommunitiesTab } from '@/components/profile/UserCommunitiesTab';
import { UserActivityTab } from '@/components/profile/UserActivityTab';

export default function Profile() {
  const { user } = useAuth();
  const { profile, loading, updateProfile } = useOptimizedProfile();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleSaveProfile = async (updatedData: any) => {
    if (updateProfile) {
      await updateProfile(updatedData);
    }
  };

  // Transform profile data to match EditProfileModal's expected format
  const transformedUser = profile ? {
    id: profile.id,
    name: profile.display_name || '',
    email: user?.email || '',
    bio: profile.bio || '',
    major: profile.major || '',
    year: profile.year || '',
    department: profile.department || '',
    avatar: profile.avatar_url || '',
    role: profile.role as 'student' | 'professor' | 'admin' | 'club',
    privacy: {
      profileVisible: profile.privacy_settings?.profile_visible ?? true,
      emailVisible: profile.privacy_settings?.email_visible ?? false,
      joinedGroupsVisible: profile.privacy_settings?.academic_info_visible ?? true,
    }
  } : null;

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
                <TabsTrigger value="communities">Communities</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>
              <TabsContent value="posts">
                <UserPostsTab />
              </TabsContent>
              <TabsContent value="communities">
                <UserCommunitiesTab />
              </TabsContent>
              <TabsContent value="activity">
                <UserActivityTab />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {transformedUser && (
        <EditProfileModal
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={transformedUser}
          onSave={handleSaveProfile}
        />
      )}
    </div>
  );
}
