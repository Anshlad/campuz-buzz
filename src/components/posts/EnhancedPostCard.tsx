
import React, { useState } from 'react';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedButton } from '@/components/ui/enhanced-button';
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
import { motion, AnimatePresence } from 'framer-motion';

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <EnhancedCard variant="elevated" className="mb-6 overflow-hidden">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start space-x-3">
              <motion.div whileHover={{ scale: 1.05 }}>
                <Avatar className="h-12 w-12 ring-2 ring-border/50 hover:ring-primary/50 transition-all">
                  <AvatarImage src={post.profiles?.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-r from-primary/20 to-accent/20">
                    {post.profiles?.display_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
              <div>
                <h3 className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer">
                  {post.profiles?.display_name || 'Anonymous'}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {post.profiles?.major && post.profiles?.year 
                    ? `${post.profiles.major} • ${post.profiles.year}`
                    : 'Student'
                  }
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
            <EnhancedButton variant="ghost" size="sm">
              <MoreHorizontal className="h-4 w-4" />
            </EnhancedButton>
          </div>

          {/* Title */}
          {post.title && (
            <h2 className="text-xl font-bold text-foreground mb-3 leading-tight">{post.title}</h2>
          )}

          {/* Content */}
          <div className="mb-4">
            <p className="text-foreground leading-relaxed mb-3 whitespace-pre-wrap">{post.content}</p>
            
            {post.image_url && (
              <motion.div 
                className="rounded-xl overflow-hidden bg-muted/50 shadow-lg"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <img 
                  src={post.image_url} 
                  alt="Post content" 
                  className="w-full h-64 object-cover transition-transform hover:scale-105"
                />
              </motion.div>
            )}
          </div>

          {/* Hashtags */}
          {post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {post.hashtags.map((tag) => (
                <Badge 
                  key={tag} 
                  variant="secondary" 
                  className="text-xs cursor-pointer hover:bg-primary/20 hover:text-primary transition-colors"
                >
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
            <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
              <div className="flex -space-x-1">
                {topReactions.map(([type]) => (
                  <motion.span 
                    key={type} 
                    className="text-lg"
                    whileHover={{ scale: 1.2 }}
                  >
                    {reactionEmojis[type as keyof typeof reactionEmojis]?.emoji}
                  </motion.span>
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
          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <div className="flex items-center space-x-2">
              {/* Like Button with Reaction Picker */}
              <div className="relative">
                <EnhancedButton 
                  variant="ghost" 
                  size="sm"
                  onMouseEnter={() => setShowReactions(true)}
                  onMouseLeave={() => setShowReactions(false)}
                  onClick={() => onReact(post.id, 'like')}
                  className={`flex items-center space-x-2 ${
                    post.reactions.like?.hasReacted ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <ThumbsUp className={`h-4 w-4 ${post.reactions.like?.hasReacted ? 'fill-current' : ''}`} />
                  <span>{totalReactions || 0}</span>
                </EnhancedButton>

                {/* Reaction Picker */}
                <AnimatePresence>
                  {showReactions && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.9 }}
                      className="absolute bottom-full left-0 mb-2 bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-xl p-2 flex space-x-1 z-10"
                    >
                      {Object.entries(reactionEmojis).map(([type, { emoji }]) => (
                        <motion.button
                          key={type}
                          onClick={() => {
                            onReact(post.id, type);
                            setShowReactions(false);
                          }}
                          className="text-xl hover:scale-125 transition-transform p-1 rounded-lg hover:bg-accent/50"
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          {emoji}
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <EnhancedButton 
                variant="ghost" 
                size="sm"
                onClick={() => setShowComments(!showComments)}
                className="flex items-center space-x-2 text-muted-foreground hover:text-primary"
              >
                <MessageSquare className="h-4 w-4" />
                <span>{post.comments_count}</span>
              </EnhancedButton>
              
              <EnhancedButton 
                variant="ghost" 
                size="sm" 
                onClick={() => onShare(post.id)}
                className="flex items-center space-x-2 text-muted-foreground hover:text-primary"
              >
                <Share2 className="h-4 w-4" />
                <span>{post.shares_count}</span>
              </EnhancedButton>
            </div>

            <EnhancedButton
              variant="ghost"
              size="sm"
              onClick={() => onSave(post.id)}
              className={`${post.is_saved ? 'text-amber-500' : 'text-muted-foreground hover:text-amber-500'}`}
            >
              {post.is_saved ? (
                <BookmarkCheck className="h-4 w-4 fill-current" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </EnhancedButton>
          </div>

          {/* Comments Section */}
          <AnimatePresence>
            {showComments && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-border/50"
              >
                <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
                  Comments section coming soon...
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </EnhancedCard>
    </motion.div>
  );
};
