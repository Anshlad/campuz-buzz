
import { useAuth } from '@/contexts/AuthContext';

export interface Post {
  id: string;
  author: {
    id: string;
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
  type: 'general' | 'study' | 'event' | 'announcement';
  groupId?: string;
}

export interface Comment {
  id: string;
  postId: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  content: string;
  timestamp: string;
}

class PostsService {
  private mockPosts: Post[] = [
    {
      id: '1',
      author: {
        id: '2',
        name: 'Sarah Johnson',
        avatar: '/placeholder.svg',
        major: 'Computer Science',
        year: 'Junior'
      },
      content: 'Just finished my machine learning project! Anyone else working on neural networks this semester? Would love to collaborate! 🤖',
      image: '/placeholder.svg',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      likes: 24,
      comments: 8,
      tags: ['Computer Science', 'Machine Learning'],
      isLiked: false,
      type: 'study'
    },
    {
      id: '2',
      author: {
        id: '3',
        name: 'Mike Chen',
        avatar: '/placeholder.svg',
        major: 'Business',
        year: 'Senior'
      },
      content: 'Study group for Advanced Marketing is meeting tomorrow at 3 PM in the library. Room 204. All welcome!',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      likes: 15,
      comments: 12,
      tags: ['Study Group', 'Marketing'],
      isLiked: true,
      type: 'study',
      groupId: 'marketing-study-group'
    },
    {
      id: '3',
      author: {
        id: '4',
        name: 'Emma Davis',
        avatar: '/placeholder.svg',
        major: 'Psychology',
        year: 'Sophomore'
      },
      content: 'Amazing lecture on cognitive psychology today! Dr. Smith really knows how to make complex concepts accessible. Taking notes has never been this engaging 📚',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      likes: 31,
      comments: 5,
      tags: ['Psychology', 'Academics'],
      isLiked: false,
      type: 'general'
    }
  ];

  private mockComments: Comment[] = [
    {
      id: '1',
      postId: '1',
      author: {
        id: '5',
        name: 'John Doe',
        avatar: '/placeholder.svg'
      },
      content: 'This sounds really interesting! I\'d love to learn more about your approach.',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
    }
  ];

  async getPersonalizedFeed(userId: string, userInterests: string[], userGroups: string[], page = 1, limit = 10): Promise<Post[]> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Enhanced algorithm: prioritize posts based on user interests and groups
    const scoredPosts = this.mockPosts.map(post => {
      let score = 0;
      
      // Base recency score (newer posts get higher score)
      const hoursAgo = (Date.now() - new Date(post.timestamp).getTime()) / (1000 * 60 * 60);
      score += Math.max(0, 100 - hoursAgo);
      
      // Interest matching
      const matchingTags = post.tags.filter(tag => 
        userInterests.some(interest => 
          interest.toLowerCase().includes(tag.toLowerCase()) || 
          tag.toLowerCase().includes(interest.toLowerCase())
        )
      );
      score += matchingTags.length * 50;
      
      // Group membership bonus
      if (post.groupId && userGroups.includes(post.groupId)) {
        score += 75;
      }
      
      // Engagement bonus
      score += (post.likes * 2) + (post.comments * 3);
      
      // Study posts get priority for students
      if (post.type === 'study') {
        score += 25;
      }
      
      return { ...post, score };
    });
    
    // Sort by score and return paginated results
    return scoredPosts
      .sort((a, b) => b.score - a.score)
      .slice((page - 1) * limit, page * limit)
      .map(({ score, ...post }) => post);
  }

  async createPost(postData: Omit<Post, 'id' | 'timestamp' | 'likes' | 'comments' | 'isLiked'>): Promise<Post> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const newPost: Post = {
      ...postData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: 0,
      isLiked: false
    };
    
    this.mockPosts.unshift(newPost);
    return newPost;
  }

  async likePost(postId: string, userId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const post = this.mockPosts.find(p => p.id === postId);
    if (post) {
      post.isLiked = !post.isLiked;
      post.likes += post.isLiked ? 1 : -1;
    }
  }

  async getComments(postId: string): Promise<Comment[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.mockComments.filter(comment => comment.postId === postId);
  }

  async addComment(postId: string, content: string, authorId: string): Promise<Comment> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const newComment: Comment = {
      id: Date.now().toString(),
      postId,
      content,
      author: {
        id: authorId,
        name: 'Current User',
        avatar: '/placeholder.svg'
      },
      timestamp: new Date().toISOString()
    };
    
    this.mockComments.push(newComment);
    
    // Increment comment count on post
    const post = this.mockPosts.find(p => p.id === postId);
    if (post) {
      post.comments += 1;
    }
    
    return newComment;
  }
}

export const postsService = new PostsService();
