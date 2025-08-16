
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Users, Lock, Globe } from 'lucide-react';
import { databaseService } from '@/services/databaseService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface Community {
  id: string;
  name: string;
  description: string;
  category: string;
  member_count: number;
  is_private: boolean;
  created_by: string;
  created_at: string;
}

export default function Communities() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const { user } = useAuth();
  const { toast } = useToast();

  const categories = [
    { id: 'all', name: 'All Communities' },
    { id: 'academic', name: 'Academic' },
    { id: 'social', name: 'Social' },
    { id: 'professional', name: 'Professional' },
    { id: 'hobbies', name: 'Hobbies' },
    { id: 'sports', name: 'Sports' }
  ];

  useEffect(() => {
    loadCommunities();
  }, [selectedCategory]);

  const loadCommunities = async () => {
    try {
      setLoading(true);
      const categoryFilter = selectedCategory !== 'all' ? selectedCategory : undefined;
      const data = await databaseService.getCommunities(categoryFilter);
      setCommunities(data);
    } catch (error) {
      console.error('Error loading communities:', error);
      toast({
        title: "Error loading communities",
        description: "Please try again later.",
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
      await databaseService.joinCommunity(communityId, user.id);
      toast({
        title: "Joined community!",
        description: "You have successfully joined the community."
      });
      // Refresh communities to update member count
      loadCommunities();
    } catch (error) {
      console.error('Error joining community:', error);
      toast({
        title: "Error joining community",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-8 w-24" />
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="h-10 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Communities</h1>
            <p className="text-muted-foreground mt-2">
              Discover and join communities that match your interests
            </p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Community
          </Button>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* Communities Grid */}
        {communities.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              No communities found
            </h3>
            <p className="text-muted-foreground mb-4">
              {selectedCategory !== 'all' 
                ? `No communities found in the ${categories.find(c => c.id === selectedCategory)?.name} category.`
                : 'Be the first to create a community!'
              }
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create the First Community
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communities.map((community) => (
              <Card key={community.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {community.is_private ? (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Globe className="h-4 w-4 text-muted-foreground" />
                      )}
                      {community.name}
                    </CardTitle>
                    <Badge variant="secondary">
                      {community.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {community.description}
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{community.member_count} members</span>
                    </div>
                    
                    <Button 
                      className="w-full"
                      onClick={() => handleJoinCommunity(community.id)}
                    >
                      {community.is_private ? 'Request to Join' : 'Join Community'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
