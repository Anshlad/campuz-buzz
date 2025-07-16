
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Image, Video, MapPin, Users, Hash, AtSign, Smile } from 'lucide-react';
import { EnhancedButton } from '@/components/ui/enhanced-button';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { EnhancedFileUpload } from '@/components/common/EnhancedFileUpload';
import type { UploadResult } from '@/services/fileUploadService';

interface PostData {
  content: string;
  title?: string;
  type: 'text' | 'image' | 'video' | 'poll';
  images?: string[];
  location?: string;
  tags?: string[];
  mentions?: string[];
  visibility: 'public' | 'private' | 'community';
}

interface EnhancedPostCreatorProps {
  onSubmit: (postData: PostData) => Promise<void>;
  className?: string;
  placeholder?: string;
  communityId?: string;
}

export const EnhancedPostCreator: React.FC<EnhancedPostCreatorProps> = ({
  onSubmit,
  className = '',
  placeholder = "What's on your mind?",
  communityId
}) => {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const { toast } = useToast();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadResult[]>([]);
  const [extractedTags, setExtractedTags] = useState<string[]>([]);
  const [extractedMentions, setExtractedMentions] = useState<string[]>([]);

  const extractHashtagsAndMentions = (text: string) => {
    const hashtags = (text.match(/#[a-zA-Z0-9_]+/g) || []).map(tag => tag.slice(1));
    const mentions = (text.match(/@[a-zA-Z0-9_]+/g) || []).map(mention => mention.slice(1));
    
    setExtractedTags(hashtags);
    setExtractedMentions(mentions);
  };

  const handleContentChange = (value: string) => {
    setContent(value);
    extractHashtagsAndMentions(value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() && uploadedFiles.length === 0) {
      toast({
        title: 'Cannot create empty post',
        description: 'Please add some content or media',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const postData: PostData = {
        content: content.trim(),
        title: title.trim() || undefined,
        type: uploadedFiles.some(f => f.mimeType.startsWith('image/')) ? 'image' :
              uploadedFiles.some(f => f.mimeType.startsWith('video/')) ? 'video' : 'text',
        images: uploadedFiles.filter(f => f.mimeType.startsWith('image/')).map(f => f.url),
        location: location.trim() || undefined,
        tags: extractedTags,
        mentions: extractedMentions,
        visibility: communityId ? 'community' : 'public'
      };

      await onSubmit(postData);
      
      // Reset form
      setContent('');
      setTitle('');
      setLocation('');
      setUploadedFiles([]);
      setExtractedTags([]);
      setExtractedMentions([]);
      setShowFileUpload(false);
      
      toast({
        title: 'Post created!',
        description: 'Your post has been shared successfully.'
      });
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: 'Failed to create post',
        description: 'Please try again later.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFilesUploaded = (results: UploadResult[]) => {
    setUploadedFiles(prev => [...prev, ...results]);
  };

  const removeUploadedFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <EnhancedCard variant="elevated" className={`${className}`}>
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10 ring-2 ring-primary/20">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-primary-foreground font-semibold">
              {profile?.display_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold text-sm">{profile?.display_name || 'Anonymous'}</p>
            <p className="text-xs text-muted-foreground">
              {profile?.major && profile?.year ? `${profile.major} • ${profile.year}` : 'Student'}
            </p>
          </div>
        </div>

        {/* Title Input (Optional) */}
        <Input
          placeholder="Add a title (optional)"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="font-semibold text-lg border-none bg-transparent p-0 focus-visible:ring-0"
        />

        {/* Content Textarea */}
        <Textarea
          ref={textareaRef}
          placeholder={placeholder}
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          className="min-h-[100px] border-none bg-transparent resize-none text-base leading-relaxed focus-visible:ring-0"
        />

        {/* Tags and Mentions Preview */}
        {(extractedTags.length > 0 || extractedMentions.length > 0) && (
          <div className="flex flex-wrap gap-2">
            {extractedTags.map((tag, index) => (
              <Badge key={`tag-${index}`} variant="secondary" className="bg-blue-100 text-blue-700">
                <Hash className="h-3 w-3 mr-1" />
                {tag}
              </Badge>
            ))}
            {extractedMentions.map((mention, index) => (
              <Badge key={`mention-${index}`} variant="secondary" className="bg-green-100 text-green-700">
                <AtSign className="h-3 w-3 mr-1" />
                {mention}
              </Badge>
            ))}
          </div>
        )}

        {/* File Upload Area */}
        {showFileUpload && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <EnhancedFileUpload
              type="post"
              multiple
              maxFiles={4}
              onFilesUploaded={handleFilesUploaded}
              accept="image/*,video/*"
            />
          </motion.div>
        )}

        {/* Uploaded Files Preview */}
        {uploadedFiles.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="relative">
                <img
                  src={file.url}
                  alt={file.fileName}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <EnhancedButton
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2 h-6 w-6 p-0"
                  onClick={() => removeUploadedFile(index)}
                >
                  <X className="h-3 w-3" />
                </EnhancedButton>
              </div>
            ))}
          </div>
        )}

        {/* Location Input */}
        {location !== undefined && (
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Add location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="border-none bg-transparent p-0 focus-visible:ring-0"
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex items-center space-x-2">
            <EnhancedButton
              variant="ghost"
              size="sm"
              onClick={() => setShowFileUpload(!showFileUpload)}
              className="text-muted-foreground hover:text-foreground"
            >
              <Image className="h-4 w-4 mr-2" />
              Photo
            </EnhancedButton>
            
            <EnhancedButton
              variant="ghost"
              size="sm"
              onClick={() => setLocation(location === undefined ? '' : undefined)}
              className="text-muted-foreground hover:text-foreground"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Location
            </EnhancedButton>
          </div>

          <EnhancedButton
            onClick={handleSubmit}
            disabled={isSubmitting || (!content.trim() && uploadedFiles.length === 0)}
            gradient
            glow
            className="min-w-[100px]"
          >
            {isSubmitting ? 'Posting...' : 'Post'}
          </EnhancedButton>
        </div>
      </div>
    </EnhancedCard>
  );
};
