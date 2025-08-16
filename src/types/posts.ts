
export interface Profile {
  id: string;
  display_name: string;
  avatar_url?: string;
  major?: string;
  year?: string;
}

export interface PostReaction {
  count: number;
  users: string[];
}

export interface PostReactions {
  [reactionType: string]: PostReaction;
}

export interface Post {
  id: string;
  user_id: string;
  title?: string;
  content: string;
  image_url?: string;
  post_type: 'text' | 'image' | 'video' | 'poll';
  tags: string[];
  likes_count: number;
  comments_count: number;
  shares_count: number;
  saves_count: number;
  created_at: string;
  updated_at: string;
  visibility: 'public' | 'friends' | 'private';
  hashtags: string[];
  location?: string;
  mentions: string[];
  reactions: PostReactions;
  profiles?: Profile | Profile[];
}

export interface EnhancedPostData extends Post {
  author: Profile;
  is_liked: boolean;
  is_saved: boolean;
  user_reaction?: string;
}

export interface PostFilter {
  type?: 'text' | 'image' | 'video' | 'poll';
  tags?: string[];
  hashtags?: string[];
  author?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  sortBy?: 'recent' | 'popular' | 'trending';
  visibility?: 'public' | 'friends' | 'all';
}

export interface PostCreationData {
  content: string;
  title?: string;
  post_type: 'text' | 'image' | 'video' | 'poll';
  images?: File[];
  tags?: string[];
  mentions?: string[];
  location?: string;
  visibility: 'public' | 'friends' | 'private';
  poll_options?: string[];
}

export interface UserPostInteractions {
  is_liked: boolean;
  is_saved: boolean;
  reaction_type?: string;
}

export interface Hashtag {
  id: string;
  name: string;
  usage_count: number;
  created_at: string;
}
