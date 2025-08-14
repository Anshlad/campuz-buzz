
import { supabase } from "@/integrations/supabase/client";
import { NotificationService } from "./notificationService";

export interface Event {
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
  google_calendar_id?: string;
  outlook_calendar_id?: string;
  created_at: string;
  updated_at: string;
}

export interface EventRSVP {
  id: string;
  event_id: string;
  user_id: string;
  status: 'going' | 'maybe' | 'not_going';
  created_at: string;
}

export class EventService {
  // Get events with pagination
  static async getEvents(
    page = 0,
    limit = 10,
    filters?: {
      community_id?: string;
      event_type?: string;
      upcoming_only?: boolean;
    }
  ): Promise<{ events: Event[]; total: number }> {
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

      const { data, error, count } = await query
        .range(page * limit, (page + 1) * limit - 1);

      if (error) throw error;

      return {
        events: data || [],
        total: count || 0
      };
    } catch (error) {
      console.error('Error fetching events:', error);
      return { events: [], total: 0 };
    }
  }

  // Get single event with RSVP status
  static async getEvent(eventId: string, userId?: string): Promise<Event & { userRsvp?: EventRSVP }> {
    try {
      const { data: event, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (error) throw error;

      let userRsvp = null;
      if (userId) {
        const { data: rsvp } = await supabase
          .from('event_rsvps')
          .select('*')
          .eq('event_id', eventId)
          .eq('user_id', userId)
          .single();
        
        userRsvp = rsvp;
      }

      return { ...event, userRsvp };
    } catch (error) {
      console.error('Error fetching event:', error);
      throw error;
    }
  }

  // Create event
  static async createEvent(eventData: Partial<Event>): Promise<Event> {
    try {
      const { data, error } = await supabase
        .from('events')
        .insert(eventData)
        .select()
        .single();

      if (error) throw error;

      // Schedule event notifications
      await this.scheduleEventNotifications(data.id);

      return data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }

  // Update event
  static async updateEvent(eventId: string, updates: Partial<Event>): Promise<Event> {
    try {
      const { data, error } = await supabase
        .from('events')
        .update(updates)
        .eq('id', eventId)
        .select()
        .single();

      if (error) throw error;

      // Notify attendees of event update
      await this.notifyEventUpdate(eventId);

      return data;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  // RSVP to event
  static async rsvpToEvent(eventId: string, userId: string, status: 'going' | 'maybe' | 'not_going'): Promise<EventRSVP> {
    try {
      const { data, error } = await supabase
        .from('event_rsvps')
        .upsert({
          event_id: eventId,
          user_id: userId,
          status
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error RSVPing to event:', error);
      throw error;
    }
  }

  // Get event attendees
  static async getEventAttendees(eventId: string): Promise<Array<EventRSVP & { profile: any }>> {
    try {
      const { data, error } = await supabase
        .from('event_rsvps')
        .select(`
          *,
          profiles!inner(
            user_id,
            display_name,
            avatar_url
          )
        `)
        .eq('event_id', eventId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching event attendees:', error);
      return [];
    }
  }

  // Schedule event notifications
  static async scheduleEventNotifications(eventId: string): Promise<void> {
    try {
      const { data: event } = await supabase
        .from('events')
        .select('start_time')
        .eq('id', eventId)
        .single();

      if (!event) return;

      const startTime = new Date(event.start_time);
      const notifications = [
        {
          type: 'reminder_24h',
          time: new Date(startTime.getTime() - 24 * 60 * 60 * 1000)
        },
        {
          type: 'reminder_1h',
          time: new Date(startTime.getTime() - 60 * 60 * 1000)
        },
        {
          type: 'reminder_15m',
          time: new Date(startTime.getTime() - 15 * 60 * 1000)
        }
      ];

      // Get all attendees
      const { data: attendees } = await supabase
        .from('event_rsvps')
        .select('user_id')
        .eq('event_id', eventId)
        .eq('status', 'going');

      // Schedule notifications for each attendee
      for (const notification of notifications) {
        if (notification.time > new Date()) {
          for (const attendee of attendees || []) {
            await supabase
              .from('event_notifications')
              .insert({
                event_id: eventId,
                user_id: attendee.user_id,
                notification_type: notification.type,
                scheduled_for: notification.time.toISOString()
              });
          }
        }
      }
    } catch (error) {
      console.error('Error scheduling event notifications:', error);
    }
  }

  // Notify event update
  static async notifyEventUpdate(eventId: string): Promise<void> {
    try {
      const { data: attendees } = await supabase
        .from('event_rsvps')
        .select('user_id')
        .eq('event_id', eventId);

      const { data: event } = await supabase
        .from('events')
        .select('title')
        .eq('id', eventId)
        .single();

      for (const attendee of attendees || []) {
        await NotificationService.createNotification(
          attendee.user_id,
          'event_update',
          'Event Updated',
          `The event "${event?.title}" has been updated.`,
          { event_id: eventId }
        );
      }
    } catch (error) {
      console.error('Error notifying event update:', error);
    }
  }

  // Add to Google Calendar
  static async addToGoogleCalendar(eventId: string): Promise<string> {
    try {
      const event = await this.getEvent(eventId);
      
      const googleEvent = {
        summary: event.title,
        description: event.description,
        start: {
          dateTime: event.start_time,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        end: {
          dateTime: event.end_time,
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        location: event.location
      };

      // This would typically call Google Calendar API
      // For now, we'll generate a Google Calendar link
      const googleCalendarUrl = this.generateGoogleCalendarLink(event);
      
      return googleCalendarUrl;
    } catch (error) {
      console.error('Error adding to Google Calendar:', error);
      throw error;
    }
  }

  // Generate Google Calendar link
  static generateGoogleCalendarLink(event: Event): string {
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

  // Generate Outlook Calendar link
  static generateOutlookCalendarLink(event: Event): string {
    const params = new URLSearchParams({
      subject: event.title,
      startdt: event.start_time,
      enddt: event.end_time,
      body: event.description || '',
      location: event.location || ''
    });

    return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
  }
}
