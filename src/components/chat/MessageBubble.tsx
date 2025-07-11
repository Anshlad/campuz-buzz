
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { type MessageWithAuthor } from '@/services/chatService';
import { formatDistanceToNow } from 'date-fns';
import { 
  MoreVertical, 
  Reply, 
  Pin, 
  Copy, 
  Edit, 
  Trash,
  Flag,
  Bookmark
} from 'lucide-react';
import { motion } from 'framer-motion';

interface MessageBubbleProps {
  message: MessageWithAuthor;
  isOwnMessage: boolean;
  showAvatar: boolean;
  onReply: (message: MessageWithAuthor) => void;
  onReaction: (messageId: string, emoji: string) => void;
  onPin: (messageId: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwnMessage,
  showAvatar,
  onReply,
  onReaction,
  onPin
}) => {
  const [showActions, setShowActions] = useState(false);

  const reactions = message.reactions as Record<string, string[]> || {};
  const commonEmojis = ['👍', '❤️', '😄', '😮', '😢', '😡'];

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.content);
  };

  return (
    <motion.div
      className={`group flex items-start space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors ${
        message.is_pinned ? 'bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500' : ''
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {showAvatar && (
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage src={message.author.avatar_url} />
          <AvatarFallback>
            {message.author.display_name?.charAt(0) || 'U'}
          </AvatarFallback>
        </Avatar>
      )}
      
      {!showAvatar && <div className="w-10" />}

      <div className="flex-1 min-w-0">
        {showAvatar && (
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-semibold text-sm">
              {message.author.display_name}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
            </span>
            {message.is_edited && (
              <Badge variant="outline" className="text-xs">
                edited
              </Badge>
            )}
            {message.is_pinned && (
              <Pin className="h-3 w-3 text-yellow-500" />
            )}
          </div>
        )}

        {/* Reply Context */}
        {message.reply_to && message.reply_message && (
          <div className="mb-2 pl-3 border-l-2 border-muted text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Reply className="h-3 w-3" />
              <span className="font-medium">
                {message.reply_message.author.display_name}
              </span>
            </div>
            <p className="truncate max-w-md">
              {message.reply_message.content}
            </p>
          </div>
        )}

        {/* Message Content */}
        <div className="prose prose-sm dark:prose-invert max-w-none">
          {message.content}
        </div>

        {/* Reactions */}
        {Object.keys(reactions).length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {Object.entries(reactions).map(([emoji, users]) => (
              <Button
                key={emoji}
                variant="outline"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={() => onReaction(message.id, emoji)}
              >
                {emoji} {users.length}
              </Button>
            ))}
          </div>
        )}

        {/* Quick Reactions */}
        {showActions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center space-x-1 mt-2"
          >
            {commonEmojis.map(emoji => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-sm hover:scale-110 transition-transform"
                onClick={() => onReaction(message.id, emoji)}
              >
                {emoji}
              </Button>
            ))}
          </motion.div>
        )}
      </div>

      {/* Message Actions */}
      {showActions && (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-shrink-0"
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onReply(message)}>
                <Reply className="h-4 w-4 mr-2" />
                Reply
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onPin(message.id)}>
                <Pin className="h-4 w-4 mr-2" />
                {message.is_pinned ? 'Unpin' : 'Pin'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyMessage}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Message
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bookmark className="h-4 w-4 mr-2" />
                Save
              </DropdownMenuItem>
              {isOwnMessage && (
                <>
                  <DropdownMenuItem>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <Trash className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </>
              )}
              {!isOwnMessage && (
                <DropdownMenuItem className="text-destructive">
                  <Flag className="h-4 w-4 mr-2" />
                  Report
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </motion.div>
      )}
    </motion.div>
  );
};
