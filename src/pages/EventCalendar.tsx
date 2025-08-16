import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, MapPin, Users, Plus, Search, Filter } from 'lucide-react';
import { EventCard } from '@/components/events/EventCard';
import { EventAttendeesList } from '@/components/events/EventAttendeesList';
import { useEvents, useEventRealtime } from '@/hooks/useEvents';
import { Event } from '@/services/eventService';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { EventRSVPButton } from '@/components/events/EventRSVPButton';
import { CreateEventModal } from '@/components/events/CreateEventModal';
import { CalendarIntegration } from '@/components/events/CalendarIntegration';

export const EventCalendar = () => {
  const [view, setView] = useState<'month' | 'week' | 'list'>('month');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  const [showUpcomingOnly, setShowUpcomingOnly] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filters = {
    event_type: eventTypeFilter !== 'all' ? eventTypeFilter : undefined,
    upcoming_only: showUpcomingOnly,
  };

  const { events, isLoading, hasMore, loadMore } = useEvents(filters);

  // Enable real-time updates
  useEventRealtime();

  const eventsByDate = events.reduce((acc, event) => {
    const dateKey = format(new Date(event.start_time), 'yyyy-MM-dd');
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(event);
    return acc;
  }, {} as Record<string, Event[]>);

  const filteredEvents = events.filter(event =>
    !searchQuery || 
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderCalendarGrid = () => {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Add days from previous month to fill the first week
    const firstDayOfWeek = monthStart.getDay();
    const prevMonthDays = [];
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = new Date(monthStart);
      day.setDate(day.getDate() - i - 1);
      prevMonthDays.push(day);
    }

    // Add days from next month to fill the last week
    const lastDayOfWeek = monthEnd.getDay();
    const nextMonthDays = [];
    for (let i = 1; i <= 6 - lastDayOfWeek; i++) {
      const day = new Date(monthEnd);
      day.setDate(day.getDate() + i);
      nextMonthDays.push(day);
    }

    const allDays = [...prevMonthDays, ...calendarDays, ...nextMonthDays];

    return (
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 border-b">
            {day}
          </div>
        ))}
        
        {allDays.map((day, index) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const dayEvents = eventsByDate[dateKey] || [];
          const isCurrentMonth = isSameMonth(day, selectedDate);
          const isDayToday = isToday(day);
          
          return (
            <div 
              key={index} 
              className={`min-h-24 p-1 border border-gray-100 ${
                isCurrentMonth ? 'bg-white' : 'bg-gray-50'
              } ${isDayToday ? 'bg-blue-50 border-blue-200' : ''}`}
            >
              <div className={`text-sm mb-1 ${
                isCurrentMonth ? 'text-gray-900' : 'text-gray-300'
              } ${isDayToday ? 'font-bold text-blue-600' : ''}`}>
                {format(day, 'd')}
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 2).map((event) => (
                  <div
                    key={event.id}
                    className="text-xs p-1 bg-blue-100 text-blue-800 rounded truncate cursor-pointer hover:bg-blue-200"
                    onClick={() => setSelectedEvent(event)}
                    title={event.title}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-xs text-gray-500">
                    +{dayEvents.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Event Calendar</h1>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full lg:w-auto">
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-2">
            <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="study_session">Study</SelectItem>
                <SelectItem value="social">Social</SelectItem>
                <SelectItem value="career">Career</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant={showUpcomingOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setShowUpcomingOnly(!showUpcomingOnly)}
            >
              <Filter className="h-4 w-4 mr-1" />
              Upcoming Only
            </Button>
          </div>

          {/* View Toggle */}
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={view === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('month')}
            >
              Month
            </Button>
            <Button
              variant={view === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('list')}
            >
              List
            </Button>
          </div>

          <Button 
            className="bg-gradient-to-r from-blue-600 to-indigo-600"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Calendar/Events List */}
        <div className="xl:col-span-3">
          {view === 'month' ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{format(selectedDate, 'MMMM yyyy')}</span>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1))}
                    >
                      &lt;
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedDate(new Date())}
                    >
                      Today
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1))}
                    >
                      &gt;
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderCalendarGrid()}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">
                {searchQuery ? `Search Results (${filteredEvents.length})` : 'Upcoming Events'}
              </h2>
              {isLoading ? (
                <div className="grid gap-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="space-y-3">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredEvents.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
                    <p className="text-gray-500 mb-4">
                      {searchQuery ? 'Try adjusting your search terms' : 'No events match your current filters'}
                    </p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Event
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {filteredEvents.map((event) => (
                    <EventCard
                      key={event.id}
                      event={event}
                      onEventClick={setSelectedEvent}
                    />
                  ))}
                  {hasMore && (
                    <div className="text-center">
                      <Button variant="outline" onClick={loadMore}>
                        Load More Events
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {selectedEvent && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Event Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">{selectedEvent.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {selectedEvent.description}
                  </p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{format(new Date(selectedEvent.start_time), 'PPP')}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>
                        {format(new Date(selectedEvent.start_time), 'p')} - 
                        {format(new Date(selectedEvent.end_time), 'p')}
                      </span>
                    </div>
                    {selectedEvent.location && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4" />
                        <span>{selectedEvent.location}</span>
                      </div>
                    )}
                  </div>
                </div>

                <CalendarIntegration event={selectedEvent} />
                
                <EventRSVPButton
                  eventId={selectedEvent.id}
                  attendeeCount={selectedEvent.attendee_count}
                />
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create Event
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                My Events
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Users className="h-4 w-4 mr-2" />
                Study Sessions
              </Button>
            </CardContent>
          </Card>

          {/* Event Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">This Month</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Study Sessions</span>
                <Badge variant="secondary">
                  {events.filter(e => e.event_type === 'study_session').length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Social Events</span>
                <Badge variant="secondary">
                  {events.filter(e => e.event_type === 'social').length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Career Events</span>
                <Badge variant="secondary">
                  {events.filter(e => e.event_type === 'career').length}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Academic</span>
                <Badge variant="secondary">
                  {events.filter(e => e.event_type === 'academic').length}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Event Modal */}
      <CreateEventModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onEventCreated={() => {
          setShowCreateModal(false);
          // Refresh events would be handled by React Query
        }}
      />
    </div>
  );
};
