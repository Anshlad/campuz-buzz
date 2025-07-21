
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Camera, Upload, X } from 'lucide-react';
import { fileUploadService } from '@/services/fileUploadService';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  fallbackText: string;
  onAvatarChange: (url: string) => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatarUrl,
  fallbackText,
  onAvatarChange,
  size = 'lg'
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const sizeClasses = {
    sm: 'h-12 w-12',
    md: 'h-16 w-16', 
    lg: 'h-24 w-24',
    xl: 'h-32 w-32'
  };

  const handleFileSelect = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Avatar image must be less than 5MB",
        variant: "destructive"
      });
      return;
    }

    // Create preview
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const result = await fileUploadService.uploadFile(
        file,
        'avatar',
        'current-user', // This should come from auth context
        (progress) => {
          setUploadProgress(progress);
        }
      );

      onAvatarChange(result.url);
      
      toast({
        title: "Avatar updated",
        description: "Your profile picture has been updated successfully"
      });

    } catch (error) {
      console.error('Avatar upload failed:', error);
      
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : 'Failed to upload avatar',
        variant: "destructive"
      });

      // Reset preview on error
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      
      // Clean up preview URL
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const removeAvatar = () => {
    onAvatarChange('');
    setPreviewUrl(null);
    toast({
      title: "Avatar removed",
      description: "Your profile picture has been removed"
    });
  };

  const displayUrl = previewUrl || currentAvatarUrl;

  return (
    <div className="relative inline-block">
      <div
        className="relative group cursor-pointer"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
      >
        <Avatar className={`${sizeClasses[size]} ring-4 ring-background shadow-lg`}>
          <AvatarImage src={displayUrl} />
          <AvatarFallback className="bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold text-lg">
            {fallbackText}
          </AvatarFallback>
        </Avatar>

        {/* Upload Overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
          <Camera className="h-6 w-6 text-white" />
        </div>

        {/* Upload Progress */}
        <AnimatePresence>
          {isUploading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 rounded-full flex items-center justify-center"
            >
              <div className="text-center">
                <div className="w-16 mb-2">
                  <Progress value={uploadProgress} className="h-1" />
                </div>
                <p className="text-xs text-white">{Math.round(uploadProgress)}%</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Remove Button */}
      {displayUrl && !isUploading && (
        <Button
          size="sm"
          variant="destructive"
          className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
          onClick={(e) => {
            e.stopPropagation();
            removeAvatar();
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Upload Instructions */}
      <p className="text-xs text-muted-foreground text-center mt-2">
        Click or drag to upload
      </p>
    </div>
  );
};
