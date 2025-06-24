
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Edit, MapPin, Calendar, Mail, BookOpen } from 'lucide-react';

export const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('posts');

  const stats = [
    { label: 'Posts', value: '23' },
    { label: 'Study Groups', value: '4' },
    { label: 'Events Joined', value: '12' },
    { label: 'Connections', value: '156' }
  ];

  const mockPosts = [
    {
      id: '1',
      content: 'Just finished my machine learning project! Anyone else working on neural networks?',
      timestamp: '2 days ago',
      likes: 24,
      comments: 8
    },
    {
      id: '2',
      content: 'Study group session was incredibly productive today. Thanks to everyone who participated!',
      timestamp: '1 week ago',
      likes: 18,
      comments: 5
    }
  ];

  const studyGroups = [
    { name: 'Advanced Algorithms', members: 15, nextSession: 'Tomorrow 3 PM' },
    { name: 'Machine Learning Study Circle', members: 23, nextSession: 'Friday 2 PM' },
    { name: 'Database Design Workshop', members: 12, nextSession: 'Next Week' }
  ];

  const events = [
    { name: 'CS Department Career Fair', date: 'March 15', status: 'Attending' },
    { name: 'Hackathon 2024', date: 'March 22-24', status: 'Maybe' },
    { name: 'Tech Talk: AI in Healthcare', date: 'April 5', status: 'Attending' }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="text-2xl">{user?.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{user?.name}</h1>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center text-gray-600">
                  <BookOpen className="h-4 w-4 mr-2" />
                  <span>{user?.major} • {user?.year}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>{user?.email}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MapPin className="h-4 w-4 mr-2" />
                  <span>Campus University</span>
                </div>
              </div>
              
              {user?.bio && (
                <p className="text-gray-700 mt-3">{user.bio}</p>
              )}
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="groups">Study Groups</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
        </TabsList>
        
        <TabsContent value="posts" className="space-y-4 mt-6">
          {mockPosts.map((post) => (
            <Card key={post.id}>
              <CardContent className="p-6">
                <p className="text-gray-800 mb-3">{post.content}</p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>{post.timestamp}</span>
                  <div className="flex items-center space-x-4">
                    <span>{post.likes} likes</span>
                    <span>{post.comments} comments</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="groups" className="space-y-4 mt-6">
          {studyGroups.map((group, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{group.name}</h3>
                    <p className="text-sm text-gray-500">{group.members} members</p>
                    <p className="text-sm text-blue-600 mt-1">Next: {group.nextSession}</p>
                  </div>
                  <Badge variant="secondary">Active</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="events" className="space-y-4 mt-6">
          {events.map((event, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{event.name}</h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>{event.date}</span>
                    </div>
                  </div>
                  <Badge variant={event.status === 'Attending' ? 'default' : 'secondary'}>
                    {event.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};
