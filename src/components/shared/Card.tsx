/**
 * Card Component
 * Modern wrapper around shadcn Card with glass morphism and enhanced styling
 * Fully responsive with mobile-first design
 */

import React from 'react';
import {
  Card as ShadcnCard,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  headerIcon?: React.ReactNode;
  headerActions?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  bordered?: boolean;
  glass?: boolean;
  animate?: boolean;
  delay?: number;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  headerIcon,
  headerActions,
  footer,
  className = '',
  padding = 'md',
  hover = false,
  bordered = false,
  glass = true,
  animate = true,
  delay = 0,
}) => {
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  return (
    <ShadcnCard
      className={cn(
        'w-full relative overflow-hidden',
        !bordered && 'border-0',
        glass && 'bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm',
        hover && 'transition-all duration-300 hover:shadow-lg group',
        'shadow-soft',
        animate && 'animate-fade-up',
        className
      )}
      style={animate ? { animationDelay: `${delay}ms` } : undefined}
    >
      {/* Subtle gradient overlay on hover */}
      {hover && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      )}

      {(title || subtitle || headerActions) && (
        <CardHeader className="space-y-1 pb-4 relative">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {headerIcon && (
                <div className="p-2 rounded-xl bg-primary/10 text-primary flex-shrink-0">
                  {headerIcon}
                </div>
              )}
              <div className="space-y-1.5 min-w-0">
                {title && (
                  <CardTitle className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white truncate">
                    {title}
                  </CardTitle>
                )}
                {subtitle && (
                  <CardDescription className="text-sm text-slate-500 dark:text-slate-400">
                    {subtitle}
                  </CardDescription>
                )}
              </div>
            </div>
            {headerActions && (
              <div className="flex-shrink-0 flex items-center gap-2">
                {headerActions}
              </div>
            )}
          </div>
        </CardHeader>
      )}

      <CardContent className={cn(paddingClasses[padding], 'relative')}>
        {children}
      </CardContent>

      {footer && (
        <CardFooter className="pt-4 border-t border-slate-200/60 dark:border-slate-700/60 relative">
          {footer}
        </CardFooter>
      )}
    </ShadcnCard>
  );
};
