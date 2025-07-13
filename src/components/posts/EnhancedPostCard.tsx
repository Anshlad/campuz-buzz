
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  Bookmark, 
  BookmarkCheck,
  Smile,
  Laugh,
  ThumbsUp,
  Eye,
  Frown,
  MoreHorizontal 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PostReaction {
  reaction_type: string;
  count: number;
  hasReacted: boolean;
}

interface EnhancedPost {
  id: string;
  user_id: string;
  title?: string;
  content: string;
  image_url?: string;
  post_type: string;
  tags?: string[];
  likes_count: number;
  comments_count: number;
  shares_count: number;
  saves_count: number;
  reactions: Record<string, PostReaction>;
  created_at: string;
  profiles?: {
    display_name: string;
    avatar_url?: string;
    major?: string;
    year?: string;
  };
  is_saved: boolean;
  hashtags: string[];
}

interface EnhancedPostCardProps {
  post: EnhancedPost;
  onReact: (postId: string, reactionType: string) => void;
  onSave: (postId: string) => void;
  onShare: (postId: string) => void;
}

const reactionEmojis = {
  like: { icon: ThumbsUp, emoji: '👍' },
  love: { icon: Heart, emoji: '❤️' },
  laugh: { icon: Laugh, emoji: '😂' },
  wow: { icon: Eye, emoji: '😮' },
  sad: { icon: Frown, emoji: '😢' },
  angry: { icon: MoreHorizontal, emoji: '😠' }
};

export const EnhancedPostCard: React.FC<EnhancedPostCardProps> = ({ 
  post, 
  onReact, 
  onSave, 
  onShare 
}) => {
  const [showReactions, setShowReactions] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const topReactions = Object.entries(post.reactions)
    .sort(([,a], [,b]) => b.count - a.count)
    .slice(0, 3);

  const totalReactions = Object.values(post.reactions).reduce((sum, r) => sum + r.count, 0);

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={post.profiles?.avatar_url} />
              <AvatarFallback>
                {post.profiles?.display_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-900">
                {post.profiles?.display_name || 'Anonymous'}
              </h3>
              <p className="text-sm text-gray-500">
                {post.profiles?.major && post.profiles?.year 
                  ? `${post.profiles.major} • ${post.profiles.year}`
                  : 'Student'
                }
              </p>
              <p className="text-xs text-gray-400">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Title */}
        {post.title && (
          <h2 className="text-xl font-bold text-gray-900 mb-3">{post.title}</h2>
        )}

        {/* Content */}
        <div className="mb-4">
          <p className="text-gray-800 leading-relaxed mb-3">{post.content}</p>
          
          {post.image_url && (
            <div className="rounded-lg overflow-hidden bg-gray-100">
              <img 
                src={post.image_url} 
                alt="Post content" 
                className="w-full h-64 object-cover"
              />
            </div>
          )}
        </div>

        {/* Hashtags */}
        {post.hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.hashtags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs cursor-pointer hover:bg-blue-100">
                #{tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Reaction Summary */}
        {totalReactions > 0 && (
          <div className="flex items-center gap-2 mb-3 text-sm text-gray-600">
            <div className="flex -space-x-1">
              {topReactions.map(([type]) => (
                <span key={type} className="text-lg">
                  {reactionEmojis[type as keyof typeof reactionEmojis]?.emoji}
                </span>
              ))}
            </div>
            <span>{totalReactions} reactions</span>
            {post.comments_count > 0 && (
              <>
                <span>•</span>
                <span>{post.comments_count} comments</span>
              </>
            )}
            {post.shares_count > 0 && (
              <>
                <span>•</span>
                <span>{post.shares_count} shares</span>
              </>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            {/* Like Button with Reaction Picker */}
            <div className="relative">
              <Button 
                variant="ghost" 
                size="sm"
                onMouseEnter={() => setShowReactions(true)}
                onMouseLeave={() => setShowReactions(false)}
                onClick={() => onReact(post.id, 'like')}
                className={`flex items-center space-x-2 ${
                  post.reactions.like?.hasReacted ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                <ThumbsUp className={`h-4 w-4 ${post.reactions.like?.hasReacted ? 'fill-current' : ''}`} />
                <span>{totalReactions || 0}</span>
              </Button>

              {/* Reaction Picker */}
              {showReactions && (
                <div className="absolute bottom-full left-0 mb-2 bg-white border rounded-lg shadow-lg p-2 flex space-x-1 z-10">
                  {Object.entries(reactionEmojis).map(([type, { emoji }]) => (
                    <button
                      key={type}
                      onClick={() => {
                        onReact(post.id, type);
                        setShowReactions(false);
                      }}
                      className="text-xl hover:scale-125 transition-transform p-1"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="flex items-center space-x-2 text-gray-500"
            >
              <MessageSquare className="h-4 w-4" />
              <span>{post.comments_count}</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onShare(post.id)}
              className="flex items-center space-x-2 text-gray-500"
            >
              <Share2 className="h-4 w-4" />
              <span>{post.shares_count}</span>
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onSave(post.id)}
            className={`${post.is_saved ? 'text-yellow-600' : 'text-gray-500'}`}
          >
            {post.is_saved ? (
              <BookmarkCheck className="h-4 w-4 fill-current" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="text-sm text-gray-500">
              Comments will be implemented next...
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
