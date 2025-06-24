
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CreateAnnouncementModal } from '@/components/announcements/CreateAnnouncementModal';
import { Megaphone, Pin, Calendar, Building, Plus, Filter } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  author: {
    name: string;
    role: string;
    avatar?: string;
  };
  department: string;
  priority: 'high' | 'medium' | 'low';
  isPinned: boolean;
  timestamp: string;
  expiresAt?: string;
}

export const Announcements = () => {
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    {
      id: '1',
      title: 'Spring Break Schedule Changes',
      content: 'Please note that the library will have modified hours during spring break. Regular hours resume on March 25th. Check the website for detailed schedule.',
      author: {
        name: 'Dr. Anderson',
        role: 'Academic Affairs',
        avatar: '/placeholder.svg'
      },
      department: 'Academic Affairs',
      priority: 'high',
      isPinned: true,
      timestamp: '2 hours ago',
      expiresAt: 'March 30, 2024'
    },
    {
      id: '2',
      title: 'New Computer Lab Equipment',
      content: 'The CS department has installed new high-performance workstations in Lab 301. These are available for advanced coursework and research projects.',
      author: {
        name: 'Prof. Williams',
        role: 'CS Department Head',
        avatar: '/placeholder.svg'
      },
      department: 'Computer Science',
      priority: 'medium',
      isPinned: false,
      timestamp: '1 day ago'
    },
    {
      id: '3',
      title: 'Career Fair Registration Open',
      content: 'Registration is now open for the Spring Career Fair. Over 50 companies will be participating. Register early to secure your preferred time slots.',
      author: {
        name: 'Career Services',
        role: 'Career Center',
        avatar: '/placeholder.svg'
      },
      department: 'Career Services',
      priority: 'high',
      isPinned: true,
      timestamp: '2 days ago',
      expiresAt: 'March 20, 2024'
    },
    {
      id: '4',
      title: 'Campus WiFi Maintenance',
      content: 'Network maintenance will occur this Sunday from 2 AM to 6 AM. WiFi services may be intermittent during this time.',
      author: {
        name: 'IT Services',
        role: 'Information Technology',
        avatar: '/placeholder.svg'
      },
      department: 'IT Services',
      priority: 'medium',
      isPinned: false,
      timestamp: '3 days ago'
    }
  ]);

  const departments = [
    'all',
    'Academic Affairs',
    'Computer Science',
    'Career Services',
    'IT Services',
    'Student Life',
    'Administration'
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredAnnouncements = selectedDepartment === 'all' 
    ? announcements 
    : announcements.filter(ann => ann.department === selectedDepartment);

  const pinnedAnnouncements = filteredAnnouncements.filter(ann => ann.isPinned);
  const regularAnnouncements = filteredAnnouncements.filter(ann => !ann.isPinned);

  const handleNewAnnouncement = (newAnn: any) => {
    const announcement: Announcement = {
      id: Date.now().toString(),
      title: newAnn.title,
      content: newAnn.content,
      author: {
        name: user?.name || 'Admin',
        role: 'Administrator',
        avatar: user?.avatar
      },
      department: newAnn.department,
      priority: newAnn.priority,
      isPinned: newAnn.isPinned,
      timestamp: 'Just now',
      expiresAt: newAnn.expiresAt
    };
    setAnnouncements([announcement, ...announcements]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campus Announcements</h1>
          <p className="text-gray-600">Stay updated with important campus news and updates</p>
        </div>
        {user?.isAdmin && (
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 mt-4 sm:mt-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Announcement
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 overflow-x-auto">
            <Filter className="h-4 w-4 text-gray-500 flex-shrink-0" />
            <span className="text-sm text-gray-600 flex-shrink-0">Department:</span>
            {departments.map((dept) => (
              <Badge
                key={dept}
                variant={selectedDepartment === dept ? "default" : "secondary"}
                className="cursor-pointer whitespace-nowrap"
                onClick={() => setSelectedDepartment(dept)}
              >
                {dept === 'all' ? 'All Departments' : dept}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pinned Announcements */}
      {pinnedAnnouncements.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Pin className="h-5 w-5 text-red-500" />
            <h2 className="text-lg font-semibold text-gray-900">Pinned Announcements</h2>
          </div>
          
          {pinnedAnnouncements.map((announcement) => (
            <Card key={announcement.id} className="border-l-4 border-l-red-500 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={announcement.author.avatar} />
                      <AvatarFallback>{announcement.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{announcement.title}</h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>{announcement.author.name}</span>
                        <span>•</span>
                        <span>{announcement.author.role}</span>
                        <span>•</span>
                        <span>{announcement.timestamp}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Pin className="h-4 w-4 text-red-500" />
                    <Badge className={getPriorityColor(announcement.priority)}>
                      {announcement.priority.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-gray-700 leading-relaxed mb-4">{announcement.content}</p>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4 text-gray-500">
                    <div className="flex items-center">
                      <Building className="h-4 w-4 mr-1" />
                      <span>{announcement.department}</span>
                    </div>
                    {announcement.expiresAt && (
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>Expires: {announcement.expiresAt}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Regular Announcements */}
      <div className="space-y-4">
        {pinnedAnnouncements.length > 0 && (
          <h2 className="text-lg font-semibold text-gray-900">Recent Announcements</h2>
        )}
        
        {regularAnnouncements.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <Megaphone className="h-16 w-16 mx-auto mb-4" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No announcements</h3>
              <p className="text-gray-500">
                {selectedDepartment === 'all' 
                  ? 'No announcements have been posted yet.' 
                  : `No announcements from ${selectedDepartment}.`
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          regularAnnouncements.map((announcement) => (
            <Card key={announcement.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={announcement.author.avatar} />
                      <AvatarFallback>{announcement.author.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-gray-900">{announcement.title}</h3>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span>{announcement.author.name}</span>
                        <span>•</span>
                        <span>{announcement.author.role}</span>
                        <span>•</span>
                        <span>{announcement.timestamp}</span>
                      </div>
                    </div>
                  </div>
                  <Badge className={getPriorityColor(announcement.priority)}>
                    {announcement.priority.toUpperCase()}
                  </Badge>
                </div>
                
                <p className="text-gray-700 leading-relaxed mb-4">{announcement.content}</p>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Building className="h-4 w-4 mr-1" />
                    <span>{announcement.department}</span>
                  </div>
                  {announcement.expiresAt && (
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>Expires: {announcement.expiresAt}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Announcement Modal */}
      {user?.isAdmin && (
        <CreateAnnouncementModal 
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleNewAnnouncement}
        />
      )}
    </div>
  );
};
