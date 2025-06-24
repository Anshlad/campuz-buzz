
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Users, Calendar, Clock, MapPin, BookOpen, User } from 'lucide-react';

interface StudyGroupDetailsProps {
  group: {
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
    difficulty: string;
  };
  onClose: () => void;
  onJoin: () => void;
}

export const StudyGroupDetails: React.FC<StudyGroupDetailsProps> = ({ 
  group, 
  onClose, 
  onJoin 
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl">{group.name}</DialogTitle>
              <p className="text-gray-600">{group.subject}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getDifficultyColor(group.difficulty)}>
                {group.difficulty}
              </Badge>
              {group.isJoined && (
                <Badge variant="secondary">Member</Badge>
              )}
            </div>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Description */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">About</h3>
            <p className="text-gray-700 leading-relaxed">{group.description}</p>
          </div>

          {/* Group Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-2" />
                <span>{group.memberCount}/{group.maxMembers} members</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                <span>{group.schedule}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <User className="h-4 w-4 mr-2" />
                <span>Created by {group.createdBy}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <BookOpen className="h-4 w-4 mr-2" />
                <span>{group.topics.length} topics covered</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Next Session */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Next Session</h3>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2 text-blue-600" />
                  <span className="font-medium">{group.nextSession.date} at {group.nextSession.time}</span>
                </div>
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                  <span>{group.nextSession.location}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Topics */}
          {group.topics.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Topics Covered</h3>
              <div className="flex flex-wrap gap-2">
                {group.topics.map((topic) => (
                  <Badge key={topic} variant="outline">
                    {topic}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Members */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Members ({group.memberCount})</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {group.members.map((member) => (
                <div key={member.id} className="flex items-center space-x-2 p-2 rounded-lg bg-gray-50">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={member.avatar} />
                    <AvatarFallback className="text-xs">{member.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-gray-900 truncate">{member.name}</span>
                </div>
              ))}
              
              {/* Placeholder for additional members */}
              {Array.from({ length: Math.max(0, group.memberCount - group.members.length) }).map((_, i) => (
                <div key={`placeholder-${i}`} className="flex items-center space-x-2 p-2 rounded-lg bg-gray-50">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">+</AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-gray-500">Member</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
            <Button 
              onClick={() => { onJoin(); onClose(); }}
              disabled={!group.isJoined && group.memberCount >= group.maxMembers}
              className={group.isJoined ? "bg-red-600 hover:bg-red-700" : "bg-gradient-to-r from-blue-600 to-indigo-600"}
            >
              {group.isJoined 
                ? 'Leave Group' 
                : group.memberCount >= group.maxMembers 
                  ? 'Group Full' 
                  : 'Join Group'
              }
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
