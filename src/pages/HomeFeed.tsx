import React from 'react';
import { PostCard } from '@/components/posts/PostCard';
import { StudySuggestions } from '@/components/ai/StudySuggestions';
import { TrendingTopics } from '@/components/feed/TrendingTopics';

const HomeFeed = () => {
  const mockPosts = [
    {
      id: '1',
      author: {
        name: 'Sarah Chen',
        avatar: '',
        major: 'Computer Science',
        year: 'Junior'
      },
      content: 'Anyone up for a study session for CS 301? The exam is next week and I could use some help with algorithms! 📚',
      timestamp: '2024-01-10T14:30:00Z',
      likes: 12,
      comments: 8,
      tags: ['study', 'computer-science'],
      isLiked: false
    },
    {
      id: '2',
      author: {
        name: 'Mike Rodriguez',
        avatar: '',
        major: 'Business',
        year: 'Senior'
      },
      content: 'Just landed an internship at Microsoft! Happy to help anyone with interview prep 🎉',
      image: '/placeholder.svg',
      timestamp: '2024-01-10T12:15:00Z',
      likes: 34,
      comments: 15,
      tags: ['career', 'internship'],
      isLiked: true
    }
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Campus Buzz Feed</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Feed */}
        <div className="lg:col-span-3 space-y-6">
          {mockPosts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post} 
              onLike={() => console.log('Liked', post.id)} 
            />
          ))}
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          <StudySuggestions />
          <TrendingTopics />
        </div>
      </div>
    </div>
  );
};

export default HomeFeed;