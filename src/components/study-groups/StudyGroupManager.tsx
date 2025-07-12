
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Plus, 
  Calendar, 
  MapPin, 
  Clock, 
  BookOpen,
  Settings,
  UserPlus,
  Search,
  Edit3,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface StudyGroup {
  id: string;
  name: string;
  description: string;
  subject: string;
  is_private: boolean;
  max_members: number;
  created_by: string;
  created_at: string;
  member_count: number;
  next_session?: string;
  location?: string;
  tags: string[];
}

interface StudySession {
  id: string;
  study_group_id: string;
  title: string;
  description?: string;
  scheduled_at: string;
  duration_minutes: number;
  location?: string;
  is_virtual: boolean;
  meeting_link?: string;
  max_participants?: number;
  created_by: string;
}

export const StudyGroupManager: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [myGroups, setMyGroups] = useState<StudyGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    subject: '',
    is_private: false,
    max_members: 10,
    tags: [] as string[]
  });

  useEffect(() => {
    if (user) {
      loadStudyGroups();
      loadMyGroups();
    }
  }, [user]);

  const loadStudyGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('study_groups')
        .select(`
          *,
          study_group_members(count)
        `)
        .eq('is_private', false)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStudyGroups(data || []);
    } catch (error) {
      console.error('Error loading study groups:', error);
    }
  };

  const loadMyGroups = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('study_groups')
        .select(`
          *,
          study_group_members!inner(user_id)
        `)
        .eq('study_group_members.user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyGroups(data || []);
    } catch (error) {
      console.error('Error loading my groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const createStudyGroup = async () => {
    if (!user || !newGroup.name.trim()) return;

    try {
      const { data, error } = await supabase
        .from('study_groups')
        .insert({
          name: newGroup.name,
          description: newGroup.description,
          subject: newGroup.subject,
          is_private: newGroup.is_private,
          max_members: newGroup.max_members,
          created_by: user.id,
          tags: newGroup.tags
        })
        .select()
        .single();

      if (error) throw error;

      // Join the creator to the group
      await supabase
        .from('study_group_members')
        .insert({
          study_group_id: data.id,
          user_id: user.id,
          role: 'admin'
        });

      toast({
        title: 'Study group created!',
        description: `${newGroup.name} has been created successfully.`
      });

      setShowCreateForm(false);
      setNewGroup({
        name: '',
        description: '',
        subject: '',
        is_private: false,
        max_members: 10,
        tags: []
      });
      
      loadStudyGroups();
      loadMyGroups();
    } catch (error) {
      console.error('Error creating study group:', error);
      toast({
        title: 'Error creating study group',
        variant: 'destructive'
      });
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

      toast({
        title: 'Joined study group!',
        description: 'You have successfully joined the study group.'
      });

      loadStudyGroups();
      loadMyGroups();
    } catch (error) {
      console.error('Error joining study group:', error);
      toast({
        title: 'Error joining study group',
        variant: 'destructive'
      });
    }
  };

  const filteredGroups = studyGroups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || group.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const subjects = ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Engineering', 'Business', 'Psychology'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Study Groups</h1>
          <p className="text-muted-foreground">Join or create study groups to collaborate with your peers</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Group
        </Button>
      </div>

      {/* Create Study Group Form */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Create New Study Group</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="group-name">Group Name</Label>
                    <Input
                      id="group-name"
                      value={newGroup.name}
                      onChange={(e) => setNewGroup(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Advanced React Study Group"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Select value={newGroup.subject} onValueChange={(value) => setNewGroup(prev => ({ ...prev, subject: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map(subject => (
                          <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newGroup.description}
                    onChange={(e) => setNewGroup(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe what this study group is about..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="max-members">Max Members</Label>
                    <Input
                      id="max-members"
                      type="number"
                      value={newGroup.max_members}
                      onChange={(e) => setNewGroup(prev => ({ ...prev, max_members: parseInt(e.target.value) || 10 }))}
                      min="2"
                      max="50"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="private-group"
                      checked={newGroup.is_private}
                      onCheckedChange={(checked) => setNewGroup(prev => ({ ...prev, is_private: checked }))}
                    />
                    <Label htmlFor="private-group">Private Group</Label>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button onClick={createStudyGroup} disabled={!newGroup.name.trim()}>
                    Create Group
                  </Button>
                  <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Study Groups Tabs */}
      <Tabs defaultValue="discover" className="space-y-4">
        <TabsList>
          <TabsTrigger value="discover">Discover Groups</TabsTrigger>
          <TabsTrigger value="my-groups">My Groups ({myGroups.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search study groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All subjects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {subjects.map(subject => (
                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Study Groups Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map(group => (
              <Card key={group.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{group.name}</CardTitle>
                      <Badge variant="secondary" className="mt-1">
                        {group.subject}
                      </Badge>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-1" />
                      {group.member_count}/{group.max_members}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {group.description}
                  </p>
                  
                  {group.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {group.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      Next session: TBD
                    </div>
                    <Button size="sm" onClick={() => joinStudyGroup(group.id)}>
                      <UserPlus className="h-3 w-3 mr-1" />
                      Join
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my-groups" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myGroups.map(group => (
              <Card key={group.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{group.name}</CardTitle>
                      <Badge variant="secondary" className="mt-1">
                        {group.subject}
                      </Badge>
                    </div>
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {group.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <Users className="h-4 w-4 mr-1" />
                      {group.member_count} members
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      Active
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button size="sm" className="flex-1">
                      View Group
                    </Button>
                    <Button size="sm" variant="outline">
                      Schedule Session
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
