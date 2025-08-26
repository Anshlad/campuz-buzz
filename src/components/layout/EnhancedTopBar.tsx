
import React, { useState } from 'react';
import { Bell, Search, Plus, Menu, Sun, Moon, RefreshCw, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { EnhancedCreatePostModal } from '@/components/posts/EnhancedCreatePostModal';
import { useOptimizedPosts } from '@/hooks/useOptimizedPosts';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface EnhancedTopBarProps {
  sidebarCollapsed: boolean;
  onSidebarToggle: () => void;
}

export const EnhancedTopBar: React.FC<EnhancedTopBarProps> = ({
  sidebarCollapsed,
  onSidebarToggle
}) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { createPost, isCreating } = useOptimizedPosts();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleCreatePost = async (postData: any) => {
    try {
      await createPost(postData);
      setShowCreatePost(false);
      toast({
        title: "Post created!",
        description: "Your post has been shared successfully."
      });
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: "Error creating post",
        description: "Please try again later.",
        variant: "destructive"
      });
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      window.location.reload();
    } finally {
      setTimeout(() => setIsRefreshing(false), 1000);
    }
  };

  const handleProfileClick = () => {
    navigate('/profile');
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={onSidebarToggle}
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center space-x-3">
              {/* CampuzBuzz Logo/Text with animation */}
              <div className="flex items-center space-x-2">
                {sidebarCollapsed ? (
                  <div className="animate-scale-in">
                    <div className="w-8 h-8 bg-gradient-to-r from-primary to-primary/80 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      CB
                    </div>
                  </div>
                ) : (
                  <div className="font-bold text-xl text-primary animate-fade-in">
                    CampuzBuzz
                  </div>
                )}
              </div>

              {/* Refresh Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="text-muted-foreground hover:text-foreground"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Center Section - Search (hidden on mobile) */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search posts, users, communities..."
                className="w-full pl-10 pr-4 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                onClick={() => navigate('/explore')}
                readOnly
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="hidden sm:flex"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            {/* Create Post Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCreatePost(true)}
              className="text-primary hover:text-primary/80"
            >
              <Plus className="h-5 w-5" />
              <span className="hidden sm:ml-2 sm:inline">Create</span>
            </Button>

            {/* Search Button (mobile only) */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="md:hidden"
              onClick={() => navigate('/explore')}
            >
              <Search className="h-5 w-5" />
            </Button>

            {/* Profile Avatar */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleProfileClick}
              className="p-1"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            </Button>
          </div>
        </div>
      </header>

      {/* Create Post Modal */}
      <EnhancedCreatePostModal
        open={showCreatePost}
        onOpenChange={setShowCreatePost}
        onSubmit={handleCreatePost}
        isLoading={isCreating}
      />
    </>
  );
};
