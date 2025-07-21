
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { MessageActions } from '@/components/chat/MessageActions';
import { useAuth } from '@/contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  MapPin,
  Eye,
  Users,
  Lock,
  Globe,
  Image as ImageIcon,
  Video,
  FileText
} from 'lucide-react';

interface PostAuthor {
  id: string;
  display_name: string;
  avatar_url?: string;
  major?: string;
  year?: string;
}

interface PostImage {
  url: string;
  fileName: string;
  fileType: string;
  mimeType: string;
}

interface Post {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  saves_count: number;
  visibility: 'public' | 'friends' | 'private';
  post_type: 'text' | 'image' | 'video' | 'poll';
  images?: PostImage[];
  location?: string;
  tags?: string[];
  mentions?: string[];
  is_liked?: boolean;
  is_saved?: boolean;
  author: PostAuthor;
}

interface EnhancedPostCardProps {
  post: Post;
  onLike?: (postId: string) => void;
  onComment?: (postId: string) => void;
  onShare?: (postId: string) => void;
  onSave?: (postId: string) => void;
  onEdit?: (postId: string) => void;
  onDelete?: (postId: string) => void;
  className?: string;
}

export const EnhancedPostCard: React.FC<EnhancedPostCardProps> = ({
  post,
  onLike,
  onComment,
  onShare,
  onSave,
  onEdit,
  onDelete,
  className = ''
}) => {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const isOwnPost = user?.id === post.user_id;
  const shouldTruncate = post.content.length > 300;
  const displayContent = shouldTruncate && !isExpanded 
    ? post.content.slice(0, 300) + '...' 
    : post.content;

  const getVisibilityIcon = () => {
    switch (post.visibility) {
      case 'public': return <Globe className="h-3 w-3" />;
      case 'friends': return <Users className="h-3 w-3" />;
      case 'private': return <Lock className="h-3 w-3" />;
    }
  };

  const getMediaIcon = () => {
    switch (post.post_type) {
      case 'image': return <ImageIcon className="h-3 w-3" />;
      case 'video': return <Video className="h-3 w-3" />;
      case 'poll': return <FileText className="h-3 w-3" />;
      default: return null;
    }
  };

  const handleActionClick = (action: string) => {
    switch (action) {
      case 'edit':
        onEdit?.(post.id);
        break;
      case 'delete':
        onDelete?.(post.id);
        break;
    }
    setShowActions(false);
  };

  return (
    <EnhancedCard variant="glass" className={`overflow-hidden ${className}`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1">
            <Avatar className="h-12 w-12 ring-2 ring-primary/20">
              <AvatarImage src={post.author.avatar_url} />
              <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold">
                {post.author.display_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-sm">{post.author.display_name || 'Anonymous'}</h3>
                {post.author.major && post.author.year && (
                  <Badge variant="secondary" className="text-xs">
                    {post.author.major} • {post.author.year}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}</span>
                {getVisibilityIcon()}
                {getMediaIcon()}
                {post.location && (
                  <>
                    <MapPin className="h-3 w-3" />
                    <span className="truncate max-w-24">{post.location}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {isOwnPost && (
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowActions(!showActions)}
                className="h-8 w-8 p-0"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
              
              {showActions && (
                <MessageActions
                  onEdit={() => handleActionClick('edit')}
                  onDelete={() => handleActionClick('delete')}
                  canEdit={true}
                  canDelete={true}
                  className="absolute right-0 top-8 z-10"
                />
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap break-words">{displayContent}</p>
            {shouldTruncate && (
              <Button
                variant="link"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-0 h-auto text-primary"
              >
                {isExpanded ? 'Show less' : 'Show more'}
              </Button>
            )}
          </div>

          {/* Media */}
          {post.images && post.images.length > 0 && (
            <div className="grid grid-cols-2 gap-2 rounded-lg overflow-hidden">
              {post.images.slice(0, 4).map((image, index) => (
                <motion.div
                  key={index}
                  className="relative aspect-square overflow-hidden bg-muted"
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <img
                    src={image.url}
                    alt={image.fileName}
                    className="w-full h-full object-cover"
                  />
                  {index === 3 && post.images.length > 4 && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="text-white font-medium">
                        +{post.images.length - 4} more
                      </span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {post.tags.map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-xs text-blue-600 border-blue-200 hover:bg-blue-50 cursor-pointer"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <Separator className="my-4" />

        {/* Engagement Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-4">
            {post.likes_count > 0 && (
              <span className="flex items-center gap-1">
                <Heart className="h-3 w-3 fill-red-500 text-red-500" />
                {post.likes_count}
              </span>
            )}
            {post.comments_count > 0 && (
              <span>{post.comments_count} comments</span>
            )}
            {post.shares_count > 0 && (
              <span>{post.shares_count} shares</span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            <span>124 views</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onLike?.(post.id)}
              className={`gap-2 ${post.is_liked ? 'text-red-500' : ''}`}
            >
              <Heart className={`h-4 w-4 ${post.is_liked ? 'fill-current' : ''}`} />
              <span className="hidden sm:inline">Like</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onComment?.(post.id)}
              className="gap-2"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Comment</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onShare?.(post.id)}
              className="gap-2"
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Share</span>
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSave?.(post.id)}
            className={`gap-2 ${post.is_saved ? 'text-primary' : ''}`}
          >
            <Bookmark className={`h-4 w-4 ${post.is_saved ? 'fill-current' : ''}`} />
          </Button>
        </div>
      </div>
    </EnhancedCard>
  );
};
