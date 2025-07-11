
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { chatService, type MessageWithAuthor, type Channel } from '@/services/chatService';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { VoiceChatButton } from './VoiceChatButton';
import { ChannelHeader } from './ChannelHeader';
import { 
  Send, 
  Smile, 
  Paperclip, 
  Hash,
  Volume2,
  Pin,
  Users,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatInterfaceProps {
  channel?: Channel;
  dmConversationId?: string;
  communityId?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  channel, 
  dmConversationId, 
  communityId 
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<MessageWithAuthor[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [replyTo, setReplyTo] = useState<MessageWithAuthor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (channel?.id || dmConversationId) {
      loadMessages();
      
      // Subscribe to new messages
      const unsubscribe = chatService.subscribeToMessages(
        channel?.id,
        dmConversationId,
        (newMessage) => {
          setMessages(prev => [...prev, newMessage]);
        }
      );

      // Subscribe to typing indicators
      const unsubscribeTyping = chatService.subscribeToTyping(
        channel?.id,
        dmConversationId,
        setTypingUsers
      );

      return () => {
        unsubscribe();
        unsubscribeTyping();
      };
    }
  }, [channel?.id, dmConversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const data = await chatService.getMessages(channel?.id, dmConversationId);
      setMessages(data);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !user) return;

    try {
      await chatService.sendMessage(
        messageInput.trim(),
        channel?.id,
        dmConversationId,
        replyTo?.id
      );
      setMessageInput('');
      setReplyTo(null);
      handleStopTyping();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleTyping = async () => {
    if (!isTyping) {
      setIsTyping(true);
      await chatService.startTyping(channel?.id, dmConversationId);
    }

    // Reset typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      handleStopTyping();
    }, 3000);
  };

  const handleStopTyping = async () => {
    if (isTyping) {
      setIsTyping(false);
      await chatService.stopTyping(channel?.id, dmConversationId);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    try {
      await chatService.reactToMessage(messageId, emoji);
    } catch (error) {
      console.error('Failed to react to message:', error);
    }
  };

  const handlePinMessage = async (messageId: string) => {
    try {
      await chatService.pinMessage(messageId, channel?.id, dmConversationId);
    } catch (error) {
      console.error('Failed to pin message:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Chat Header */}
      <ChannelHeader 
        channel={channel}
        dmConversationId={dmConversationId}
        communityId={communityId}
      />

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <MessageBubble
                  message={message}
                  isOwnMessage={message.user_id === user?.id}
                  showAvatar={index === 0 || messages[index - 1].user_id !== message.user_id}
                  onReply={setReplyTo}
                  onReaction={handleReaction}
                  onPin={handlePinMessage}
                />
              </motion.div>
            ))}
          </AnimatePresence>
          
          {/* Typing Indicator */}
          {typingUsers.length > 0 && (
            <TypingIndicator users={typingUsers.filter(id => id !== user?.id)} />
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Reply Preview */}
      {replyTo && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="px-4 py-2 bg-muted border-l-4 border-primary"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-muted-foreground">Replying to</span>
              <span className="font-medium">{replyTo.author.display_name}</span>
              <span className="text-muted-foreground truncate max-w-xs">
                {replyTo.content}
              </span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setReplyTo(null)}
            >
              ×
            </Button>
          </div>
        </motion.div>
      )}

      {/* Message Input */}
      <div className="p-4 border-t">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
          <div className="flex-1 relative">
            <Input
              value={messageInput}
              onChange={(e) => {
                setMessageInput(e.target.value);
                handleTyping();
              }}
              onBlur={handleStopTyping}
              placeholder={`Message ${channel ? `#${channel.name}` : 'direct message'}...`}
              className="pr-20 resize-none"
              maxLength={2000}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
              <Button size="sm" variant="ghost" type="button">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" type="button">
                <Smile className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <Button 
            type="submit" 
            disabled={!messageInput.trim()}
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
        <div className="text-xs text-muted-foreground mt-1">
          {messageInput.length}/2000 characters
        </div>
      </div>
    </div>
  );
};
