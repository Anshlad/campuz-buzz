
import React, { useState, useRef } from 'react';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { EnhancedFileUpload } from '@/components/common/EnhancedFileUpload';
import { 
  Image, 
  MapPin, 
  Hash, 
  AtSign, 
  Globe, 
  Lock, 
  Users,
  X,
  Smile
} from 'lucide-react';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface EnhancedPostCreatorProps {
  onSubmit: (post: any) => Promise<void>;
  placeholder?: string;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}

export const EnhancedPostCreator: React.FC<EnhancedPostCreatorProps> = ({
  onSubmit,
  placeholder = "What's happening?",
  expanded,
  onExpandedChange
}) => {
  const [content, setContent] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [location, setLocation] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'friends' | 'private'>('public');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [mentions, setMentions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(expanded || false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const { profile } = useUserProfile();
  const { toast } = useToast();

  const handleExpand = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    onExpandedChange?.(newExpanded);
    if (newExpanded && textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleContentChange = (value: string) => {
    setContent(value);
    
    // Extract hashtags
    const hashtagMatches = value.match(/#\w+/g) || [];
    setHashtags(hashtagMatches.map(tag => tag.slice(1)));
    
    // Extract mentions
    const mentionMatches = value.match(/@\w+/g) || [];
    setMentions(mentionMatches.map(mention => mention.slice(1)));
  };

  const handleSubmit = async () => {
    if (!content.trim() && images.length === 0) {
      toast({
        title: "Content required",
        description: "Please add some content or images to your post.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        content: content.trim(),
        images,
        location: location.trim() || undefined,
        visibility,
        hashtags,
        mentions,
        post_type: images.length > 0 ? 'image' : 'text'
      });

      // Reset form
      setContent('');
      setImages([]);
      setLocation('');
      setVisibility('public');
      setHashtags([]);
      setMentions([]);
      setIsExpanded(false);
      onExpandedChange?.(false);
      
      toast({
        title: "Post created",
        description: "Your post has been shared successfully!"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create post. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const visibilityOptions = [
    { value: 'public', icon: Globe, label: 'Public' },
    { value: 'friends', icon: Users, label: 'Friends' },
    { value: 'private', icon: Lock, label: 'Only me' }
  ];

  const currentVisibility = visibilityOptions.find(opt => opt.value === visibility);

  return (
    <EnhancedCard variant="glass" className="overflow-hidden">
      <div className="p-4">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10 ring-2 ring-primary/20">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold">
              {profile?.display_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => handleContentChange(e.target.value)}
              placeholder={placeholder}
              className={`min-h-[60px] resize-none border-none bg-transparent p-0 text-lg placeholder:text-muted-foreground focus-visible:ring-0 ${
                isExpanded ? 'min-h-[120px]' : ''
              }`}
              onFocus={handleExpand}
            />
            
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 space-y-4"
                >
                  {/* File Upload */}
                  <EnhancedFileUpload
                    onFilesSelected={(files) => setImages([...images, ...files])}
                    accept="image/*"
                    multiple
                    maxFiles={4}
                    className="border-dashed border-2 border-border/50 rounded-lg p-4"
                  />
                  
                  {/* Image Preview */}
                  {images.length > 0 && (
                    <div className="grid grid-cols-2 gap-2">
                      {images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Upload ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => setImages(images.filter((_, i) => i !== index))}
                            className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Location Input */}
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Add location..."
                      className="flex-1 bg-transparent border-none outline-none placeholder:text-muted-foreground"
                    />
                  </div>
                  
                  {/* Hashtags and Mentions Preview */}
                  {(hashtags.length > 0 || mentions.length > 0) && (
                    <div className="flex flex-wrap gap-2">
                      {hashtags.map((tag) => (
                        <Badge key={`#${tag}`} variant="secondary" className="text-blue-600 bg-blue-100 dark:bg-blue-900/20">
                          <Hash className="h-3 w-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                      {mentions.map((mention) => (
                        <Badge key={`@${mention}`} variant="secondary" className="text-green-600 bg-green-100 dark:bg-green-900/20">
                          <AtSign className="h-3 w-3 mr-1" />
                          {mention}
                        </Badge>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Bottom Actions */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center gap-2">
            {!isExpanded && (
              <>
                <EnhancedButton variant="ghost" size="sm" onClick={handleExpand}>
                  <Image className="h-4 w-4" />
                </EnhancedButton>
                <EnhancedButton variant="ghost" size="sm" onClick={handleExpand}>
                  <Smile className="h-4 w-4" />
                </EnhancedButton>
              </>
            )}
            
            {/* Visibility Selector */}
            <div className="flex items-center gap-1">
              {currentVisibility && (
                <>
                  <currentVisibility.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{currentVisibility.label}</span>
                </>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {content.length > 0 && (
              <span className={`text-sm ${content.length > 280 ? 'text-red-500' : 'text-muted-foreground'}`}>
                {content.length}/280
              </span>
            )}
            
            <EnhancedButton
              onClick={handleSubmit}
              disabled={(!content.trim() && images.length === 0) || loading || content.length > 280}
              size="sm"
              className="bg-primary hover:bg-primary/90"
            >
              {loading ? 'Posting...' : 'Post'}
            </EnhancedButton>
          </div>
        </div>
      </div>
    </EnhancedCard>
  );
};
