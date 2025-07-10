import { supabase } from "@/integrations/supabase/client";

export interface StudySuggestion {
  suggestion_type: string;
  title: string;
  description: string;
  relevance_score: number;
}

export interface AutoTagResult {
  suggestedTags: string[];
  suggestedCommunities: string[];
  confidence: number;
}

export class AIService {
  // Get AI-powered study suggestions
  static async getStudySuggestions(userId: string): Promise<StudySuggestion[]> {
    try {
      // In a real app, this would call an AI service
      // For now, we'll use the database function
      const { data, error } = await supabase.rpc('get_study_suggestions', {
        user_uuid: userId
      });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting study suggestions:', error);
      return [];
    }
  }

  // Smart auto-tagging for posts
  static async autoTagPost(content: string, title?: string): Promise<AutoTagResult> {
    try {
      // Mock AI auto-tagging logic
      const text = `${title || ''} ${content}`.toLowerCase();
      const suggestedTags: string[] = [];
      const suggestedCommunities: string[] = [];

      // Simple keyword matching (in real app, this would use NLP)
      const tagKeywords = {
        'study': ['study', 'exam', 'test', 'midterm', 'final', 'review'],
        'programming': ['code', 'coding', 'javascript', 'python', 'react', 'programming'],
        'math': ['math', 'calculus', 'algebra', 'geometry', 'statistics'],
        'science': ['biology', 'chemistry', 'physics', 'lab', 'experiment'],
        'career': ['internship', 'job', 'career', 'interview', 'resume'],
        'social': ['party', 'event', 'meetup', 'hangout', 'social'],
        'help': ['help', 'need', 'stuck', 'confused', 'question']
      };

      const communityKeywords = {
        'Computer Science': ['programming', 'coding', 'software', 'cs', 'computer'],
        'Mathematics': ['math', 'calculus', 'algebra', 'statistics'],
        'Biology': ['biology', 'bio', 'life science', 'anatomy'],
        'Study Groups': ['study', 'group study', 'review session'],
        'Career Center': ['career', 'internship', 'job', 'professional']
      };

      // Check for tag matches
      Object.entries(tagKeywords).forEach(([tag, keywords]) => {
        if (keywords.some(keyword => text.includes(keyword))) {
          suggestedTags.push(tag);
        }
      });

      // Check for community matches
      Object.entries(communityKeywords).forEach(([community, keywords]) => {
        if (keywords.some(keyword => text.includes(keyword))) {
          suggestedCommunities.push(community);
        }
      });

      return {
        suggestedTags: suggestedTags.slice(0, 5), // Limit to 5 suggestions
        suggestedCommunities: suggestedCommunities.slice(0, 3),
        confidence: Math.min(0.9, (suggestedTags.length + suggestedCommunities.length) * 0.2)
      };
    } catch (error) {
      console.error('Error in auto-tagging:', error);
      return { suggestedTags: [], suggestedCommunities: [], confidence: 0 };
    }
  }

  // Get trending topics (mock implementation)
  static async getTrendingTopics(): Promise<Array<{ topic: string; count: number }>> {
    return [
      { topic: 'Final Exams', count: 45 },
      { topic: 'Spring Break', count: 32 },
      { topic: 'React Tutorial', count: 28 },
      { topic: 'Study Group', count: 25 },
      { topic: 'Career Fair', count: 22 }
    ];
  }

  // Get personalized feed recommendations
  static async getPersonalizedRecommendations(userId: string): Promise<any[]> {
    try {
      // This would normally use AI to personalize content
      // For now, we'll return posts based on user's communities and interests
      const { data: posts, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_user_id_fkey(display_name, avatar_url, major, year),
          communities(name)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return posts || [];
    } catch (error) {
      console.error('Error getting personalized recommendations:', error);
      return [];
    }
  }

  // Generate mentorship matches
  static async generateMentorshipMatches(userId: string): Promise<any[]> {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('major, year, engagement_score')
        .eq('user_id', userId)
        .single();

      if (!profile) return [];

      // Find potential mentors (seniors in same major with high engagement)
      const { data: mentors, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('major', profile.major)
        .gt('engagement_score', 50)
        .neq('user_id', userId)
        .limit(5);

      if (error) throw error;

      return mentors?.map(mentor => ({
        ...mentor,
        match_score: Math.floor(Math.random() * 40) + 60 // Mock matching score
      })) || [];
    } catch (error) {
      console.error('Error generating mentorship matches:', error);
      return [];
    }
  }
}