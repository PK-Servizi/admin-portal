/**
 * Badge Component
 * Wrapper around shadcn Badge with extended variants and dot indicator
 * Fully responsive with mobile-first design
 */

import React from 'react';
import { Badge as ShadcnBadge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  rounded?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  rounded = false,
  className = '',
}) => {
  // Map custom variants to shadcn variants or custom classes
  const getVariantClass = () => {
    switch (variant) {
      case 'primary':
        return 'bg-primary text-primary-foreground hover:bg-primary/80';
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800';
      case 'danger':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-800';
      case 'info':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800';
      default:
        return '';
    }
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 h-5',
    md: 'text-sm px-2.5 py-0.5 h-6',
    lg: 'text-base px-3 py-1 h-7',
  };
  
  const dotVariantClasses = {
    default: 'bg-gray-500',
    secondary: 'bg-gray-500',
    destructive: 'bg-destructive',
    outline: 'bg-foreground',
    primary: 'bg-primary',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500',
  };
  
  const shadcnVariant = ['default', 'secondary', 'destructive', 'outline'].includes(variant)
    ? (variant as 'default' | 'secondary' | 'destructive' | 'outline')
    : undefined;
  
  return (
    <ShadcnBadge
      variant={shadcnVariant}
      className={cn(
        'inline-flex items-center gap-1.5 font-medium transition-colors',
        sizeClasses[size],
        rounded && 'rounded-full',
        !shadcnVariant && getVariantClass(),
        className
      )}
    >
      {dot && (
        <span 
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            dotVariantClasses[variant]
          )}
          aria-hidden="true"
        />
      )}
      <span className="truncate">{children}</span>
    </ShadcnBadge>
  );
};
