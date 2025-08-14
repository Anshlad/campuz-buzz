
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Users, ExternalLink } from 'lucide-react';
import { EventRSVPButton } from './EventRSVPButton';
import { EventService, Event } from '@/services/eventService';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface EventCardProps {
  event: Event & { userRsvp?: any };
  showRSVP?: boolean;
  onEventClick?: (event: Event) => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  showRSVP = true,
  onEventClick
}) => {
  const getCategoryColor = (eventType: string) => {
    switch (eventType) {
      case 'study_session': return 'bg-blue-100 text-blue-800';
      case 'social': return 'bg-purple-100 text-purple-800';
      case 'career': return 'bg-green-100 text-green-800';
      case 'academic': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddToCalendar = async (type: 'google' | 'outlook') => {
    try {
      let calendarUrl: string;
      
      if (type === 'google') {
        calendarUrl = EventService.generateGoogleCalendarLink(event);
      } else {
        calendarUrl = EventService.generateOutlookCalendarLink(event);
      }
      
      window.open(calendarUrl, '_blank');
    } catch (error) {
      toast.error('Failed to add to calendar');
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle 
              className="text-lg font-semibold cursor-pointer hover:text-blue-600 transition-colors"
              onClick={() => onEventClick?.(event)}
            >
              {event.title}
            </CardTitle>
            <div className="flex items-center space-x-2 mt-2">
              <Badge className={getCategoryColor(event.event_type)}>
                {event.event_type.replace('_', ' ')}
              </Badge>
              {event.is_virtual && (
                <Badge variant="outline">Virtual</Badge>
              )}
              {event.max_attendees && (
                <Badge variant="outline">
                  Limited ({event.attendee_count}/{event.max_attendees})
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {event.description && (
          <p className="text-sm text-gray-600 line-clamp-2">{event.description}</p>
        )}

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{format(new Date(event.start_time), 'PPP')}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>
              {format(new Date(event.start_time), 'p')} - {format(new Date(event.end_time), 'p')}
            </span>
          </div>
          {event.location && (
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
        </div>

        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {event.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {event.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{event.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t">
          {showRSVP && (
            <EventRSVPButton
              eventId={event.id}
              currentStatus={event.userRsvp?.status}
              attendeeCount={event.attendee_count}
              size="sm"
            />
          )}
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddToCalendar('google')}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Google
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddToCalendar('outlook')}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Outlook
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
