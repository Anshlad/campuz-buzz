
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type FileUploadType = 'avatar' | 'post' | 'attachment' | 'community';

export interface UploadResult {
  fileName: string;
  fileSize: number;
  fileType: string;
  mimeType: string;
  url: string;
}

export interface FileValidation {
  valid: boolean;
  error?: string;
}

class FileUploadService {
  private maxSizes = {
    avatar: 5 * 1024 * 1024, // 5MB
    post: 10 * 1024 * 1024, // 10MB
    attachment: 25 * 1024 * 1024, // 25MB
    community: 5 * 1024 * 1024 // 5MB
  };

  private allowedTypes = {
    avatar: ['image/jpeg', 'image/png', 'image/webp'],
    post: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4', 'video/webm'],
    attachment: [], // All types allowed
    community: ['image/jpeg', 'image/png', 'image/webp']
  };

  validateFile(file: File, type: FileUploadType): FileValidation {
    if (file.size > this.maxSizes[type]) {
      return {
        valid: false,
        error: `File size exceeds ${this.maxSizes[type] / 1024 / 1024}MB limit`
      };
    }

    const allowedTypes = this.allowedTypes[type];
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not allowed`
      };
    }

    return { valid: true };
  }

  async uploadFile(
    file: File,
    type: FileUploadType,
    userId: string,
    onProgress?: (progress: number) => void
  ): Promise<UploadResult> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}_${Date.now()}.${fileExt}`;
    const bucketName = this.getBucketName(type);

    onProgress?.(0);

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw new Error(`Upload failed: ${error.message}`);
    }

    onProgress?.(100);

    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(fileName);

    return {
      fileName: file.name,
      fileSize: file.size,
      fileType: fileExt || '',
      mimeType: file.type,
      url: publicUrl
    };
  }

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
        return 'attachments';
    }
  }
}

export const fileUploadService = new FileUploadService();
