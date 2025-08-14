
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, XCircle, Users } from 'lucide-react';
import { useEventRSVP } from '@/hooks/useEvents';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface EventRSVPButtonProps {
  eventId: string;
  currentStatus?: 'going' | 'maybe' | 'not_going' | null;
  attendeeCount: number;
  disabled?: boolean;
  size?: 'sm' | 'default' | 'lg';
}

export const EventRSVPButton: React.FC<EventRSVPButtonProps> = ({
  eventId,
  currentStatus,
  attendeeCount,
  disabled = false,
  size = 'default'
}) => {
  const { user } = useAuth();
  const rsvpMutation = useEventRSVP();

  const handleRSVP = async (status: 'going' | 'maybe' | 'not_going') => {
    if (!user) {
      toast.error('Please sign in to RSVP');
      return;
    }

    try {
      await rsvpMutation.mutateAsync({ eventId, status });
      toast.success(`RSVP updated to ${status === 'going' ? 'Going' : status === 'maybe' ? 'Maybe' : 'Not Going'}`);
    } catch (error) {
      toast.error('Failed to update RSVP');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'going': return <CheckCircle className="h-4 w-4" />;
      case 'maybe': return <Clock className="h-4 w-4" />;
      case 'not_going': return <XCircle className="h-4 w-4" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'going': return 'bg-green-500 hover:bg-green-600';
      case 'maybe': return 'bg-yellow-500 hover:bg-yellow-600';
      case 'not_going': return 'bg-red-500 hover:bg-red-600';
      default: return 'bg-blue-500 hover:bg-blue-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'going': return 'Going';
      case 'maybe': return 'Maybe';
      case 'not_going': return 'Not Going';
      default: return 'RSVP';
    }
  };

  if (!user) {
    return (
      <div className="flex items-center space-x-2">
        <Badge variant="outline" className="flex items-center space-x-1">
          <Users className="h-3 w-3" />
          <span>{attendeeCount} attending</span>
        </Badge>
        <Button variant="outline" size={size} disabled>
          Sign in to RSVP
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <Badge variant="outline" className="flex items-center space-x-1">
        <Users className="h-3 w-3" />
        <span>{attendeeCount} attending</span>
      </Badge>
      
      <div className="flex items-center space-x-1">
        <Button
          variant={currentStatus === 'going' ? 'default' : 'outline'}
          size={size}
          onClick={() => handleRSVP('going')}
          disabled={disabled || rsvpMutation.isPending}
          className={currentStatus === 'going' ? getStatusColor('going') : ''}
        >
          {getStatusIcon('going')}
          <span className="ml-1">Going</span>
        </Button>
        
        <Button
          variant={currentStatus === 'maybe' ? 'default' : 'outline'}
          size={size}
          onClick={() => handleRSVP('maybe')}
          disabled={disabled || rsvpMutation.isPending}
          className={currentStatus === 'maybe' ? getStatusColor('maybe') : ''}
        >
          {getStatusIcon('maybe')}
          <span className="ml-1">Maybe</span>
        </Button>
        
        <Button
          variant={currentStatus === 'not_going' ? 'default' : 'outline'}
          size={size}
          onClick={() => handleRSVP('not_going')}
          disabled={disabled || rsvpMutation.isPending}
          className={currentStatus === 'not_going' ? getStatusColor('not_going') : ''}
        >
          {getStatusIcon('not_going')}
          <span className="ml-1">Pass</span>
        </Button>
      </div>
    </div>
  );
};
