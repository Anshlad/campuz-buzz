import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreateStudyGroupModal } from '@/components/study-groups/CreateStudyGroupModal';
import { databaseService } from '@/services/databaseService';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Users, 
  Plus, 
  BookOpen, 
  Code, 
  Beaker, 
  Calculator,
  Loader2,
  UserPlus,
  UserMinus
} from 'lucide-react';

interface Community {
  id: string;
  name: string;
  description: string;
  category?: string;
  member_count: number;
  is_private: boolean;
  created_by: string;
  created_at: string;
  isJoined?: boolean;
}

const Communities = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [joiningCommunity, setJoiningCommunity] = useState<string | null>(null);

  const categories = [
    { id: 'all', name: 'All', icon: Users },
    { id: 'computer_science', name: 'Computer Science', icon: Code },
    { id: 'engineering', name: 'Engineering', icon: Calculator },
    { id: 'science', name: 'Science', icon: Beaker },
    { id: 'study_groups', name: 'Study Groups', icon: BookOpen },
  ];

  useEffect(() => {
    loadCommunities();
  }, [selectedCategory]);

  const loadCommunities = async () => {
    try {
      setLoading(true);
      const category = selectedCategory === 'all' ? undefined : selectedCategory;
      const data = await databaseService.getCommunities(category);
      
      // Check membership status for each community
      const communitiesWithMembership = await Promise.all(
        data.map(async (community) => {
          // This would normally be done in a single query, but for now we'll keep it simple
          return {
            ...community,
            isJoined: false // TODO: Implement membership check
          };
        })
      );
      
      setCommunities(communitiesWithMembership);
    } catch (error) {
      console.error('Error loading communities:', error);
      toast({
        title: "Error",
        description: "Failed to load communities. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCommunity = async (communityId: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to join communities.",
        variant: "destructive"
      });
      return;
    }

    try {
      setJoiningCommunity(communityId);
      await databaseService.joinCommunity(communityId, user.id);
      
      setCommunities(prev => 
        prev.map(community => 
          community.id === communityId 
            ? { ...community, isJoined: true, member_count: community.member_count + 1 }
            : community
        )
      );
      
      toast({
        title: "Success",
        description: "Successfully joined the community!"
      });
    } catch (error) {
      console.error('Error joining community:', error);
      toast({
        title: "Error",
        description: "Failed to join community. Please try again.",
        variant: "destructive"
      });
    } finally {
      setJoiningCommunity(null);
    }
  };

  const handleLeaveCommunity = async (communityId: string) => {
    if (!user) return;

    try {
      setJoiningCommunity(communityId);
      await databaseService.leaveCommunity(communityId, user.id);
      
      setCommunities(prev => 
        prev.map(community => 
          community.id === communityId 
            ? { ...community, isJoined: false, member_count: Math.max(0, community.member_count - 1) }
            : community
        )
      );
      
      toast({
        title: "Success",
        description: "Successfully left the community."
      });
    } catch (error) {
      console.error('Error leaving community:', error);
      toast({
        title: "Error",
        description: "Failed to leave community. Please try again.",
        variant: "destructive"
      });
    } finally {
      setJoiningCommunity(null);
    }
  };

  const filteredCommunities = communities.filter(community =>
    community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    community.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading communities...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Communities</h1>
            <p className="text-muted-foreground">
              Connect with fellow students and join study groups
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Community
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search communities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{category.name}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {categories.map((category) => (
            <TabsContent key={category.id} value={category.id} className="space-y-6">
              {/* Communities Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCommunities.map((community) => (
                  <Card key={community.id} className="h-full">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>
                            {community.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        {community.category && (
                          <Badge variant="secondary">
                            {community.category.replace('_', ' ')}
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg">{community.name}</CardTitle>
                      <CardDescription>{community.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-between">
                      <div className="flex items-center text-sm text-muted-foreground mb-4">
                        <Users className="h-4 w-4 mr-1" />
                        {community.member_count} members
                      </div>
                      
                      <Button
                        onClick={() => community.isJoined ? handleLeaveCommunity(community.id) : handleJoinCommunity(community.id)}
                        disabled={joiningCommunity === community.id}
                        variant={community.isJoined ? "outline" : "default"}
                        className="w-full"
                      >
                        {joiningCommunity === community.id ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : community.isJoined ? (
                          <UserMinus className="h-4 w-4 mr-2" />
                        ) : (
                          <UserPlus className="h-4 w-4 mr-2" />
                        )}
                        {community.isJoined ? 'Leave' : 'Join'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredCommunities.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <div className="text-muted-foreground">
                      <h3 className="text-lg font-medium mb-2">No communities found</h3>
                      <p>Try adjusting your search or create a new community!</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>

      {/* Create Community Modal */}
      <CreateStudyGroupModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
};

export default Communities;
