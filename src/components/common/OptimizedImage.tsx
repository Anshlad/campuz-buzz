
import React, { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useLazyLoading } from '@/hooks/useLazyLoading';

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
}

export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className,
  fallbackSrc = '/placeholder.svg',
  placeholder,
  sizes,
  priority = false,
  onLoad,
  onError
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(priority ? src : '');
  
  const { ref, hasIntersected } = useLazyLoading({
    enabled: !priority,
    threshold: 0.1,
    rootMargin: '50px'
  });

  const handleLoad = useCallback(() => {
    setImageLoaded(true);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    } else {
      setImageError(true);
    }
    onError?.();
  }, [currentSrc, fallbackSrc, onError]);

  // Load image when it becomes visible or if priority is set
  React.useEffect(() => {
    if ((hasIntersected || priority) && !currentSrc && !imageError) {
      setCurrentSrc(src);
    }
  }, [hasIntersected, priority, src, currentSrc, imageError]);

  if (imageError && !placeholder) {
    return (
      <div 
        ref={ref}
        className={cn(
          "flex items-center justify-center bg-muted text-muted-foreground text-sm",
          className
        )}
      >
        Failed to load image
      </div>
    );
  }

  return (
    <div ref={ref} className={cn("relative overflow-hidden", className)}>
      {/* Placeholder or loading state */}
      {(!imageLoaded || !currentSrc) && (
        <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
          {placeholder && (
            <img 
              src={placeholder} 
              alt="" 
              className="opacity-50 max-w-full max-h-full object-cover"
            />
          )}
        </div>
      )}
      
      {/* Actual image */}
      {currentSrc && (
        <img
          src={currentSrc}
          alt={alt}
          sizes={sizes}
          className={cn(
            "transition-opacity duration-300",
            imageLoaded ? "opacity-100" : "opacity-0",
            className
          )}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? "eager" : "lazy"}
        />
      )}
    </div>
  );
};
