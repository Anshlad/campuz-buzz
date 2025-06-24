
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PostCard } from '@/components/posts/PostCard';
import { CreatePostModal } from '@/components/posts/CreatePostModal';
import { FeedSkeletons } from '@/components/common/LoadingSkeletons';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { postsService, Post } from '@/services/postsService';
import { Plus, Filter, RefreshCw } from 'lucide-react';

export const HomeFeed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchPosts(true);
    }
  }, [user, filter]);

  const fetchPosts = async (reset = false) => {
    if (!user) return;
    
    try {
      if (reset) {
        setLoading(true);
        setPage(1);
      }
      
      const currentPage = reset ? 1 : page;
      const newPosts = await postsService.getPersonalizedFeed(
        user.id, 
        user.interests || [], 
        user.joinedGroups || [], 
        currentPage
      );
      
      if (reset) {
        setPosts(newPosts);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
      }
      
      setHasMore(newPosts.length === 10);
      if (!reset) setPage(prev => prev + 1);
      
    } catch (error) {
      toast({
        title: "Error loading posts",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPosts(true);
  };

  const handleLike = async (postId: string) => {
    if (!user) return;
    
    try {
      await postsService.likePost(postId, user.id);
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
          : post
      ));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update like status.",
        variant: "destructive"
      });
    }
  };

  const handleNewPost = async (newPostData: any) => {
    if (!user) return;
    
    try {
      const post = await postsService.createPost({
        author: {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          major: user.major,
          year: user.year
        },
        content: newPostData.content,
        image: newPostData.image,
        tags: newPostData.tags || [],
        type: 'general'
      });
      
      setPosts([post, ...posts]);
    } catch (error) {
      toast({
        title: "Error creating post",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const filters = [
    { label: 'All Posts', value: 'all' },
    { label: 'Study Groups', value: 'study' },
    { label: 'Events', value: 'events' },
    { label: 'Academic', value: 'academic' }
  ];

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
        <FeedSkeletons count={5} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Home Feed</h1>
        <div className="flex space-x-2">
          <Button 
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Post
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 overflow-x-auto">
            <Filter className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
            {filters.map((f) => (
              <Badge
                key={f.value}
                variant={filter === f.value ? "default" : "secondary"}
                className="cursor-pointer whitespace-nowrap"
                onClick={() => setFilter(f.value)}
              >
                {f.label}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Posts */}
      {posts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-gray-400 dark:text-gray-600 mb-4">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No posts yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">Be the first to share something with your community!</p>
            <Button onClick={() => setShowCreateModal(true)}>
              Create Your First Post
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post} 
              onLike={() => handleLike(post.id)} 
            />
          ))}
          
          {hasMore && (
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                onClick={() => fetchPosts(false)}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Create Post Modal */}
      <CreatePostModal 
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleNewPost}
      />
    </div>
  );
};
