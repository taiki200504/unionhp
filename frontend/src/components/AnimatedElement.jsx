import React, { useEffect, useRef, useState } from 'react';

/**
 * AnimatedElement component that adds animations to elements when they enter the viewport
 * Supports various animation types, durations, and delays
 */
const AnimatedElement = ({
  children,
  animation = 'fade-up', // fade-up, fade-down, fade-left, fade-right, zoom-in, zoom-out
  duration = 0.6, // seconds
  delay = 0, // seconds
  threshold = 0.2, // 0-1 how much of element needs to be visible
  once = true, // whether to only animate once
  className = '',
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // If we should animate and either haven't animated yet or are set to animate multiple times
        if (entry.isIntersecting && (!hasAnimated || !once)) {
          setIsVisible(true);
          if (once) setHasAnimated(true);
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { 
        root: null,
        rootMargin: '0px',
        threshold 
      }
    );

    observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [hasAnimated, once, threshold]);

  // Generate animation CSS classes
  const getAnimationClasses = () => {
    if (!isVisible) {
      // Default hidden states for each animation
      switch (animation) {
        case 'fade-up':
          return 'opacity-0 translate-y-10';
        case 'fade-down':
          return 'opacity-0 -translate-y-10';
        case 'fade-left':
          return 'opacity-0 translate-x-10';
        case 'fade-right':
          return 'opacity-0 -translate-x-10';
        case 'zoom-in':
          return 'opacity-0 scale-90';
        case 'zoom-out':
          return 'opacity-0 scale-110';
        default:
          return 'opacity-0';
      }
    }
    return 'opacity-100 translate-x-0 translate-y-0 scale-100';
  };

  return (
    <div
      ref={ref}
      className={`transition-all ${className} ${getAnimationClasses()}`}
      style={{
        transitionDuration: `${duration}s`,
        transitionDelay: `${delay}s`
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export default AnimatedElement; 