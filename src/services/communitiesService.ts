
export interface Community {
  id: string;
  name: string;
  description: string;
  type: 'department' | 'club' | 'interest';
  memberCount: number;
  isJoined: boolean;
  avatar?: string;
  moderators: string[];
  tags: string[];
  isPrivate: boolean;
}

export interface Poll {
  id: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
  expiresAt?: string;
  allowMultiple: boolean;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
  hasVoted: boolean;
}

export interface QAPost {
  id: string;
  question: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    role: UserRole;
  };
  answers: QAAnswer[];
  tags: string[];
  timestamp: string;
  votes: number;
  hasVoted: boolean;
}

export interface QAAnswer {
  id: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
    role: UserRole;
  };
  votes: number;
  hasVoted: boolean;
  timestamp: string;
  isAccepted: boolean;
}

export type UserRole = 'student' | 'professor' | 'admin' | 'club';

class CommunitiesService {
  private mockCommunities: Community[] = [
    {
      id: '1',
      name: 'Computer Science Department',
      description: 'Official CS department community for students and faculty',
      type: 'department',
      memberCount: 324,
      isJoined: true,
      avatar: '/placeholder.svg',
      moderators: ['prof1', 'admin1'],
      tags: ['Computer Science', 'Programming', 'Tech'],
      isPrivate: false
    },
    {
      id: '2',
      name: 'Photography Club',
      description: 'Capture moments, share stories, learn together',
      type: 'club',
      memberCount: 87,
      isJoined: false,
      avatar: '/placeholder.svg',
      moderators: ['club_mod1'],
      tags: ['Photography', 'Art', 'Creative'],
      isPrivate: false
    },
    {
      id: '3',
      name: 'Machine Learning Enthusiasts',
      description: 'Discussing latest trends in AI and ML',
      type: 'interest',
      memberCount: 156,
      isJoined: true,
      avatar: '/placeholder.svg',
      moderators: ['ml_expert1'],
      tags: ['Machine Learning', 'AI', 'Data Science'],
      isPrivate: false
    }
  ];

  async getCommunities(type?: string): Promise<Community[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (type) {
      return this.mockCommunities.filter(c => c.type === type);
    }
    return this.mockCommunities;
  }

  async joinCommunity(communityId: string, userId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const community = this.mockCommunities.find(c => c.id === communityId);
    if (community) {
      community.isJoined = true;
      community.memberCount += 1;
    }
  }

  async leaveCommunity(communityId: string, userId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const community = this.mockCommunities.find(c => c.id === communityId);
    if (community) {
      community.isJoined = false;
      community.memberCount -= 1;
    }
  }

  async createPoll(pollData: Omit<Poll, 'id' | 'totalVotes'>, authorId: string): Promise<Poll> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const newPoll: Poll = {
      ...pollData,
      id: Date.now().toString(),
      totalVotes: 0,
      options: pollData.options.map(opt => ({ ...opt, votes: 0, hasVoted: false }))
    };
    
    return newPoll;
  }

  async votePoll(pollId: string, optionId: string, userId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200));
    // Mock implementation - would update poll votes in real backend
  }
}

export const communitiesService = new CommunitiesService();
