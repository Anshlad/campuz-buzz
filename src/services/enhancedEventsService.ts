
import { supabase } from '@/integrations/supabase/client';

export interface EventAttendee {
  id: string;
  event_id: string;
  user_id: string;
  status: 'going' | 'maybe' | 'not_going';
  created_at: string;
  user_profile: {
    user_id: string;
    display_name: string;
    avatar_url?: string;
    major?: string;
    year?: string;
  };
}

export interface EnhancedEventData {
  id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  is_virtual: boolean;
  meeting_link?: string;
  max_attendees?: number;
  attendee_count: number;
  is_public: boolean;
  event_type: string;
  tags?: string[];
  image_url?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  user_rsvp_status?: 'going' | 'maybe' | 'not_going';
  is_attending: boolean;
}

export class EnhancedEventsService {
  static async getEventAttendees(eventId: string): Promise<EventAttendee[]> {
    try {
      const { data, error } = await supabase
        .from('event_rsvps')
        .select(`
          id,
          event_id,
          user_id,
          status,
          created_at,
          profiles:user_id (
            user_id,
            display_name,
            avatar_url,
            major,
            year
          )
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching event attendees:', error);
        throw error;
      }

      return (data || []).map(attendee => ({
        id: attendee.id,
        event_id: attendee.event_id,
        user_id: attendee.user_id,
        status: attendee.status as 'going' | 'maybe' | 'not_going',
        created_at: attendee.created_at,
        user_profile: {
          user_id: attendee.profiles?.user_id || attendee.user_id,
          display_name: attendee.profiles?.display_name || 'Anonymous User',
          avatar_url: attendee.profiles?.avatar_url,
          major: attendee.profiles?.major,
          year: attendee.profiles?.year,
        }
      }));
    } catch (error) {
      console.error('Error in getEventAttendees:', error);
      throw error;
    }
  }

  static async getEvents(filters?: {
    upcoming?: boolean;
    attending?: boolean;
    community_id?: string;
  }): Promise<EnhancedEventData[]> {
    try {
      let query = supabase
        .from('events')
        .select('*')
        .order('start_time', { ascending: true });

      if (filters?.upcoming) {
        query = query.gte('start_time', new Date().toISOString());
      }

      if (filters?.community_id) {
        query = query.eq('community_id', filters.community_id);
      }

      const { data: eventsData, error } = await query;

      if (error) throw error;

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      // Get RSVP status for each event if user is authenticated
      const eventsWithRSVP = await Promise.all(
        (eventsData || []).map(async (event) => {
          let user_rsvp_status: 'going' | 'maybe' | 'not_going' | undefined;
          let is_attending = false;
          
          if (userId) {
            const { data: rsvp } = await supabase
              .from('event_rsvps')
              .select('status')
              .eq('event_id', event.id)
              .eq('user_id', userId)
              .single();
            
            if (rsvp) {
              user_rsvp_status = rsvp.status as 'going' | 'maybe' | 'not_going';
              is_attending = rsvp.status === 'going';
            }
          }

          // Filter by attending status if requested
          if (filters?.attending && !is_attending) {
            return null;
          }

          return {
            ...event,
            user_rsvp_status,
            is_attending
          } as EnhancedEventData;
        })
      );

      return eventsWithRSVP.filter(Boolean) as EnhancedEventData[];
    } catch (error) {
      console.error('Error in getEvents:', error);
      throw error;
    }
  }

  static async rsvpToEvent(eventId: string, status: 'going' | 'maybe' | 'not_going'): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check if RSVP already exists
      const { data: existingRSVP } = await supabase
        .from('event_rsvps')
        .select('id, status')
        .eq('event_id', eventId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingRSVP) {
        // Update existing RSVP
        const { error } = await supabase
          .from('event_rsvps')
          .update({ status })
          .eq('id', existingRSVP.id);

        if (error) throw error;
      } else {
        // Create new RSVP
        const { error } = await supabase
          .from('event_rsvps')
          .insert({
            event_id: eventId,
            user_id: user.id,
            status
          });

        if (error) throw error;
      }

      // The trigger will automatically update the attendee count
    } catch (error) {
      console.error('Error in rsvpToEvent:', error);
      throw error;
    }
  }

  static async createEvent(eventData: {
    title: string;
    description?: string;
    start_time: string;
    end_time: string;
    location?: string;
    is_virtual?: boolean;
    meeting_link?: string;
    max_attendees?: number;
    is_public?: boolean;
    event_type?: string;
    tags?: string[];
    image_url?: string;
    community_id?: string;
  }): Promise<EnhancedEventData> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('events')
        .insert({
          ...eventData,
          created_by: user.id,
          attendee_count: 0,
          is_public: eventData.is_public ?? true,
          event_type: eventData.event_type || 'study_session',
          tags: eventData.tags || []
        })
        .select()
        .single();

      if (error) throw error;

      return {
        ...data,
        is_attending: false,
        user_rsvp_status: undefined
      } as EnhancedEventData;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }
}
