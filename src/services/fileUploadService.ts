
import { supabase } from '@/integrations/supabase/client';

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
        error: `File type ${file.type} is not allowed for ${type} uploads`
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
    // Validate file first
    const validation = this.validateFile(file, type);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}_${Date.now()}.${fileExt}`;
    const bucketName = this.getBucketName(type);

    onProgress?.(0);

    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
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
    } catch (error) {
      console.error('File upload error:', error);
      throw error instanceof Error ? error : new Error('Unknown upload error');
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

    for (let i = 0; i < files.length; i++) {
      try {
        const result = await this.uploadFile(files[i], type, userId, (fileProgress) => {
          const overallProgress = ((i / totalFiles) * 100) + ((fileProgress / totalFiles));
          onProgress?.(overallProgress);
        });
        results.push(result);
      } catch (error) {
        console.error(`Failed to upload file ${files[i].name}:`, error);
        // Continue with other files, but note the failure
        throw error;
      }
    }

    return results;
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

  async deleteFile(url: string, type: FileUploadType): Promise<void> {
    try {
      const bucketName = this.getBucketName(type);
      const fileName = url.split('/').pop();
      
      if (!fileName) {
        throw new Error('Invalid file URL');
      }

      const { error } = await supabase.storage
        .from(bucketName)
        .remove([fileName]);

      if (error) {
        throw new Error(`Delete failed: ${error.message}`);
      }
    } catch (error) {
      console.error('File deletion error:', error);
      throw error instanceof Error ? error : new Error('Unknown deletion error');
    }
  }
}

export const fileUploadService = new FileUploadService();
