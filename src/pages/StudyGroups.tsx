
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { CreateStudyGroupModal } from '@/components/study-groups/CreateStudyGroupModal';
import { StudyGroupDetails } from '@/components/study-groups/StudyGroupDetails';
import { Users, Calendar, Clock, MapPin, Plus, BookOpen, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface StudyGroup {
  id: string;
  name: string;
  subject: string;
  description: string;
  members: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
  memberCount: number;
  maxMembers: number;
  nextSession: {
    date: string;
    time: string;
    location: string;
  };
  schedule: string;
  topics: string[];
  isJoined: boolean;
  createdBy: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
}

export const StudyGroups = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<StudyGroup | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([
    {
      id: '1',
      name: 'Advanced Algorithms',
      subject: 'Computer Science',
      description: 'Deep dive into complex algorithms and data structures. Perfect for CS 451 students.',
      members: [
        { id: '1', name: 'Sarah Johnson', avatar: '/placeholder.svg' },
        { id: '2', name: 'Mike Chen', avatar: '/placeholder.svg' },
        { id: '3', name: 'Emma Davis', avatar: '/placeholder.svg' }
      ],
      memberCount: 8,
      maxMembers: 15,
      nextSession: {
        date: 'Tomorrow',
        time: '3:00 PM',
        location: 'Library Room 204'
      },
      schedule: 'Tuesdays & Thursdays, 3-5 PM',
      topics: ['Dynamic Programming', 'Graph Algorithms', 'Complexity Analysis'],
      isJoined: true,
      createdBy: 'Prof. Williams',
      difficulty: 'Advanced'
    },
    {
      id: '2',
      name: 'Calculus Study Circle',
      subject: 'Mathematics',
      description: 'Working through calculus problems together. All skill levels welcome!',
      members: [
        { id: '4', name: 'Alex Thompson', avatar: '/placeholder.svg' },
        { id: '5', name: 'Jessica Liu', avatar: '/placeholder.svg' }
      ],
      memberCount: 12,
      maxMembers: 20,
      nextSession: {
        date: 'Friday',
        time: '2:00 PM',
        location: 'Math Building Room 101'
      },
      schedule: 'Mondays & Fridays, 2-4 PM',
      topics: ['Derivatives', 'Integrals', 'Limits', 'Applications'],
      isJoined: false,
      createdBy: 'Student Leader',
      difficulty: 'Intermediate'
    },
    {
      id: '3',
      name: 'Web Development Workshop',
      subject: 'Computer Science',
      description: 'Learn modern web development with React, Node.js, and more. Build real projects!',
      members: [
        { id: '6', name: 'David Park', avatar: '/placeholder.svg' },
        { id: '7', name: 'Lisa Wang', avatar: '/placeholder.svg' },
        { id: '8', name: 'Tom Wilson', avatar: '/placeholder.svg' }
      ],
      memberCount: 25,
      maxMembers: 30,
      nextSession: {
        date: 'Saturday',
        time: '10:00 AM',
        location: 'Computer Lab 301'
      },
      schedule: 'Saturdays, 10 AM - 2 PM',
      topics: ['React', 'Node.js', 'MongoDB', 'REST APIs'],
      isJoined: true,
      createdBy: 'Tech Club',
      difficulty: 'Beginner'
    },
    {
      id: '4',
      name: 'Statistics & Data Analysis',
      subject: 'Mathematics',
      description: 'Statistical methods and data analysis techniques for research projects.',
      members: [
        { id: '9', name: 'Rachel Green', avatar: '/placeholder.svg' }
      ],
      memberCount: 6,
      maxMembers: 12,
      nextSession: {
        date: 'Next Monday',
        time: '4:00 PM',
        location: 'Statistics Lab'
      },
      schedule: 'Mondays, 4-6 PM',
      topics: ['Hypothesis Testing', 'Regression Analysis', 'R Programming'],
      isJoined: false,
      createdBy: 'Dr. Smith',
      difficulty: 'Intermediate'
    }
  ]);

  const handleJoinGroup = (groupId: string) => {
    setStudyGroups(groups => 
      groups.map(group => 
        group.id === groupId 
          ? { ...group, isJoined: !group.isJoined, memberCount: group.isJoined ? group.memberCount - 1 : group.memberCount + 1 }
          : group
      )
    );
  };

  const handleNewGroup = (newGroup: any) => {
    const studyGroup: StudyGroup = {
      id: Date.now().toString(),
      name: newGroup.name,
      subject: newGroup.subject,
      description: newGroup.description,
      members: [],
      memberCount: 1,
      maxMembers: newGroup.maxMembers,
      nextSession: {
        date: 'TBD',
        time: 'TBD',
        location: 'TBD'
      },
      schedule: newGroup.schedule,
      topics: newGroup.topics,
      isJoined: true,
      createdBy: 'You',
      difficulty: newGroup.difficulty
    };
    setStudyGroups([studyGroup, ...studyGroups]);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredGroups = studyGroups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const myGroups = filteredGroups.filter(group => group.isJoined);
  const availableGroups = filteredGroups.filter(group => !group.isJoined);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Study Groups</h1>
          <p className="text-gray-600">Join study groups or create your own to collaborate with peers</p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 mt-4 sm:mt-0"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Group
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search study groups by name, subject, or description..."
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* My Groups */}
      {myGroups.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">My Study Groups</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {myGroups.map((group) => (
              <Card key={group.id} className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{group.name}</h3>
                      <p className="text-sm text-gray-500">{group.subject}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getDifficultyColor(group.difficulty)}>
                        {group.difficulty}
                      </Badge>
                      <Badge variant="secondary">Joined</Badge>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 text-sm mb-4 line-clamp-2">{group.description}</p>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Next: {group.nextSession.date} at {group.nextSession.time}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{group.nextSession.location}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{group.memberCount}/{group.maxMembers} members</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {group.members.slice(0, 3).map((member) => (
                        <Avatar key={member.id} className="h-8 w-8 border-2 border-white">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback className="text-xs">{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      ))}
                      {group.memberCount > 3 && (
                        <div className="h-8 w-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                          <span className="text-xs text-gray-600">+{group.memberCount - 3}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedGroup(group)}
                      >
                        View Details
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleJoinGroup(group.id)}
                      >
                        Leave
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Available Groups */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">
          {myGroups.length > 0 ? 'Discover More Groups' : 'Available Study Groups'}
        </h2>
        
        {availableGroups.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <BookOpen className="h-16 w-16 mx-auto mb-4" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No study groups found</h3>
              <p className="text-gray-500 mb-4">
                {searchQuery 
                  ? `No groups match "${searchQuery}". Try different keywords.`
                  : 'Be the first to create a study group for your subject!'
                }
              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                Create Your First Group
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {availableGroups.map((group) => (
              <Card key={group.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">{group.name}</h3>
                      <p className="text-sm text-gray-500">{group.subject} • Created by {group.createdBy}</p>
                    </div>
                    <Badge className={getDifficultyColor(group.difficulty)}>
                      {group.difficulty}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-700 text-sm mb-4 line-clamp-2">{group.description}</p>
                  
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{group.schedule}</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      <span>{group.memberCount}/{group.maxMembers} members</span>
                    </div>
                  </div>
                  
                  {group.topics.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {group.topics.slice(0, 3).map((topic) => (
                          <Badge key={topic} variant="secondary" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                        {group.topics.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{group.topics.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {group.members.slice(0, 3).map((member) => (
                        <Avatar key={member.id} className="h-8 w-8 border-2 border-white">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback className="text-xs">{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      ))}
                      {group.memberCount > 3 && (
                        <div className="h-8 w-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                          <span className="text-xs text-gray-600">+{group.memberCount - 3}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setSelectedGroup(group)}
                      >
                        View Details
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleJoinGroup(group.id)}
                        disabled={group.memberCount >= group.maxMembers}
                      >
                        {group.memberCount >= group.maxMembers ? 'Full' : 'Join Group'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateStudyGroupModal 
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleNewGroup}
      />

      {selectedGroup && (
        <StudyGroupDetails 
          group={selectedGroup}
          onClose={() => setSelectedGroup(null)}
          onJoin={() => handleJoinGroup(selectedGroup.id)}
        />
      )}
    </div>
  );
};
