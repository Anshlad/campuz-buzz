
import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { SearchFilters } from '@/services/searchService';

interface AdvancedSearchBarProps {
  query: string;
  filters: SearchFilters;
  suggestions: string[];
  onQueryChange: (query: string) => void;
  onFiltersChange: (filters: Partial<SearchFilters>) => void;
  onSuggestionClick: (suggestion: string) => void;
  onClear: () => void;
}

export const AdvancedSearchBar: React.FC<AdvancedSearchBarProps> = ({
  query,
  filters,
  suggestions,
  onQueryChange,
  onFiltersChange,
  onSuggestionClick,
  onClear
}) => {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== 'all' && (Array.isArray(value) ? value.length > 0 : true)
  );

  return (
    <div className="relative w-full max-w-4xl mx-auto">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search posts, users, communities, events..."
            value={query}
            onChange={(e) => {
              onQueryChange(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="pl-10 pr-10"
          />
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClear}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          
          {/* Search Suggestions */}
          {showSuggestions && suggestions.length > 0 && query && (
            <div className="absolute top-full left-0 right-0 bg-background border rounded-md shadow-lg z-50 mt-1">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="px-4 py-2 hover:bg-muted cursor-pointer text-sm"
                  onClick={() => {
                    onSuggestionClick(suggestion);
                    setShowSuggestions(false);
                  }}
                >
                  <Search className="inline h-3 w-3 mr-2 text-muted-foreground" />
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Filters */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="relative">
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2 h-4 w-4 p-0 text-xs">
                  !
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Content Type</label>
                <Select
                  value={filters.type || 'all'}
                  onValueChange={(value) => onFiltersChange({ type: value as any })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Content</SelectItem>
                    <SelectItem value="posts">Posts</SelectItem>
                    <SelectItem value="users">Users</SelectItem>
                    <SelectItem value="communities">Communities</SelectItem>
                    <SelectItem value="events">Events</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Time Range</label>
                <Select
                  value={filters.dateRange || 'all'}
                  onValueChange={(value) => onFiltersChange({ dateRange: value as any })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="day">Past Day</SelectItem>
                    <SelectItem value="week">Past Week</SelectItem>
                    <SelectItem value="month">Past Month</SelectItem>
                    <SelectItem value="year">Past Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Sort By</label>
                <Select
                  value={filters.sortBy || 'relevance'}
                  onValueChange={(value) => onFiltersChange({ sortBy: value as any })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Relevance</SelectItem>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onFiltersChange({})}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-2">
          {filters.type && filters.type !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              Type: {filters.type}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => onFiltersChange({ type: 'all' })}
              />
            </Badge>
          )}
          {filters.dateRange && filters.dateRange !== 'all' && (
            <Badge variant="secondary" className="text-xs">
              Time: {filters.dateRange}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => onFiltersChange({ dateRange: 'all' })}
              />
            </Badge>
          )}
          {filters.sortBy && filters.sortBy !== 'relevance' && (
            <Badge variant="secondary" className="text-xs">
              Sort: {filters.sortBy}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => onFiltersChange({ sortBy: 'relevance' })}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};
