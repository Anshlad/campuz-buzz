
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, Plus } from 'lucide-react';

export const EventCalendar = () => {
  const [view, setView] = useState<'month' | 'week'>('month');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const events = [
    {
      id: '1',
      title: 'CS Department Career Fair',
      date: '2024-03-15',
      time: '10:00 AM - 4:00 PM',
      location: 'Student Center',
      attendees: 150,
      category: 'Career',
      rsvpStatus: 'attending'
    },
    {
      id: '2',
      title: 'Machine Learning Workshop',
      date: '2024-03-18',
      time: '2:00 PM - 5:00 PM',
      location: 'Engineering Hall Room 201',
      attendees: 45,
      category: 'Academic',
      rsvpStatus: 'maybe'
    },
    {
      id: '3',
      title: 'Spring Break Party Planning',
      date: '2024-03-20',
      time: '7:00 PM - 9:00 PM',
      location: 'Student Lounge',
      attendees: 25,
      category: 'Social',
      rsvpStatus: null
    },
    {
      id: '4',
      title: 'Hackathon 2024',
      date: '2024-03-22',
      time: '9:00 AM - 11:59 PM',
      location: 'Computer Science Building',
      attendees: 200,
      category: 'Competition',
      rsvpStatus: 'attending'
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Academic': return 'bg-blue-100 text-blue-800';
      case 'Career': return 'bg-green-100 text-green-800';
      case 'Social': return 'bg-purple-100 text-purple-800';
      case 'Competition': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRsvpColor = (status: string | null) => {
    switch (status) {
      case 'attending': return 'default';
      case 'maybe': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Event Calendar</h1>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={view === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('month')}
            >
              Month
            </Button>
            <Button
              variant={view === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setView('week')}
            >
              Week
            </Button>
          </div>
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </div>
      </div>

      {/* Calendar Grid - Simplified for demo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>March 2024</span>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">&lt;</Button>
              <Button variant="outline" size="sm">Today</Button>
              <Button variant="outline" size="sm">&gt;</Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 35 }, (_, i) => {
              const day = i - 2; // Start from day -2 to show previous month days
              const isCurrentMonth = day > 0 && day <= 31;
              const hasEvents = isCurrentMonth && [15, 18, 20, 22].includes(day);
              
              return (
                <div 
                  key={i} 
                  className={`aspect-square p-1 border border-gray-100 ${
                    isCurrentMonth ? 'bg-white' : 'bg-gray-50'
                  } ${hasEvents ? 'bg-blue-50' : ''}`}
                >
                  <div className={`text-sm ${isCurrentMonth ? 'text-gray-900' : 'text-gray-300'}`}>
                    {isCurrentMonth ? day : ''}
                  </div>
                  {hasEvents && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1"></div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {events.map((event) => (
              <div key={event.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{event.title}</h3>
                  <Badge className={getCategoryColor(event.category)}>
                    {event.category}
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{event.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    <span>{event.attendees} attending</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-4">
                  <Badge variant={getRsvpColor(event.rsvpStatus)}>
                    {event.rsvpStatus ? 
                      event.rsvpStatus.charAt(0).toUpperCase() + event.rsvpStatus.slice(1) : 
                      'Not responded'
                    }
                  </Badge>
                  <div className="space-x-2">
                    <Button variant="outline" size="sm">View Details</Button>
                    <Button size="sm">RSVP</Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full justify-start" variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Create New Event
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              View My Events
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Browse Study Sessions
            </Button>
            
            <div className="pt-4 border-t">
              <h4 className="font-medium text-gray-900 mb-3">Event Categories</h4>
              <div className="space-y-2">
                {['Academic', 'Career', 'Social', 'Competition'].map((category) => (
                  <div key={category} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{category}</span>
                    <Badge className={getCategoryColor(category)} variant="secondary">
                      {events.filter(e => e.category === category).length}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
