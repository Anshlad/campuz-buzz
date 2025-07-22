
import { supabase } from '@/integrations/supabase/client';

export interface UploadResult {
  fileName: string;
  fileSize: number;
  fileType: string;
  mimeType: string;
  url: string;
}

export type FileUploadType = 'avatar' | 'post' | 'attachment' | 'community';

interface ValidationResult {
  valid: boolean;
  error?: string;
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
        return 'attachments';
    }
  }

  private generateFileName(originalName: string, userId: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split('.').pop();
    return `${userId}/${timestamp}_${randomString}.${extension}`;
  }

  async uploadFile(
    file: File,
    type: FileUploadType,
    userId: string,
    onProgress?: (progress: number) => void
  ): Promise<UploadResult> {
    const bucketName = this.getBucketName(type);
    const fileName = this.generateFileName(file.name, userId);

    // Simulate progress updates
    const progressInterval = setInterval(() => {
      if (onProgress) {
        const progress = Math.min(90, Math.random() * 80 + 10);
        onProgress(progress);
      }
    }, 100);

    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      clearInterval(progressInterval);

      if (error) {
        throw new Error(`Upload failed: ${error.message}`);
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(data.path);

      if (onProgress) {
        onProgress(100);
      }

      return {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type.split('/')[1],
        mimeType: file.type,
        url: publicUrlData.publicUrl
      };
    } catch (error) {
      clearInterval(progressInterval);
      console.error('File upload error:', error);
      throw error instanceof Error ? error : new Error('Unknown upload error');
    }
  }

  async deleteFile(url: string, type: FileUploadType): Promise<void> {
    const bucketName = this.getBucketName(type);
    
    // Extract file path from URL
    const urlParts = url.split('/');
    const bucketIndex = urlParts.findIndex(part => part === bucketName);
    if (bucketIndex === -1) {
      throw new Error('Invalid file URL');
    }
    
    const filePath = urlParts.slice(bucketIndex + 1).join('/');

    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      throw new Error(`Delete failed: ${error.message}`);
    }
  }

  async uploadMultipleFiles(
    files: File[],
    type: FileUploadType,
    userId: string,
    onProgress?: (progress: number) => void
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];
    const totalFiles = files.length;

    for (let i = 0; i < totalFiles; i++) {
      const file = files[i];
      
      const fileProgress = (progress: number) => {
        const overallProgress = ((i / totalFiles) * 100) + (progress / totalFiles);
        onProgress?.(overallProgress);
      };

      try {
        const result = await this.uploadFile(file, type, userId, fileProgress);
        results.push(result);
      } catch (error) {
        console.error(`Failed to upload file ${file.name}:`, error);
        throw error;
      }
    }

    return results;
  }

  validateFile(file: File, type: FileUploadType): ValidationResult {
    // Define limits based on type
    let maxSizeInMB: number;
    let allowedTypes: string[];

    switch (type) {
      case 'avatar':
        maxSizeInMB = 5;
        allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        break;
      case 'post':
        maxSizeInMB = 10;
        allowedTypes = ['image/*', 'video/*'];
        break;
      case 'attachment':
        maxSizeInMB = 25;
        allowedTypes = []; // Allow all types
        break;
      case 'community':
        maxSizeInMB = 5;
        allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        break;
      default:
        maxSizeInMB = 10;
        allowedTypes = [];
    }

    // Check file size
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      return {
        valid: false,
        error: `File size must be less than ${maxSizeInMB}MB`
      };
    }

    // Check file type if specified
    if (allowedTypes.length > 0) {
      const isAllowed = allowedTypes.some(type => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.slice(0, -1));
        }
        return file.type === type;
      });

      if (!isAllowed) {
        return {
          valid: false,
          error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`
        };
      }
    }

    return { valid: true };
  }
}

export const fileUploadService = new FileUploadService();
