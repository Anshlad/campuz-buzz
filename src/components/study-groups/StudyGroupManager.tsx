
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Plus, Users, Calendar, MapPin, Book, Search, Filter } from 'lucide-react';
import { CreateStudyGroupModal } from './CreateStudyGroupModal';
import { StudyGroupDetails } from './StudyGroupDetails';
import type { Database } from '@/integrations/supabase/types';

type StudyGroup = Database['public']['Tables']['study_groups']['Row'];
type StudyGroupMember = Database['public']['Tables']['study_group_members']['Row'];
type StudySession = Database['public']['Tables']['study_sessions']['Row'];

interface StudyGroupWithMembers extends StudyGroup {
  study_group_members: StudyGroupMember[];
  member_count: number;
  user_role?: string;
}

export const StudyGroupManager: React.FC = () => {
  const { user } = useAuth();
  const [studyGroups, setStudyGroups] = useState<StudyGroupWithMembers[]>([]);
  const [myGroups, setMyGroups] = useState<StudyGroupWithMembers[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [showPrivateGroups, setShowPrivateGroups] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<StudyGroupWithMembers | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'discover' | 'my-groups'>('discover');

  useEffect(() => {
    if (user) {
      loadStudyGroups();
      loadMyGroups();
    }
  }, [user]);

  const loadStudyGroups = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('study_groups')
        .select(`
          *,
          study_group_members(*)
        `)
        .eq('is_private', false)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const groupsWithCounts = data.map(group => ({
        ...group,
        member_count: group.study_group_members?.length || 0,
        study_group_members: group.study_group_members || []
      }));

      setStudyGroups(groupsWithCounts);
    } catch (error) {
      console.error('Failed to load study groups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMyGroups = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('study_groups')
        .select(`
          *,
          study_group_members(*)
        `)
        .in('id', 
          supabase
            .from('study_group_members')
            .select('study_group_id')
            .eq('user_id', user.id)
        );

      if (error) throw error;

      const groupsWithCounts = data.map(group => {
        const userMembership = group.study_group_members?.find(
          member => member.user_id === user.id
        );
        
        return {
          ...group,
          member_count: group.study_group_members?.length || 0,
          user_role: userMembership?.role,
          study_group_members: group.study_group_members || []
        };
      });

      setMyGroups(groupsWithCounts);
    } catch (error) {
      console.error('Failed to load my study groups:', error);
    }
  };

  const joinStudyGroup = async (groupId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('study_group_members')
        .insert({
          study_group_id: groupId,
          user_id: user.id,
          role: 'member'
        });

      if (error) throw error;

      await loadStudyGroups();
      await loadMyGroups();
    } catch (error) {
      console.error('Failed to join study group:', error);
    }
  };

  const leaveStudyGroup = async (groupId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('study_group_members')
        .delete()
        .eq('study_group_id', groupId)
        .eq('user_id', user.id);

      if (error) throw error;

      await loadStudyGroups();
      await loadMyGroups();
    } catch (error) {
      console.error('Failed to leave study group:', error);
    }
  };

  const filteredGroups = studyGroups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         group.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         group.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSubject = selectedSubject === 'all' || group.subject === selectedSubject;
    
    return matchesSearch && matchesSubject;
  });

  const subjects = [...new Set(studyGroups.map(group => group.subject))];

  const isUserMember = (groupId: string) => {
    return myGroups.some(group => group.id === groupId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Study Groups</h1>
          <p className="text-muted-foreground">
            Find and join study groups or create your own
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Group
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted rounded-lg p-1">
        <Button
          variant={activeTab === 'discover' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('discover')}
          className="flex-1"
        >
          Discover Groups
        </Button>
        <Button
          variant={activeTab === 'my-groups' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('my-groups')}
          className="flex-1"
        >
          My Groups ({myGroups.length})
        </Button>
      </div>

      {/* Filters */}
      {activeTab === 'discover' && (
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search study groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedSubject} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="Filter by subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map(subject => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Study Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(activeTab === 'discover' ? filteredGroups : myGroups).map((group) => (
          <Card key={group.id} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{group.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary">
                      <Book className="h-3 w-3 mr-1" />
                      {group.subject}
                    </Badge>
                    {group.is_private && (
                      <Badge variant="outline">Private</Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {group.description || 'No description provided.'}
              </p>
              
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{group.member_count} members</span>
                </div>
                {group.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">{group.location}</span>
                  </div>
                )}
              </div>

              {group.tags && group.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {group.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {group.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{group.tags.length - 3} more
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                {activeTab === 'discover' ? (
                  isUserMember(group.id) ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => leaveStudyGroup(group.id)}
                      className="flex-1"
                    >
                      Leave Group
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => joinStudyGroup(group.id)}
                      className="flex-1"
                    >
                      Join Group
                    </Button>
                  )
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedGroup(group)}
                      className="flex-1"
                    >
                      View Details
                    </Button>
                    {group.user_role === 'admin' && (
                      <Button size="sm" variant="outline">
                        Manage
                      </Button>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty States */}
      {activeTab === 'discover' && filteredGroups.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No study groups found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search criteria or create a new study group.
          </p>
        </div>
      )}

      {activeTab === 'my-groups' && myGroups.length === 0 && (
        <div className="text-center py-12">
          <Book className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">You haven't joined any study groups yet</h3>
          <p className="text-muted-foreground mb-4">
            Browse available study groups or create your own to get started.
          </p>
          <Button onClick={() => setActiveTab('discover')}>
            Discover Groups
          </Button>
        </div>
      )}

      {/* Modals */}
      <CreateStudyGroupModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onGroupCreated={() => {
          loadStudyGroups();
          loadMyGroups();
        }}
      />

      {selectedGroup && (
        <StudyGroupDetails
          group={selectedGroup}
          isOpen={!!selectedGroup}
          onClose={() => setSelectedGroup(null)}
        />
      )}
    </div>
  );
};
