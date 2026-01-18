/**
 * Loading Component
 * Modern loading indicators and skeletons with animations
 */

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  className = '',
}) => {
  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16',
  };

  return (
    <Loader2 className={cn('animate-spin text-primary', sizes[size], className)} />
  );
};

export interface LoadingOverlayProps {
  message?: string;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  message = 'Loading...',
  className = '',
}) => {
  return (
    <div className={cn(
      'fixed inset-0 bg-slate-900/50 backdrop-blur-sm',
      'flex items-center justify-center z-50',
      className
    )}>
      <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-2xl p-8 shadow-2xl flex flex-col items-center gap-4 animate-scale-in">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
          <LoadingSpinner size="lg" />
        </div>
        <p className="text-slate-700 dark:text-slate-200 font-medium">{message}</p>
      </div>
    </div>
  );
};

export interface SkeletonProps {
  width?: string;
  height?: string;
  circle?: boolean;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  width,
  height = '1rem',
  circle = false,
  className = '',
}) => {
  return (
    <div
      className={cn(
        'animate-pulse bg-slate-200 dark:bg-slate-700',
        circle ? 'rounded-full' : 'rounded-lg',
        className
      )}
      style={{ width, height }}
    />
  );
};

export interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

export const SkeletonText: React.FC<SkeletonTextProps> = ({
  lines = 3,
  className = '',
}) => {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          height="0.875rem"
          width={index === lines - 1 ? '60%' : '100%'}
        />
      ))}
    </div>
  );
};

export interface SkeletonCardProps {
  showAvatar?: boolean;
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({
  showAvatar = false,
  className = '',
}) => {
  return (
    <div className={cn(
      'bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm',
      'p-6 rounded-xl shadow-soft',
      className
    )}>
      <div className="flex items-start gap-4">
        {showAvatar && <Skeleton circle width="3rem" height="3rem" />}
        <div className="flex-1 space-y-4">
          <Skeleton height="1.25rem" width="40%" />
          <SkeletonText lines={2} />
        </div>
      </div>
    </div>
  );
};

export interface LoadingDotsProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingDots: React.FC<LoadingDotsProps> = ({
  size = 'md',
  className = '',
}) => {
  const sizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3',
  };

  return (
    <div className={cn('flex items-center gap-1.5', className)}>
      <div className={cn(sizes[size], 'bg-primary rounded-full animate-bounce')} style={{ animationDelay: '0ms' }} />
      <div className={cn(sizes[size], 'bg-primary rounded-full animate-bounce')} style={{ animationDelay: '150ms' }} />
      <div className={cn(sizes[size], 'bg-primary rounded-full animate-bounce')} style={{ animationDelay: '300ms' }} />
    </div>
  );
};

// New: Page loading component
export interface PageLoadingProps {
  message?: string;
}

export const PageLoading: React.FC<PageLoadingProps> = ({
  message = 'Loading...',
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
      <div className="relative">
        <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
        <LoadingSpinner size="xl" />
      </div>
      <p className="text-slate-500 dark:text-slate-400 animate-pulse">{message}</p>
    </div>
  );
};
