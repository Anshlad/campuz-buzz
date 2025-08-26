
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, Clock, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { EnhancedEventsService, EventAttendee } from '@/services/enhancedEventsService';
import { useToast } from '@/hooks/use-toast';

interface EventAttendeesListProps {
  eventId: string;
}

export const EventAttendeesList: React.FC<EventAttendeesListProps> = ({ eventId }) => {
  const [attendees, setAttendees] = useState<EventAttendee[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadAttendees();
  }, [eventId]);

  const loadAttendees = async () => {
    try {
      setLoading(true);
      const attendeesData = await EnhancedEventsService.getEventAttendees(eventId);
      setAttendees(attendeesData);
    } catch (error) {
      console.error('Error loading attendees:', error);
      toast({
        title: "Error loading attendees",
        description: "Please try refreshing the page.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'going': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'maybe': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'not_going': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'going': return 'Going';
      case 'maybe': return 'Maybe';
      case 'not_going': return 'Not Going';
      default: return '';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'going': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'maybe': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      case 'not_going': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  const groupedAttendees = attendees.reduce((acc, attendee) => {
    if (!acc[attendee.status]) {
      acc[attendee.status] = [];
    }
    acc[attendee.status].push(attendee);
    return acc;
  }, {} as Record<string, EventAttendee[]>);

  const displayLimit = 6;
  const shouldTruncate = attendees.length > displayLimit;
  const displayAttendees = showAll ? attendees : attendees.slice(0, displayLimit);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Attendees</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-muted rounded-full"></div>
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (attendees.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Attendees</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">No RSVPs yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Attendees ({attendees.length})</span>
          <div className="flex items-center space-x-2">
            {groupedAttendees.going && (
              <Badge className={getStatusColor('going')}>
                {groupedAttendees.going.length} Going
              </Badge>
            )}
            {groupedAttendees.maybe && (
              <Badge className={getStatusColor('maybe')}>
                {groupedAttendees.maybe.length} Maybe
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayAttendees.map((attendee) => (
            <div key={attendee.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={attendee.user_profile.avatar_url} />
                  <AvatarFallback>
                    {attendee.user_profile.display_name?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">
                    {attendee.user_profile.display_name}
                  </p>
                  {attendee.user_profile.major && (
                    <p className="text-xs text-muted-foreground">
                      {attendee.user_profile.major}
                      {attendee.user_profile.year && ` - ${attendee.user_profile.year}`}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(attendee.status)}
                <Badge className={getStatusColor(attendee.status)} variant="secondary">
                  {getStatusText(attendee.status)}
                </Badge>
              </div>
            </div>
          ))}
        </div>

        {shouldTruncate && (
          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAll(!showAll)}
              className="text-primary hover:text-primary/80"
            >
              {showAll ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Show All ({attendees.length - displayLimit} more)
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
