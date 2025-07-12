
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { EditProfileModal } from '@/components/profile/EditProfileModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Edit3, 
  MapPin, 
  Calendar, 
  BookOpen, 
  Award,
  MessageSquare,
  Heart,
  Users
} from 'lucide-react';

interface UserProfile {
  id: string;
  user_id: string;
  display_name: string;
  bio?: string;
  avatar_url?: string;
  major?: string;
  department?: string;
  year?: string;
  role: string;
  engagement_score: number;
  created_at: string;
}

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [stats, setStats] = useState({
    posts: 0,
    likes: 0,
    comments: 0,
    communities: 0
  });

  useEffect(() => {
    if (user) {
      loadProfile();
      loadUserStats();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id!)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: "Error loading profile",
        description: "Please try refreshing the page.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      // Get posts count
      const { count: postsCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id!);

      // Get likes count
      const { count: likesCount } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id!);

      // Get comments count
      const { count: commentsCount } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id!);

      // Get communities count
      const { count: communitiesCount } = await supabase
        .from('community_members')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id!);

      setStats({
        posts: postsCount || 0,
        likes: likesCount || 0,
        comments: commentsCount || 0,
        communities: communitiesCount || 0
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSaveProfile = async (updatedData: Partial<UserProfile>) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updatedData)
        .eq('user_id', user?.id!);

      if (error) throw error;

      setProfile(prev => prev ? { ...prev, ...updatedData } : null);
      
      toast({
        title: "Profile updated!",
        description: "Your changes have been saved successfully."
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Profile not found</h1>
          <p className="text-muted-foreground">There was an error loading your profile.</p>
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
              <AvatarImage src={profile.avatar_url} />
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
                    {profile.engagement_score} points
                  </div>
                </div>
              </div>
              
              {profile.bio && (
                <p className="text-muted-foreground">{profile.bio}</p>
              )}
              
              <div className="flex gap-6 text-sm">
                <div className="text-center">
                  <div className="font-semibold">{stats.posts}</div>
                  <div className="text-muted-foreground">Posts</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">{stats.likes}</div>
                  <div className="text-muted-foreground">Likes Given</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">{stats.comments}</div>
                  <div className="text-muted-foreground">Comments</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">{stats.communities}</div>
                  <div className="text-muted-foreground">Communities</div>
                </div>
              </div>
            </div>
            
            <Button onClick={() => setShowEditModal(true)}>
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Profile Tabs */}
      <Tabs defaultValue="posts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="communities">Communities</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        
        <TabsContent value="posts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Posts</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Your posts will appear here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="communities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Joined Communities</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Communities you've joined will appear here.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Your recent activity will appear here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <EditProfileModal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        user={{
          id: profile.id,
          name: profile.display_name,
          email: user?.email || '',
          bio: profile.bio,
          major: profile.major || '',
          year: profile.year || '',
          department: profile.department || '',
          avatar: profile.avatar_url,
          role: profile.role as any,
          privacy: {
            profileVisible: true,
            emailVisible: false,
            joinedGroupsVisible: true
          }
        }}
        onSave={handleSaveProfile}
      />
    </div>
  );
};

export default Profile;
