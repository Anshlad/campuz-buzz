
import { supabase } from '@/integrations/supabase/client';
import { realtimeNotificationsService } from './realtimeNotificationsService';

export interface EnhancedEvent {
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
  created_by: string;
  community_id?: string;
  created_at: string;
  updated_at: string;
  user_rsvp?: EventRSVP;
}

export interface EventRSVP {
  id: string;
  event_id: string;
  user_id: string;
  status: 'going' | 'maybe' | 'not_going';
  created_at: string;
}

export interface EventCreateData {
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  is_virtual?: boolean;
  meeting_link?: string;
  max_attendees?: number;
  is_public?: boolean;
  event_type: string;
  tags?: string[];
  community_id?: string;
}

class EnhancedEventService {
  // Get events with RSVP status
  async getEvents(
    page = 0,
    limit = 10,
    filters?: {
      community_id?: string;
      event_type?: string;
      upcoming_only?: boolean;
    }
  ): Promise<{ events: EnhancedEvent[]; total: number }> {
    try {
      let query = supabase
        .from('events')
        .select('*', { count: 'exact' })
        .order('start_time', { ascending: true });

      if (filters?.community_id) {
        query = query.eq('community_id', filters.community_id);
      }

      if (filters?.event_type) {
        query = query.eq('event_type', filters.event_type);
      }

      if (filters?.upcoming_only) {
        query = query.gte('start_time', new Date().toISOString());
      }

      const { data: eventsData, error, count } = await query
        .range(page * limit, (page + 1) * limit - 1);

      if (error) throw error;

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id;

      // Get RSVP status for each event
      const eventsWithRSVP = await Promise.all(
        (eventsData || []).map(async (event) => {
          let userRsvp = null;
          
          if (userId) {
            const { data: rsvp } = await supabase
              .from('event_rsvps')
              .select('*')
              .eq('event_id', event.id)
              .eq('user_id', userId)
              .single();
            
            userRsvp = rsvp;
          }

          return {
            ...event,
            user_rsvp: userRsvp
          } as EnhancedEvent;
        })
      );

      return {
        events: eventsWithRSVP,
        total: count || 0
      };
    } catch (error) {
      console.error('Error fetching events:', error);
      return { events: [], total: 0 };
    }
  }

  // Create event
  async createEvent(eventData: EventCreateData): Promise<EnhancedEvent> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('events')
        .insert({
          ...eventData,
          created_by: user.id,
          attendee_count: 0
        })
        .select()
        .single();

      if (error) throw error;

      // Notify community members if it's a community event
      if (eventData.community_id) {
        const { data: members } = await supabase
          .from('community_members')
          .select('user_id')
          .eq('community_id', eventData.community_id)
          .neq('user_id', user.id);

        for (const member of members || []) {
          await realtimeNotificationsService.createNotification(
            member.user_id,
            'event',
            'New Event Created',
            `A new event "${data.title}" has been created in your community`,
            { event_id: data.id }
          );
        }
      }

      return data as EnhancedEvent;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  // RSVP to event
  async rsvpToEvent(eventId: string, status: 'going' | 'maybe' | 'not_going'): Promise<EventRSVP> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('event_rsvps')
        .upsert({
          event_id: eventId,
          user_id: user.id,
          status
        })
        .select()
        .single();

      if (error) throw error;

      // Update attendee count for 'going' status
      if (status === 'going') {
        const { error: countError } = await supabase
          .rpc('update_event_attendee_count', { event_id: eventId });
          
        if (countError) {
          console.warn('Error updating attendee count:', countError);
        }
      }

      // Notify event creator
      const { data: event } = await supabase
        .from('events')
        .select('title, created_by')
        .eq('id', eventId)
        .single();

      if (event && event.created_by !== user.id) {
        const statusText = status === 'going' ? 'will attend' : 
                          status === 'maybe' ? 'might attend' : 'cannot attend';
        
        await realtimeNotificationsService.createNotification(
          event.created_by,
          'event',
          'Event RSVP Update',
          `Someone ${statusText} your event "${event.title}"`,
          { event_id: eventId, status }
        );
      }

      return data as EventRSVP;
    } catch (error) {
      console.error('Error RSVPing to event:', error);
      throw error;
    }
  }

  // Generate calendar file (ICS format)
  generateICSFile(event: EnhancedEvent): string {
    const formatDate = (dateString: string) => {
      return new Date(dateString).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//CampuzBuzz//Event Calendar//EN',
      'BEGIN:VEVENT',
      `UID:${event.id}@campuzbuzz.com`,
      `DTSTART:${formatDate(event.start_time)}`,
      `DTEND:${formatDate(event.end_time)}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description || ''}`,
      `LOCATION:${event.location || ''}`,
      `CREATED:${formatDate(event.created_at)}`,
      `LAST-MODIFIED:${formatDate(event.updated_at)}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    return icsContent;
  }

  // Download ICS file
  downloadICSFile(event: EnhancedEvent) {
    const icsContent = this.generateICSFile(event);
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Generate Google Calendar link
  generateGoogleCalendarLink(event: EnhancedEvent): string {
    const startDate = new Date(event.start_time).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDate = new Date(event.end_time).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.title,
      dates: `${startDate}/${endDate}`,
      details: event.description || '',
      location: event.location || ''
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  }
}

export const enhancedEventService = new EnhancedEventService();
