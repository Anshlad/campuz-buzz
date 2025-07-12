
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type FileUploadType = 'avatar' | 'post' | 'attachment' | 'community';

export interface UploadResult {
  url: string;
  path: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

class FileUploadService {
  private getBucketName(type: FileUploadType): string {
    switch (type) {
      case 'avatar':
        return 'avatars';
      case 'post':
        return 'posts';
      case 'attachment':
        return 'attachments';
      case 'community':
        return 'communities';
      default:
        return 'general';
    }
  }

  private generateFileName(originalName: string, userId: string): string {
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2);
    const extension = originalName.split('.').pop();
    return `${userId}/${timestamp}_${randomId}.${extension}`;
  }

  async uploadFile(
    file: File,
    type: FileUploadType,
    userId: string,
    onProgress?: (progress: number) => void
  ): Promise<UploadResult> {
    try {
      const bucketName = this.getBucketName(type);
      const fileName = this.generateFileName(file.name, userId);

      // Upload file to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      return {
        url: publicUrl,
        path: data.path,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type
      };
    } catch (error) {
      console.error('File upload error:', error);
      throw new Error('Failed to upload file');
    }
  }

  async deleteFile(path: string, type: FileUploadType): Promise<void> {
    try {
      const bucketName = this.getBucketName(type);
      const { error } = await supabase.storage
        .from(bucketName)
        .remove([path]);

      if (error) throw error;
    } catch (error) {
      console.error('File deletion error:', error);
      throw new Error('Failed to delete file');
    }
  }

  validateFile(file: File, type: FileUploadType): { valid: boolean; error?: string } {
    const maxSizes = {
      avatar: 5 * 1024 * 1024, // 5MB
      post: 10 * 1024 * 1024, // 10MB
      attachment: 25 * 1024 * 1024, // 25MB
      community: 5 * 1024 * 1024 // 5MB
    };

    const allowedTypes = {
      avatar: ['image/jpeg', 'image/png', 'image/webp'],
      post: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4'],
      attachment: ['image/*', 'video/*', 'audio/*', 'application/pdf', 'text/*'],
      community: ['image/jpeg', 'image/png', 'image/webp']
    };

    if (file.size > maxSizes[type]) {
      return {
        valid: false,
        error: `File size must be less than ${maxSizes[type] / (1024 * 1024)}MB`
      };
    }

    const typeCheck = allowedTypes[type].some(allowedType => {
      if (allowedType.endsWith('/*')) {
        return file.type.startsWith(allowedType.replace('/*', '/'));
      }
      return file.type === allowedType;
    });

    if (!typeCheck) {
      return {
        valid: false,
        error: 'File type not supported'
      };
    }

    return { valid: true };
  }
}

export const fileUploadService = new FileUploadService();
