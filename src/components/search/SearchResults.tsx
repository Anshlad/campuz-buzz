
import React from 'react';
import { SearchResult } from '@/services/searchService';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, MapPin, Users, Heart, MessageCircle, User, Building } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  total: number;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  isLoading,
  total,
  onLoadMore,
  hasMore
}) => {
  if (isLoading && results.length === 0) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div className="w-10 h-10 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-3 bg-muted rounded w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
          <User className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">No results found</h3>
        <p className="text-muted-foreground">Try adjusting your search terms or filters</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground mb-4">
        {total} results found
      </div>
      
      {results.map((result) => (
        <SearchResultCard key={`${result.type}-${result.id}`} result={result} />
      ))}
      
      {hasMore && onLoadMore && (
        <div className="text-center pt-4">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </Button>
        </div>
      )}
    </div>
  );
};

const SearchResultCard: React.FC<{ result: SearchResult }> = ({ result }) => {
  const getTypeIcon = () => {
    switch (result.type) {
      case 'user':
        return <User className="h-4 w-4" />;
      case 'community':
        return <Building className="h-4 w-4" />;
      case 'event':
        return <Calendar className="h-4 w-4" />;
      default:
        return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getTypeColor = () => {
    switch (result.type) {
      case 'user':
        return 'bg-blue-100 text-blue-800';
      case 'community':
        return 'bg-green-100 text-green-800';
      case 'event':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={result.avatar_url} />
            <AvatarFallback>
              {result.title.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <Badge variant="secondary" className={`text-xs ${getTypeColor()}`}>
                {getTypeIcon()}
                <span className="ml-1 capitalize">{result.type}</span>
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(result.created_at), { addSuffix: true })}
              </span>
            </div>
            
            <h3 className="font-medium text-sm mb-1 line-clamp-1">
              {result.title}
            </h3>
            
            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
              {result.content}
            </p>
            
            {/* Type-specific metadata */}
            {result.type === 'post' && result.metadata && (
              <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                {result.metadata.author && (
                  <span>by {result.metadata.author}</span>
                )}
                {result.metadata.likes > 0 && (
                  <span className="flex items-center">
                    <Heart className="h-3 w-3 mr-1" />
                    {result.metadata.likes}
                  </span>
                )}
                {result.metadata.comments > 0 && (
                  <span className="flex items-center">
                    <MessageCircle className="h-3 w-3 mr-1" />
                    {result.metadata.comments}
                  </span>
                )}
              </div>
            )}
            
            {result.type === 'user' && result.metadata && (
              <div className="text-xs text-muted-foreground">
                {result.metadata.major && (
                  <span>{result.metadata.major}</span>
                )}
                {result.metadata.school && (
                  <span> • {result.metadata.school}</span>
                )}
              </div>
            )}
            
            {result.type === 'community' && result.metadata && (
              <div className="flex items-center text-xs text-muted-foreground">
                <Users className="h-3 w-3 mr-1" />
                {result.metadata.member_count} members
                {result.metadata.category && (
                  <span className="ml-2">• {result.metadata.category}</span>
                )}
              </div>
            )}
            
            {result.type === 'event' && result.metadata && (
              <div className="text-xs text-muted-foreground space-y-1">
                {result.metadata.start_time && (
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(result.metadata.start_time).toLocaleDateString()}
                  </div>
                )}
                {result.metadata.location && (
                  <div className="flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {result.metadata.location}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
