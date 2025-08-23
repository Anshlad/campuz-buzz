
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { EditProfileModal } from '@/components/profile/EditProfileModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useOptimizedProfile } from '@/hooks/useOptimizedProfile';
import { useToast } from '@/hooks/use-toast';
import { UserPostsTab } from '@/components/profile/UserPostsTab';
import { UserCommunitiesTab } from '@/components/profile/UserCommunitiesTab';
import { UserActivityTab } from '@/components/profile/UserActivityTab';
import { 
  User, 
  Edit3, 
  MapPin, 
  Calendar, 
  BookOpen, 
  Award,
  MessageSquare,
  Heart,
  Users,
  Loader2
} from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { profile, loading, error, updateProfile, isUpdating } = useOptimizedProfile();
  const [showEditModal, setShowEditModal] = useState(false);

  const handleSaveProfile = async (updatedData: any) => {
    try {
      await updateProfile(updatedData);
      setShowEditModal(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading profile...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Error loading profile</h1>
          <p className="text-muted-foreground mb-4">{error.message}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Profile not found</h1>
          <p className="text-muted-foreground">Your profile could not be loaded.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile.avatar_url || ''} />
              <AvatarFallback className="text-2xl">
                {profile.display_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold">{profile.display_name}</h1>
                  <Badge variant="secondary">{profile.role}</Badge>
                </div>
                
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {profile.major && (
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {profile.major}
                    </div>
                  )}
                  {profile.year && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {profile.year}
                    </div>
                  )}
                  {profile.department && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {profile.department}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Award className="h-4 w-4" />
                    {profile.engagement_score || 0} points
                  </div>
                </div>
              </div>
              
              {profile.bio && (
                <p className="text-muted-foreground">{profile.bio}</p>
              )}
            </div>
            
            <Button 
              onClick={() => setShowEditModal(true)}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Edit3 className="h-4 w-4 mr-2" />
              )}
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Profile Tabs */}
      <Tabs defaultValue="posts" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="communities">Communities</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        
        <TabsContent value="posts" className="space-y-4">
          <UserPostsTab />
        </TabsContent>
        
        <TabsContent value="communities" className="space-y-4">
          <UserCommunitiesTab />
        </TabsContent>
        
        <TabsContent value="activity" className="space-y-4">
          <UserActivityTab />
        </TabsContent>
      </Tabs>

      <EditProfileModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        user={{
          id: profile.id,
          name: profile.display_name,
          email: user?.email || '',
          bio: profile.bio || '',
          major: profile.major || '',
          year: profile.year || '',
          department: profile.department || '',
          avatar: profile.avatar_url || '',
          role: profile.role as any,
          privacy: {
            profileVisible: profile.privacy_settings?.profile_visible ?? true,
            emailVisible: profile.privacy_settings?.email_visible ?? false,
            joinedGroupsVisible: profile.privacy_settings?.academic_info_visible ?? true
          }
        }}
        onSave={handleSaveProfile}
      />
    </div>
  );
};

export default Profile;
