
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { communitiesService, Community } from '@/services/communitiesService';
import { Users, Search, Plus, Building, GraduationCap, Heart } from 'lucide-react';

export const Communities = () => {
  const { user } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchCommunities();
  }, [activeTab]);

  const fetchCommunities = async () => {
    try {
      setLoading(true);
      const data = await communitiesService.getCommunities(
        activeTab === 'all' ? undefined : activeTab
      );
      setCommunities(data);
    } catch (error) {
      toast({
        title: "Error loading communities",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleJoinLeave = async (communityId: string, isJoined: boolean) => {
    if (!user) return;

    try {
      if (isJoined) {
        await communitiesService.leaveCommunity(communityId, user.id);
        toast({ title: "Left community successfully" });
      } else {
        await communitiesService.joinCommunity(communityId, user.id);
        toast({ title: "Joined community successfully" });
      }
      
      setCommunities(communities.map(c => 
        c.id === communityId 
          ? { ...c, isJoined: !isJoined, memberCount: isJoined ? c.memberCount - 1 : c.memberCount + 1 }
          : c
      ));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update community membership.",
        variant: "destructive"
      });
    }
  };

  const filteredCommunities = communities.filter(community =>
    community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    community.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeIcon = (category: string) => {
    switch (category) {
      case 'department':
        return <Building className="h-4 w-4" />;
      case 'club':
        return <Heart className="h-4 w-4" />;
      case 'interest':
        return <GraduationCap className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Communities</h1>
        <Button className="bg-gradient-to-r from-blue-600 to-indigo-600">
          <Plus className="h-4 w-4 mr-2" />
          Create Community
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search communities..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="department">Departments</TabsTrigger>
          <TabsTrigger value="club">Clubs</TabsTrigger>
          <TabsTrigger value="interest">Interests</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredCommunities.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No communities found
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Try adjusting your search or create a new community.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCommunities.map((community) => (
                <Card key={community.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={community.avatar_url} />
                        <AvatarFallback>{community.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg truncate">{community.name}</CardTitle>
                        <div className="flex items-center space-x-1 mt-1">
                          {getTypeIcon(community.category || 'general')}
                          <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                            {community.category || 'General'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pt-0">
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                      {community.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Users className="h-4 w-4 mr-1" />
                        {community.memberCount} members
                      </div>
                      {community.is_private && (
                        <Badge variant="secondary">Private</Badge>
                      )}
                    </div>
                    
                    <Button
                      variant={community.isJoined ? "outline" : "default"}
                      className="w-full"
                      onClick={() => handleJoinLeave(community.id, community.isJoined)}
                    >
                      {community.isJoined ? 'Leave' : 'Join'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
