/**
 * Card Component
 * Wrapper around shadcn Card with custom props for compatibility
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
  headerActions?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  bordered?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  headerActions,
  footer,
  className = '',
  padding = 'md',
  hover = false,
  bordered = true,
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
        'w-full',
        !bordered && 'border-0 shadow-none',
        hover && 'transition-shadow hover:shadow-lg',
        className
      )}
    >
      {(title || subtitle || headerActions) && (
        <CardHeader className="space-y-1 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div className="space-y-1.5 flex-1 min-w-0">
              {title && <CardTitle className="text-lg sm:text-xl truncate">{title}</CardTitle>}
              {subtitle && <CardDescription className="text-sm">{subtitle}</CardDescription>}
            </div>
            {headerActions && (
              <div className="flex-shrink-0 flex items-center gap-2">
                {headerActions}
              </div>
            )}
          </div>
        </CardHeader>
      )}
      
      <CardContent className={cn(paddingClasses[padding])}>
        {children}
      </CardContent>
      
      {footer && (
        <CardFooter className="pt-4 border-t">
          {footer}
        </CardFooter>
      )}
    </ShadcnCard>
  );
};
