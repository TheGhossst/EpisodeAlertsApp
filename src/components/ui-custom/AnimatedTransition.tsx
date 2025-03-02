import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedTransitionProps {
  children: React.ReactNode;
  className?: string;
  duration?: number;
  delay?: number;
  animation?:
  | 'fade-in'
  | 'slide-up'
  | 'slide-down'
  | 'zoom-in';
}

export const AnimatedTransition: React.FC<AnimatedTransitionProps> = ({
  children,
  className,
  duration = 300,
  delay = 0,
  animation = 'fade-in'
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const getAnimationClass = () => {
    switch (animation) {
      case 'fade-in':
        return 'animate-fade-in';
      case 'slide-up':
        return 'animate-slide-up';
      case 'slide-down':
        return 'animate-slide-down';
      case 'zoom-in':
        return 'animate-zoom-in';
      default:
        return 'animate-fade-in';
    }
  };

  return (
    <div
      className={cn(
        'opacity-0',
        isVisible && getAnimationClass(),
        className
      )}
      style={{
        animationDuration: `${duration}ms`,
        animationFillMode: 'forwards',
        animationDelay: `${delay}ms`
      }}
    >
      {children}
    </div>
  );
};