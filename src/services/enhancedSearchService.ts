
import { supabase } from '@/integrations/supabase/client';

export interface SearchResult {
  id: string;
  type: 'user' | 'post' | 'community' | 'event';
  title: string;
  description: string;
  avatar_url?: string;
  metadata?: any;
  relevance_score?: number;
}

export interface UserSearchResult extends SearchResult {
  type: 'user';
  display_name: string;
  major?: string;
  year?: string;
  skills?: string[];
  interests?: string[];
}

export interface TrendingTopic {
  id: string;
  topic: string;
  mention_count: number;
  trend_score: number;
  last_mentioned: string;
}

export interface SearchFilters {
  type?: 'user' | 'post' | 'community' | 'event';
  dateRange?: {
    start: string;
    end: string;
  };
  categories?: string[];
  tags?: string[];
  location?: string;
}

class EnhancedSearchService {
  // Universal search across all content types
  async search(query: string, filters: SearchFilters = {}, page = 0, limit = 20): Promise<{
    results: SearchResult[];
    total: number;
    suggestions: string[];
  }> {
    try {
      const results: SearchResult[] = [];
      let total = 0;

      // Search users if no type filter or user type specified
      if (!filters.type || filters.type === 'user') {
        const userResults = await this.searchUsers(query, page, limit);
        results.push(...userResults.users);
        total += userResults.total;
      }

      // Search posts
      if (!filters.type || filters.type === 'post') {
        const postResults = await this.searchPosts(query, filters, page, limit);
        results.push(...postResults.posts);
        total += postResults.total;
      }

      // Search communities
      if (!filters.type || filters.type === 'community') {
        const communityResults = await this.searchCommunities(query, page, limit);
        results.push(...communityResults.communities);
        total += communityResults.total;
      }

      // Search events
      if (!filters.type || filters.type === 'event') {
        const eventResults = await this.searchEvents(query, filters, page, limit);
        results.push(...eventResults.events);
        total += eventResults.total;
      }

      // Sort by relevance
      results.sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0));

      // Generate search suggestions
      const suggestions = await this.generateSearchSuggestions(query);

