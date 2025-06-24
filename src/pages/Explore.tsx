
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Users, Calendar, BookOpen, Plus, Filter } from 'lucide-react';

interface SearchResult {
  id: string;
  type: 'user' | 'group' | 'event';
  name: string;
  description?: string;
  avatar?: string;
  members?: number;
  date?: string;
  major?: string;
  year?: string;
  tags?: string[];
}

export const Explore = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const mockResults: SearchResult[] = [
    {
      id: '1',
      type: 'user',
      name: 'Sarah Johnson',
      description: 'Computer Science Junior passionate about AI and machine learning',
      avatar: '/placeholder.svg',
      major: 'Computer Science',
      year: 'Junior',
      tags: ['AI', 'Machine Learning', 'Python']
    },
    {
      id: '2',
      type: 'group',
      name: 'Advanced Algorithms Study Group',
      description: 'Weekly study sessions for CS 451 - Advanced Algorithms',
      avatar: '/placeholder.svg',
      members: 15,
      tags: ['Computer Science', 'Algorithms', 'Study Group']
    },
    {
      id: '3',
      type: 'event',
      name: 'Spring Career Fair 2024',
      description: 'Meet with top tech companies and explore internship opportunities',
      date: 'March 15, 2024',
      tags: ['Career', 'Networking', 'Technology']
    },
    {
      id: '4',
      type: 'user',
      name: 'Mike Chen',
      description: 'Business major with interests in entrepreneurship and startups',
      avatar: '/placeholder.svg',
      major: 'Business',
      year: 'Senior',
      tags: ['Business', 'Entrepreneurship', 'Marketing']
    },
    {
      id: '5',
      type: 'group',
      name: 'Web Development Workshop',
      description: 'Learn modern web technologies and build projects together',
      avatar: '/placeholder.svg',
      members: 28,
      tags: ['Web Development', 'JavaScript', 'React']
    },
    {
      id: '6',
      type: 'event',
      name: 'AI/ML Research Symposium',
      description: 'Student research presentations and industry speaker sessions',
      date: 'April 2, 2024',
      tags: ['Research', 'AI', 'Machine Learning']
    }
  ];

  const allTags = Array.from(new Set(mockResults.flatMap(result => result.tags || [])));

  const filteredResults = mockResults.filter(result => {
    const matchesSearch = searchQuery === '' || 
      result.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      result.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = activeTab === 'all' || result.type === activeTab;
    
    const matchesFilters = selectedFilters.length === 0 || 
      selectedFilters.some(filter => result.tags?.includes(filter));
    
    return matchesSearch && matchesTab && matchesFilters;
  });

  const toggleFilter = (tag: string) => {
    setSelectedFilters(prev => 
      prev.includes(tag) 
        ? prev.filter(f => f !== tag)
        : [...prev, tag]
    );
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'user': return Users;
      case 'group': return BookOpen;
      case 'event': return Calendar;
      default: return Search;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Explore CampuzBuzz</h1>
        <p className="text-gray-600">Discover people, groups, and events in your college community</p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for people, groups, events..."
              className="pl-12 text-lg h-12"
            />
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filter by tags:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedFilters.includes(tag) ? "default" : "secondary"}
                className="cursor-pointer"
                onClick={() => toggleFilter(tag)}
              >
                {tag}
              </Badge>
            ))}
            {selectedFilters.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFilters([])}
                className="text-xs"
              >
                Clear filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All ({mockResults.length})</TabsTrigger>
          <TabsTrigger value="user">People ({mockResults.filter(r => r.type === 'user').length})</TabsTrigger>
          <TabsTrigger value="group">Groups ({mockResults.filter(r => r.type === 'group').length})</TabsTrigger>
          <TabsTrigger value="event">Events ({mockResults.filter(r => r.type === 'event').length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredResults.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-gray-400 mb-4">
                  <Search className="h-16 w-16 mx-auto mb-4" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                <p className="text-gray-500">
                  {searchQuery 
                    ? `No results for "${searchQuery}". Try different keywords or filters.`
                    : 'Try searching for people, groups, or events.'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredResults.map((result) => {
                const IconComponent = getResultIcon(result.type);
                
                return (
                  <Card key={result.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="relative">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={result.avatar} />
                            <AvatarFallback>{result.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1">
                            <IconComponent className="h-3 w-3 text-gray-500" />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{result.name}</h3>
                          
                          {result.type === 'user' && (
                            <p className="text-sm text-gray-500">{result.major} • {result.year}</p>
                          )}
                          
                          {result.type === 'group' && result.members && (
                            <p className="text-sm text-gray-500">{result.members} members</p>
                          )}
                          
                          {result.type === 'event' && result.date && (
                            <p className="text-sm text-gray-500">{result.date}</p>
                          )}
                          
                          {result.description && (
                            <p className="text-sm text-gray-700 mt-1 line-clamp-2">{result.description}</p>
                          )}
                          
                          {result.tags && result.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {result.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              {result.tags.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{result.tags.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col space-y-2">
                          {result.type === 'user' && (
                            <Button size="sm" variant="outline">Connect</Button>
                          )}
                          {result.type === 'group' && (
                            <Button size="sm">Join Group</Button>
                          )}
                          {result.type === 'event' && (
                            <Button size="sm">RSVP</Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
