
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreateStudyGroupModal } from './CreateStudyGroupModal';
import { StudyGroupDetails } from './StudyGroupDetails';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Users, 
  Calendar, 
  MapPin, 
  Plus, 
  Search,
  BookOpen,
  Clock,
  Star
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StudyGroup {
  id: string;
  name: string;
  subject: string;
  description: string;
  location?: string;
  max_members: number;
  is_private: boolean;
  tags: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
  meeting_schedule?: any;
}

interface StudyGroupMember {
  id: string;
  study_group_id: string;
  user_id: string;
  role: string;
  joined_at: string;
}

interface StudyGroupWithMembers extends StudyGroup {
  members: StudyGroupMember[];
  member_count: number;
}

export const StudyGroupManager: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [studyGroups, setStudyGroups] = useState<StudyGroupWithMembers[]>([]);
  const [myGroups, setMyGroups] = useState<StudyGroupWithMembers[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<StudyGroupWithMembers | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'my-groups' | 'created'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStudyGroups();
    if (user) {
      loadMyGroups();
    }
  }, [user]);

  const loadStudyGroups = async () => {
    try {
      setIsLoading(true);
      
      // Get study groups with member count
      const { data: groups } = await supabase
        .from('study_groups')
        .select(`
          *,
          study_group_members(*)
        `)
        .eq('is_private', false)
        .order('created_at', { ascending: false });

      if (groups) {
        const groupsWithMembers: StudyGroupWithMembers[] = groups.map(group => ({
          ...group,
          members: group.study_group_members || [],
          member_count: group.study_group_members?.length || 0
        }));
        
        setStudyGroups(groupsWithMembers);
      }
    } catch (error) {
      console.error('Error loading study groups:', error);
      toast({
        title: "Error loading study groups",
        description: "Please try refreshing the page.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadMyGroups = async () => {
    if (!user) return;

    try {
      // Get groups where user is a member
      const { data: memberGroups } = await supabase
        .from('study_group_members')
        .select(`
          study_group_id,
          study_groups(
            *,
            study_group_members(*)
          )
        `)
        .eq('user_id', user.id);

      if (memberGroups) {
        const myGroupsData: StudyGroupWithMembers[] = memberGroups
          .map(mg => mg.study_groups)
          .filter(Boolean)
          .map(group => ({
            ...group,
            members: group.study_group_members || [],
            member_count: group.study_group_members?.length || 0
          }));
        
        setMyGroups(myGroupsData);
      }
    } catch (error) {
      console.error('Error loading my groups:', error);
    }
  };

  const handleJoinGroup = async (groupId: string) => {
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

      toast({
        title: "Joined study group!",
        description: "You've successfully joined the study group."
      });

      loadStudyGroups();
      loadMyGroups();
    } catch (error) {
      console.error('Error joining group:', error);
      toast({
        title: "Failed to join group",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const handleLeaveGroup = async (groupId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('study_group_members')
        .delete()
        .eq('study_group_id', groupId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Left study group",
        description: "You've left the study group."
      });

      loadStudyGroups();
      loadMyGroups();
    } catch (error) {
      console.error('Error leaving group:', error);
      toast({
        title: "Failed to leave group",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const handleGroupCreated = () => {
    loadStudyGroups();
    loadMyGroups();
    setShowCreateModal(false);
  };

  const filteredGroups = studyGroups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    group.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const isUserMember = (group: StudyGroupWithMembers) => {
    return group.members.some(member => member.user_id === user?.id);
  };

  const renderStudyGroupCard = (group: StudyGroupWithMembers) => (
    <motion.div
      key={group.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4"
    >
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg mb-2">{group.name}</CardTitle>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-2">
                <div className="flex items-center space-x-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{group.subject}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{group.member_count}/{group.max_members}</span>
                </div>
                {group.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{group.location}</span>
                  </div>
                )}
              </div>
              {group.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {group.description}
                </p>
              )}
              {group.tags && group.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {group.tags.slice(0, 3).map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
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
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  <Users className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <p className="font-medium">Study Group</p>
                <p className="text-muted-foreground">
                  Created {new Date(group.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedGroup(group)}
              >
                View Details
              </Button>
              {isUserMember(group) ? (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleLeaveGroup(group.id)}
                >
                  Leave
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => handleJoinGroup(group.id)}
                  disabled={group.member_count >= group.max_members}
                >
                  {group.member_count >= group.max_members ? 'Full' : 'Join'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

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
      <div className="flex items-center justify-between">
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

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search study groups..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList>
          <TabsTrigger value="all">All Groups</TabsTrigger>
          <TabsTrigger value="my-groups">My Groups</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <AnimatePresence>
            {filteredGroups.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No study groups found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? 'Try adjusting your search terms' : 'Be the first to create a study group!'}
                </p>
                <Button onClick={() => setShowCreateModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Study Group
                </Button>
              </div>
            ) : (
              filteredGroups.map(renderStudyGroupCard)
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="my-groups" className="space-y-4">
          <AnimatePresence>
            {myGroups.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">You haven't joined any groups yet</h3>
                <p className="text-muted-foreground mb-4">
                  Join a study group to collaborate with other students
                </p>
                <Button onClick={() => setActiveTab('all')}>
                  Browse Groups
                </Button>
              </div>
            ) : (
              myGroups.map(renderStudyGroupCard)
            )}
          </AnimatePresence>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CreateStudyGroupModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onGroupCreated={handleGroupCreated}
      />

      {selectedGroup && (
        <StudyGroupDetails
          group={selectedGroup}
          isOpen={!!selectedGroup}
          onClose={() => setSelectedGroup(null)}
          onJoin={() => handleJoinGroup(selectedGroup.id)}
          onLeave={() => handleLeaveGroup(selectedGroup.id)}
          isMember={isUserMember(selectedGroup)}
        />
      )}
    </div>
  );
};
