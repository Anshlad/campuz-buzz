
import React from 'react';
import { EnhancedMedia } from './EnhancedMedia';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackSrc?: string;
  placeholder?: string;
  sizes?: string;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  width?: number;
  height?: number;
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  fallbackSrc = '/placeholder.svg',
  placeholder,
  priority = false,
  onLoad,
  onError,
  width,
  height
}) => {
  return (
    <EnhancedMedia
      src={src}
      alt={alt}
      type="image"
      className={className}
      fallbackSrc={fallbackSrc}
      lazy={!priority}
      onLoad={onLoad}
      onError={onError}
      width={width}
      height={height}
    />
  );
};