      return {
        results: results.slice(0, limit),
        total,
        suggestions
      };
    } catch (error) {
      console.error('Error in universal search:', error);
      return { results: [], total: 0, suggestions: [] };
    }
  }

  // Search users by name, skills, interests
  async searchUsers(query: string, page = 0, limit = 10): Promise<{
    users: UserSearchResult[];
    total: number;
  }> {
    try {
      const { data, error, count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .or(`display_name.ilike.%${query}%,bio.ilike.%${query}%,major.ilike.%${query}%,school.ilike.%${query}%`)
        .range(page * limit, (page + 1) * limit - 1);

      if (error) throw error;

      const users = (data || []).map(profile => ({
        id: profile.user_id,
        type: 'user' as const,
        title: profile.display_name || 'Anonymous User',
        description: profile.bio || `${profile.major || 'Student'} ${profile.year ? `• ${profile.year}` : ''}`,
        avatar_url: profile.avatar_url,
        display_name: profile.display_name || 'Anonymous User',
        major: profile.major,
        year: profile.year,
        skills: profile.skills,
        interests: profile.interests,
        relevance_score: this.calculateUserRelevance(profile, query),
        metadata: {
          school: profile.school,
          engagement_score: profile.engagement_score
        }
      }));

      return {
        users,
        total: count || 0
      };
    } catch (error) {
      console.error('Error searching users:', error);
      return { users: [], total: 0 };
    }
  }

  // Search posts with full-text search
  async searchPosts(query: string, filters: SearchFilters, page = 0, limit = 10): Promise<{
    posts: SearchResult[];
    total: number;
  }> {
    try {
      let queryBuilder = supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            display_name,
            avatar_url
          )
        `, { count: 'exact' })
        .or(`content.ilike.%${query}%,title.ilike.%${query}%`);

      // Apply date filters
      if (filters.dateRange) {
        queryBuilder = queryBuilder
          .gte('created_at', filters.dateRange.start)
          .lte('created_at', filters.dateRange.end);
      }

      // Apply tag filters
      if (filters.tags && filters.tags.length > 0) {
        queryBuilder = queryBuilder.overlaps('tags', filters.tags);
      }

      const { data, error, count } = await queryBuilder
        .order('created_at', { ascending: false })
        .range(page * limit, (page + 1) * limit - 1);

      if (error) throw error;

      const posts = (data || []).map(post => ({
        id: post.id,
        type: 'post' as const,
        title: post.title || post.content.substring(0, 50) + '...',
        description: post.content,
        avatar_url: post.profiles?.avatar_url,
        relevance_score: this.calculatePostRelevance(post, query),
        metadata: {
          author: post.profiles?.display_name,
          likes_count: post.likes_count,
          comments_count: post.comments_count,
          created_at: post.created_at
        }
      }));

      return {
        posts,
        total: count || 0
      };
    } catch (error) {
      console.error('Error searching posts:', error);
      return { posts: [], total: 0 };
    }
  }

  // Search communities
  async searchCommunities(query: string, page = 0, limit = 10): Promise<{
    communities: SearchResult[];
    total: number;
  }> {
    try {
      const { data, error, count } = await supabase
        .from('communities_enhanced')
        .select('*', { count: 'exact' })
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .range(page * limit, (page + 1) * limit - 1);

      if (error) throw error;

      const communities = (data || []).map(community => ({
        id: community.id,
        type: 'community' as const,
        title: community.name,
        description: community.description || 'No description available',
        avatar_url: community.avatar_url,
        relevance_score: this.calculateCommunityRelevance(community, query),
        metadata: {
          member_count: community.member_count,
          is_private: community.is_private,
          category: community.category
        }
      }));

      return {
        communities,
        total: count || 0
      };
    } catch (error) {
      console.error('Error searching communities:', error);
      return { communities: [], total: 0 };
    }
  }

  // Search events
  async searchEvents(query: string, filters: SearchFilters, page = 0, limit = 10): Promise<{
    events: SearchResult[];
    total: number;
  }> {
    try {
      let queryBuilder = supabase
        .from('events')
        .select('*', { count: 'exact' })
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,location.ilike.%${query}%`);

      // Apply date filters
      if (filters.dateRange) {
        queryBuilder = queryBuilder
          .gte('start_time', filters.dateRange.start)
          .lte('start_time', filters.dateRange.end);
      }

      const { data, error, count } = await queryBuilder
        .order('start_time', { ascending: true })
        .range(page * limit, (page + 1) * limit - 1);

      if (error) throw error;

      const events = (data || []).map(event => ({
        id: event.id,
        type: 'event' as const,
        title: event.title,
        description: event.description || 'No description available',
        relevance_score: this.calculateEventRelevance(event, query),
        metadata: {
          start_time: event.start_time,
          location: event.location,
          attendee_count: event.attendee_count,
          is_virtual: event.is_virtual
        }
      }));

      return {
        events,
        total: count || 0
      };
    } catch (error) {
      console.error('Error searching events:', error);
      return { events: [], total: 0 };
    }
  }

  // Get trending topics with real-time data
  async getTrendingTopics(limit = 10): Promise<TrendingTopic[]> {
    try {
      const { data, error } = await supabase
        .from('trending_topics')
        .select('*')
        .order('trend_score', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching trending topics:', error);
      return [];
    }
  }

  // Generate search suggestions
  private async generateSearchSuggestions(query: string): Promise<string[]> {
    try {
      // Get popular hashtags that match the query
      const { data: hashtags } = await supabase
        .from('hashtags')
        .select('name')
        .ilike('name', `%${query}%`)
        .order('usage_count', { ascending: false })
        .limit(5);

      // Get popular search terms from trending topics
      const { data: trends } = await supabase
        .from('trending_topics')
        .select('topic')
        .ilike('topic', `%${query}%`)
        .order('trend_score', { ascending: false })
        .limit(3);

      const suggestions = [
        ...(hashtags || []).map(h => h.name),
        ...(trends || []).map(t => t.topic)
      ];

      return [...new Set(suggestions)]; // Remove duplicates
    } catch (error) {
      console.error('Error generating suggestions:', error);
      return [];
    }
  }

  // Relevance calculation methods
  private calculateUserRelevance(profile: any, query: string): number {
    let score = 0;
    const lowerQuery = query.toLowerCase();

    if (profile.display_name?.toLowerCase().includes(lowerQuery)) score += 50;
    if (profile.bio?.toLowerCase().includes(lowerQuery)) score += 30;
    if (profile.major?.toLowerCase().includes(lowerQuery)) score += 40;
    if (profile.skills?.some((skill: string) => skill.toLowerCase().includes(lowerQuery))) score += 35;
    if (profile.interests?.some((interest: string) => interest.toLowerCase().includes(lowerQuery))) score += 35;

    // Boost by engagement score
    score += (profile.engagement_score || 0) * 0.1;

    return score;
  }

  private calculatePostRelevance(post: any, query: string): number {
    let score = 0;
    const lowerQuery = query.toLowerCase();

    if (post.title?.toLowerCase().includes(lowerQuery)) score += 40;
    if (post.content?.toLowerCase().includes(lowerQuery)) score += 30;

    // Boost by engagement
    score += (post.likes_count || 0) * 2;
    score += (post.comments_count || 0) * 3;

    // Boost recent posts
    const daysSincePost = (Date.now() - new Date(post.created_at).getTime()) / (1000 * 60 * 60 * 24);
    score += Math.max(0, 10 - daysSincePost);

    return score;
  }

  private calculateCommunityRelevance(community: any, query: string): number {
    let score = 0;
    const lowerQuery = query.toLowerCase();

    if (community.name?.toLowerCase().includes(lowerQuery)) score += 50;
    if (community.description?.toLowerCase().includes(lowerQuery)) score += 30;

    // Boost by member count
    score += Math.min(20, (community.member_count || 0) * 0.5);

    return score;
  }

  private calculateEventRelevance(event: any, query: string): number {
    let score = 0;
    const lowerQuery = query.toLowerCase();

    if (event.title?.toLowerCase().includes(lowerQuery)) score += 50;
    if (event.description?.toLowerCase().includes(lowerQuery)) score += 30;
    if (event.location?.toLowerCase().includes(lowerQuery)) score += 25;

    // Boost upcoming events
    const daysUntilEvent = (new Date(event.start_time).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
    if (daysUntilEvent > 0 && daysUntilEvent < 30) {
      score += Math.max(0, 20 - daysUntilEvent);
    }

    return score;
  }
}

export const enhancedSearchService = new EnhancedSearchService();
