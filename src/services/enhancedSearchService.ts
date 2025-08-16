
import { supabase } from '@/integrations/supabase/client';

export interface SearchFilters {
  type?: 'posts' | 'users' | 'communities' | 'events';
  dateRange?: { start: Date; end: Date };
  tags?: string[];
  category?: string;
  location?: string;
}

export interface SearchResult {
  id: string;
  type: 'post' | 'user' | 'community' | 'event';
  title: string;
  description?: string;
  image?: string;
  metadata?: Record<string, any>;
  relevance?: number;
}

export interface TrendingTopic {
  id: string;
  topic: string;
  mention_count: number;
  trend_score: number;
  last_mentioned: string;
}

class EnhancedSearchService {
  // Universal search across all content types
  async search(
    query: string,
    filters: SearchFilters = {},
    page = 1,
    limit = 20
  ): Promise<{
    results: SearchResult[];
    total: number;
    suggestions: string[];
  }> {
    try {
      const offset = (page - 1) * limit;
      const results: SearchResult[] = [];
      let total = 0;

      // Search posts
      if (!filters.type || filters.type === 'posts') {
        const { data: posts, count } = await supabase
          .from('posts')
          .select(`
            id,
            title,
            content,
            media_urls,
            created_at,
            user_id,
            profiles!inner(display_name, avatar_url)
          `, { count: 'exact' })
          .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
          .range(offset, offset + limit - 1);

        if (posts) {
          const postResults = posts.map(post => ({
            id: post.id,
            type: 'post' as const,
            title: post.title || 'Untitled Post',
            description: post.content?.substring(0, 200),
            image: post.media_urls?.[0],
            metadata: {
              author: Array.isArray(post.profiles) ? post.profiles[0]?.display_name : post.profiles?.display_name,
              author_avatar: Array.isArray(post.profiles) ? post.profiles[0]?.avatar_url : post.profiles?.avatar_url,
              created_at: post.created_at
            }
          }));
          results.push(...postResults);
          total += count || 0;
        }
      }

      // Search users (profiles)
      if (!filters.type || filters.type === 'users') {
        const { data: users, count } = await supabase
          .from('profiles')
          .select('user_id, display_name, bio, avatar_url, major, school', { count: 'exact' })
          .or(`display_name.ilike.%${query}%,bio.ilike.%${query}%,major.ilike.%${query}%`)
          .range(offset, offset + limit - 1);

        if (users) {
          const userResults = users.map(user => ({
            id: user.user_id,
            type: 'user' as const,
            title: user.display_name || 'Anonymous User',
            description: user.bio || `${user.major} at ${user.school}`,
            image: user.avatar_url,
            metadata: {
              major: user.major,
              school: user.school
            }
          }));
          results.push(...userResults);
          total += count || 0;
        }
      }

      // Search communities
      if (!filters.type || filters.type === 'communities') {
        const { data: communities, count } = await supabase
          .from('communities_enhanced')
          .select('*', { count: 'exact' })
          .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
          .range(offset, offset + limit - 1);

        if (communities) {
          const communityResults = communities.map(community => ({
            id: community.id,
            type: 'community' as const,
            title: community.name,
            description: community.description,
            image: community.avatar_url,
            metadata: {
              member_count: community.member_count,
              is_private: community.is_private,
              created_by: community.created_by
            }
          }));
          results.push(...communityResults);
          total += count || 0;
        }
      }

      // Search events
      if (!filters.type || filters.type === 'events') {
        const { data: events, count } = await supabase
          .from('events')
          .select('*', { count: 'exact' })
          .or(`title.ilike.%${query}%,description.ilike.%${query}%,location.ilike.%${query}%`)
          .range(offset, offset + limit - 1);

        if (events) {
          const eventResults = events.map(event => ({
            id: event.id,
            type: 'event' as const,
            title: event.title,
            description: event.description,
            metadata: {
              start_time: event.start_time,
              location: event.location,
              is_virtual: event.is_virtual,
              attendee_count: event.attendee_count
            }
          }));
          results.push(...eventResults);
          total += count || 0;
        }
      }

      // Generate search suggestions (simple implementation)
      const suggestions = await this.generateSearchSuggestions(query);

      return {
        results: results.slice(0, limit),
        total,
        suggestions
      };
    } catch (error) {
      console.error('Search error:', error);
      return {
        results: [],
        total: 0,
        suggestions: []
      };
    }
  }

  // Get trending topics
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

  // Get recommended communities based on user interests
  async getRecommendedCommunities(limit = 5): Promise<SearchResult[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get user's interests from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('interests, major')
        .eq('user_id', user.id)
        .single();

      let query = supabase
        .from('communities_enhanced')
        .select('*')
        .eq('is_private', false)
        .limit(limit);

      // Filter by user's major or interests if available
      if (profile?.major) {
        query = query.or(`description.ilike.%${profile.major}%,name.ilike.%${profile.major}%`);
      }

      const { data: communities, error } = await query;

      if (error) throw error;

      return (communities || []).map(community => ({
        id: community.id,
        type: 'community' as const,
        title: community.name,
        description: community.description,
        image: community.avatar_url,
        metadata: {
          member_count: community.member_count,
          is_private: community.is_private
        }
      }));
    } catch (error) {
      console.error('Error fetching recommended communities:', error);
      return [];
    }
  }

  // Generate search suggestions
  private async generateSearchSuggestions(query: string): Promise<string[]> {
    try {
      const suggestions: string[] = [];

      // Get popular hashtags that match the query
      const { data: hashtags } = await supabase
        .from('hashtags')
        .select('name')
        .ilike('name', `%${query}%`)
        .order('usage_count', { ascending: false })
        .limit(5);

      if (hashtags) {
        suggestions.push(...hashtags.map(h => h.name));
      }

      // Get community names that match
      const { data: communities } = await supabase
        .from('communities_enhanced')
        .select('name')
        .ilike('name', `%${query}%`)
        .limit(3);

      if (communities) {
        suggestions.push(...communities.map(c => c.name));
      }

      return [...new Set(suggestions)].slice(0, 8);
    } catch (error) {
      console.error('Error generating suggestions:', error);
      return [];
    }
  }

  // Search users by skills or interests
  async searchUsersBySkills(skills: string[]): Promise<SearchResult[]> {
    try {
      const { data: users, error } = await supabase
        .from('profiles')
        .select('user_id, display_name, bio, avatar_url, skills, interests')
        .overlaps('skills', skills);

      if (error) throw error;

      return (users || []).map(user => ({
        id: user.user_id,
        type: 'user' as const,
        title: user.display_name || 'Anonymous User',
        description: user.bio,
        image: user.avatar_url,
        metadata: {
          skills: user.skills,
          interests: user.interests
        }
      }));
    } catch (error) {
      console.error('Error searching users by skills:', error);
      return [];
    }
  }
}

export const enhancedSearchService = new EnhancedSearchService();
