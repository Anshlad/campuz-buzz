import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { PostData, CommentData, PostsService } from '@/services/postsService';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface PostCardProps {
  post: PostData;
  onPostUpdate?: () => void;
}

export function PostCard({ post, onPostUpdate }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLiking, setIsLiking] = useState(false);
  const [isCommenting, setIsCommenting] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const { toast } = useToast();

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);

    try {
      if (post.is_liked) {
        await PostsService.unlikePost(post.id);
      } else {
        await PostsService.likePost(post.id);
      }
      onPostUpdate?.();
    } catch (error) {
      console.error('Error handling like:', error);
      toast({
        title: "Error",
        description: "Failed to update like. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLiking(false);
    }
  };

  const handleToggleComments = async () => {
    if (!showComments && comments.length === 0) {
      setIsLoadingComments(true);
      try {
        const fetchedComments = await PostsService.getComments(post.id);
        setComments(fetchedComments);
      } catch (error) {
        console.error('Error loading comments:', error);
        toast({
          title: "Error",
          description: "Failed to load comments.",
          variant: "destructive"
        });
      } finally {
        setIsLoadingComments(false);
      }
    }
    setShowComments(!showComments);
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || isCommenting) return;
    
    setIsCommenting(true);
    try {
      await PostsService.addComment(post.id, newComment.trim());
      setNewComment('');
      
      // Refresh comments
      const updatedComments = await PostsService.getComments(post.id);
      setComments(updatedComments);
      onPostUpdate?.();
      
      toast({
        description: "Comment added successfully!"
      });
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCommenting(false);
    }
  };

  return (
    <Card className="p-6 space-y-4">
      {/* Post Header */}
      <div className="flex items-center space-x-3">
        <Avatar>
          <AvatarImage src={post.author.avatar} alt={post.author.display_name} />
          <AvatarFallback>
            {post.author.display_name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold">{post.author.display_name}</p>
          <p className="text-sm text-muted-foreground">
            @{post.author.username} • {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>

      {/* Post Content */}
      <div className="space-y-3">
        <p className="text-foreground">{post.content}</p>
        
        {/* Post Image */}
        {post.image_url && (
          <div className="rounded-lg overflow-hidden">
            <img 
              src={post.image_url} 
              alt="Post content" 
              className="w-full h-auto max-h-96 object-cover"
              loading="lazy"
            />
          </div>
        )}
      </div>

      {/* Post Actions */}
      <div className="flex items-center space-x-6 pt-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          disabled={isLiking}
          className={cn(
            "flex items-center space-x-2",
            post.is_liked && "text-red-500"
          )}
        >
          <Heart className={cn("h-4 w-4", post.is_liked && "fill-current")} />
          <span>{post.likes}</span>
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleComments}
          className="flex items-center space-x-2"
        >
          <MessageCircle className="h-4 w-4" />
          <span>{post.comments}</span>
        </Button>

        <Button variant="ghost" size="sm" className="flex items-center space-x-2">
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </Button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="space-y-4 pt-4 border-t">
          {/* Add Comment Form */}
          <div className="space-y-2">
            <Textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px]"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleAddComment}
                disabled={!newComment.trim() || isCommenting}
                size="sm"
              >
                {isCommenting ? "Posting..." : "Post Comment"}
              </Button>
            </div>
          </div>

          {/* Comments List */}
          {isLoadingComments ? (
            <div className="text-center py-4">Loading comments...</div>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3 p-3 bg-muted/50 rounded-lg">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.author.avatar} alt={comment.author.display_name} />
                    <AvatarFallback>
                      {comment.author.display_name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">{comment.author.display_name}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm">{comment.content}</p>
                  </div>
                </div>
              ))}
              
              {comments.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  No comments yet. Be the first to comment!
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}