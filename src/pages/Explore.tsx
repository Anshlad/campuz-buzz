
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Users, Calendar, Hash, UserPlus } from 'lucide-react';
import { useAdvancedSearch } from '@/hooks/useAdvancedSearch';
import { AdvancedSearchBar } from '@/components/search/AdvancedSearchBar';
import { SearchResults } from '@/components/search/SearchResults';

export default function Explore() {
  const {
    query,
    debouncedQuery,
    filters,
    results,
    suggestions,
    total,
    trendingTopics,
    recommendedCommunities,
    isLoading,
    loadingTrending,
    loadingRecommended,
    updateQuery,
    updateFilters,
    clearSearch
  } = useAdvancedSearch();

  const [activeTab, setActiveTab] = useState('discover');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">Explore</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Discover new content, connect with people, and find communities that match your interests
        </p>
      </div>

      <AdvancedSearchBar
        query={query}
        filters={filters}
        suggestions={suggestions}
        onQueryChange={updateQuery}
        onFiltersChange={updateFilters}
        onSuggestionClick={updateQuery}
        onClear={clearSearch}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="people">People</TabsTrigger>
        </TabsList>

        <TabsContent value="discover" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Trending Topics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Trending Topics
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingTrending ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-8 bg-muted rounded animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {trendingTopics.slice(0, 8).map((topic, index) => (
                      <div
                        key={topic.topic}
                        className="flex items-center justify-between p-2 hover:bg-muted rounded-md cursor-pointer"
                        onClick={() => updateQuery(`#${topic.topic}`)}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-muted-foreground">
                            {index + 1}
                          </span>
                          <Hash className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm font-medium">{topic.topic}</span>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {topic.count}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recommended Communities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  Recommended Communities
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingRecommended ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-muted rounded-full animate-pulse" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded animate-pulse" />
                          <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recommendedCommunities.map((community) => (
                      <div key={community.id} className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback>
                            {community.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">
                            {community.name}
                          </p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {community.member_count} members
                          </p>
                        </div>
                        <Button size="sm" variant="outline">
                          Join
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Browse Events
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Find Study Groups
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Connect with Peers
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="search">
          {debouncedQuery ? (
            <SearchResults
              results={results}
              isLoading={isLoading}
              total={total}
            />
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                <Hash className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">Start your search</h3>
              <p className="text-muted-foreground">
                Use the search bar above to find posts, users, communities, and events
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="trending">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {trendingTopics.map((topic, index) => (
              <Card key={topic.topic} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">#{index + 1}</Badge>
                    <Badge variant="outline">{topic.count} mentions</Badge>
                  </div>
                  <h3 className="font-medium mb-1">#{topic.topic}</h3>
                  <p className="text-sm text-muted-foreground">
                    Trending topic with {topic.count} mentions
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="people">
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <UserPlus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">People You May Know</h3>
            <p className="text-muted-foreground mb-4">
              This feature will show suggested connections based on your interests and mutual connections
            </p>
            <Button variant="outline">Coming Soon</Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
