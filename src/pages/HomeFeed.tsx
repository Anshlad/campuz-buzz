import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  BookOpen, 
  Users, 
  Calendar,
  TrendingUp,
  Plus,
  Search,
  Filter,
  MoreHorizontal
} from 'lucide-react';
import { TrendingTopicsWidget } from '@/components/feed/TrendingTopicsWidget';

interface Post {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  likes_count: number;
  comments_count: number;
  profiles: {
    display_name: string;
    avatar_url?: string;
  };
}

interface Profile {
  user_id: string;
  display_name: string;
  bio?: string;
  avatar_url?: string;
  major?: string;
  year?: string;
}

const ProfileSidebar = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  if (!user || !profile) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center">
          <Avatar className="w-16 h-16 mx-auto mb-4">
            <AvatarImage src={profile.avatar_url} />
            <AvatarFallback>
              {profile.display_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <h3 className="font-semibold text-lg">{profile.display_name}</h3>
          
          {profile.major && (
            <p className="text-sm text-muted-foreground">
              {profile.major} {profile.year && `• ${profile.year}`}
            </p>
          )}
          
          {profile.bio && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
              {profile.bio}
            </p>
          )}
        </div>

        <div className="mt-6 space-y-3">
          <Button variant="outline" className="w-full justify-start">
            <BookOpen className="h-4 w-4 mr-2" />
            My Study Groups
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Calendar className="h-4 w-4 mr-2" />
            My Events
          </Button>
          <Button variant="outline" className="w-full justify-start">
            <Users className="h-4 w-4 mr-2" />
            Communities
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const CreatePostCard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [content, setContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !user) return;

    setIsPosting(true);
    try {
      const { error } = await supabase
        .from('posts')
        .insert({
          content: content.trim(),
          user_id: user.id
        });

      if (error) throw error;

      setContent('');
      toast({
        title: "Post created!",
        description: "Your post has been shared with the community."
      });
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Failed to create post",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex space-x-3">
            <Avatar className="w-10 h-10">
              <AvatarFallback>
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Input
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="border-none shadow-none text-base placeholder:text-muted-foreground"
                maxLength={500}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex space-x-2">
              <Button type="button" variant="ghost" size="sm">
                <BookOpen className="h-4 w-4 mr-1" />
                Study
              </Button>
              <Button type="button" variant="ghost" size="sm">
                <Users className="h-4 w-4 mr-1" />
                Group
              </Button>
            </div>
            
            <Button 
              type="submit" 
              disabled={!content.trim() || isPosting}
              size="sm"
            >
              {isPosting ? 'Posting...' : 'Post'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

const PostCard = ({ post }: { post: Post }) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes_count);

  const handleLike = async () => {
    if (!user) return;

    try {
      if (liked) {
        // Unlike
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', user.id);
        
        setLiked(false);
        setLikesCount(prev => prev - 1);
      } else {
        // Like
        await supabase
          .from('post_likes')
          .insert({
            post_id: post.id,
            user_id: user.id
          });
        
        setLiked(true);
        setLikesCount(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={post.profiles.avatar_url} />
            <AvatarFallback>
              {post.profiles.display_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h4 className="font-semibold">{post.profiles.display_name}</h4>
              <span className="text-sm text-muted-foreground">
                {new Date(post.created_at).toLocaleDateString()}
              </span>
            </div>
            
            <p className="text-sm mb-3 whitespace-pre-wrap">{post.content}</p>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={`${liked ? 'text-red-500' : 'text-muted-foreground'} hover:text-red-500`}
              >
                <Heart className={`h-4 w-4 mr-1 ${liked ? 'fill-current' : ''}`} />
                {likesCount}
              </Button>
              
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-blue-500">
                <MessageCircle className="h-4 w-4 mr-1" />
                {post.comments_count}
              </Button>
              
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-green-500">
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
              
              <Button variant="ghost" size="sm" className="ml-auto">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const FeedContent = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    loadPosts();
  }, [activeTab]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            display_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      const { data, error } = await query;

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="flex space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <CreatePostCard />
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All Posts</TabsTrigger>
          <TabsTrigger value="study">Study</TabsTrigger>
          <TabsTrigger value="social">Social</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-4">
          {posts.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No posts yet</h3>
                  <p>Be the first to share something with the community!</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

const TrendingSidebar = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5" />
          <span>Quick Actions</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button variant="outline" className="w-full justify-start">
          <Plus className="h-4 w-4 mr-2" />
          Create Study Group
        </Button>
        <Button variant="outline" className="w-full justify-start">
          <Calendar className="h-4 w-4 mr-2" />
          Schedule Event
        </Button>
        <Button variant="outline" className="w-full justify-start">
          <Users className="h-4 w-4 mr-2" />
          Find Communities
        </Button>
        <Button variant="outline" className="w-full justify-start">
          <Search className="h-4 w-4 mr-2" />
          Explore
        </Button>
      </CardContent>
    </Card>
  );
};

const HomeFeed = () => {
  const handleTopicClick = (topic: string) => {
    // Handle topic search/navigation
    console.log('Navigating to topic:', topic);
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Sidebar */}
        <div className="lg:col-span-3">
          <ProfileSidebar />
        </div>

        {/* Main Feed */}
        <div className="lg:col-span-6">
          <FeedContent />
        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-3 space-y-4">
          <TrendingTopicsWidget onTopicClick={handleTopicClick} />
          <TrendingSidebar />
        </div>
      </div>
    </div>
  );
};

export default HomeFeed;
