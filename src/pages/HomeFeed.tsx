
import React, { useState, useEffect } from 'react';
import { PostCard } from '@/components/posts/PostCard';
import { CreatePostModal } from '@/components/posts/CreatePostModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Filter } from 'lucide-react';

interface Post {
  id: string;
  author: {
    name: string;
    avatar?: string;
    major: string;
    year: string;
  };
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  comments: number;
  tags: string[];
  isLiked: boolean;
}

export const HomeFeed = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockPosts: Post[] = [
      {
        id: '1',
        author: {
          name: 'Sarah Johnson',
          avatar: '/placeholder.svg',
          major: 'Computer Science',
          year: 'Junior'
        },
        content: 'Just finished my machine learning project! Anyone else working on neural networks this semester? Would love to collaborate! 🤖',
        image: '/placeholder.svg',
        timestamp: '2 hours ago',
        likes: 24,
        comments: 8,
        tags: ['Computer Science', 'Machine Learning'],
        isLiked: false
      },
      {
        id: '2',
        author: {
          name: 'Mike Chen',
          avatar: '/placeholder.svg',
          major: 'Business',
          year: 'Senior'
        },
        content: 'Study group for Advanced Marketing is meeting tomorrow at 3 PM in the library. Room 204. All welcome!',
        timestamp: '4 hours ago',
        likes: 15,
        comments: 12,
        tags: ['Study Group', 'Marketing'],
        isLiked: true
      },
      {
        id: '3',
        author: {
          name: 'Emma Davis',
          avatar: '/placeholder.svg',
          major: 'Psychology',
          year: 'Sophomore'
        },
        content: 'Amazing lecture on cognitive psychology today! Dr. Smith really knows how to make complex concepts accessible. Taking notes has never been this engaging 📚',
        timestamp: '6 hours ago',
        likes: 31,
        comments: 5,
        tags: ['Psychology', 'Academics'],
        isLiked: false
      }
    ];
    
    setPosts(mockPosts);
    setLoading(false);
  };

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
        : post
    ));
  };

  const handleNewPost = (newPost: any) => {
    const post: Post = {
      id: Date.now().toString(),
      author: {
        name: 'Alex Thompson',
        major: 'Computer Science',
        year: 'Junior'
      },
      content: newPost.content,
      image: newPost.image,
      timestamp: 'Just now',
      likes: 0,
      comments: 0,
      tags: newPost.tags || [],
      isLiked: false
    };
    setPosts([post, ...posts]);
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
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Home Feed</h1>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Post
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 overflow-x-auto">
            <Filter className="h-4 w-4 text-gray-500 flex-shrink-0" />
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
            <div className="text-gray-400 mb-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Plus className="h-8 w-8" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
            <p className="text-gray-500 mb-4">Be the first to share something with your community!</p>
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
