import React, { useState, useEffect } from 'react';

/**
 * OptimizedImage component for better image loading and performance
 * Supports:
 * - Lazy loading
 * - Responsive sizes
 * - Blurhash or placeholder
 * - Error handling
 * - Loading animation
 */
const OptimizedImage = ({
  src,
  alt,
  className = '',
  width,
  height,
  sizes = '100vw',
  blurhash,
  placeholderSrc,
  objectFit = 'cover',
  priority = false,
  onLoad,
  onError,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(!priority);
  const [hasError, setHasError] = useState(false);
  const [imageSrc, setImageSrc] = useState(src);

  // Reset loading state when the source changes
  useEffect(() => {
    setIsLoading(!priority);
    setHasError(false);
    setImageSrc(src);
  }, [src, priority]);

  // Handle successful image load
  const handleLoad = (e) => {
    setIsLoading(false);
    if (onLoad) onLoad(e);
  };

  // Handle image loading errors
  const handleError = (e) => {
    setHasError(true);
    setIsLoading(false);
    
    // Try to use provided placeholder or fallback
    if (placeholderSrc) {
      setImageSrc(placeholderSrc);
    } else {
      // Generate a placeholder with the alt text
      setImageSrc(`https://via.placeholder.com/640x360?text=${encodeURIComponent(alt || 'Image')}`);
    }
    
    if (onError) onError(e);
  };

  // Generate srcSet for responsive images
  const generateSrcSet = () => {
    if (!src || src.startsWith('http') || src.startsWith('data:') || src.includes('placeholder')) {
      return undefined;
    }
    
    // Extract path parts for generating srcSet
    const lastDotIndex = src.lastIndexOf('.');
    if (lastDotIndex === -1) return undefined;
    
    const path = src.substring(0, lastDotIndex);
    const ext = src.substring(lastDotIndex);
    
    return `
      ${path}-320w${ext} 320w,
      ${path}-640w${ext} 640w,
      ${path}-768w${ext} 768w,
      ${path}-1024w${ext} 1024w,
      ${path}-1280w${ext} 1280w
    `;
  };
  
  return (
    <div 
      className={`relative overflow-hidden ${className}`} 
      style={{ width: width || '100%', height: height || 'auto' }}
    >
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
          <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Blurhash placeholder */}
      {blurhash && isLoading && (
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${blurhash})`,
            filter: 'blur(10px)',
            transform: 'scale(1.1)'
          }}
        />
      )}

      {/* Actual image */}
      <img
        src={imageSrc}
        alt={alt || ''}
        srcSet={generateSrcSet()}
        sizes={sizes}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={handleLoad}
        onError={handleError}
        style={{ 
          objectFit, 
          width: '100%', 
          height: '100%',
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.3s ease'
        }}
        {...props}
      />
    </div>
  );
};

export default OptimizedImage; 