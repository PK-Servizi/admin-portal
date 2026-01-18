/**
 * StatCard Component
 * Modern card for displaying statistics and metrics
 * Redesigned with gradients, shadows, and animations
 */

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

export interface StatCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    trend: 'up' | 'down' | 'neutral';
    label?: string;
  };
  icon?: React.ReactNode;
  subtitle?: string;
  loading?: boolean;
  variant?: 'indigo' | 'violet' | 'emerald' | 'amber' | 'rose' | 'slate';
  className?: string;
  link?: string;
  delay?: number;
}

const variantStyles = {
  indigo: {
    iconBg: 'bg-indigo-100 dark:bg-indigo-500/20',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    gradient: 'from-indigo-500/10 via-transparent to-transparent',
  },
  violet: {
    iconBg: 'bg-violet-100 dark:bg-violet-500/20',
    iconColor: 'text-violet-600 dark:text-violet-400',
    gradient: 'from-violet-500/10 via-transparent to-transparent',
  },
  emerald: {
    iconBg: 'bg-emerald-100 dark:bg-emerald-500/20',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    gradient: 'from-emerald-500/10 via-transparent to-transparent',
  },
  amber: {
    iconBg: 'bg-amber-100 dark:bg-amber-500/20',
    iconColor: 'text-amber-600 dark:text-amber-400',
    gradient: 'from-amber-500/10 via-transparent to-transparent',
  },
  rose: {
    iconBg: 'bg-rose-100 dark:bg-rose-500/20',
    iconColor: 'text-rose-600 dark:text-rose-400',
    gradient: 'from-rose-500/10 via-transparent to-transparent',
  },
  slate: {
    iconBg: 'bg-slate-100 dark:bg-slate-500/20',
    iconColor: 'text-slate-600 dark:text-slate-400',
    gradient: 'from-slate-500/10 via-transparent to-transparent',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  icon,
  subtitle,
  loading = false,
  variant = 'indigo',
  className = '',
  delay = 0,
}) => {
  const styles = variantStyles[variant];

  if (loading) {
    return (
      <Card className={cn('border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-soft', className)}>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-3">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
                <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
              </div>
              <div className="h-12 w-12 bg-slate-200 dark:bg-slate-700 rounded-xl" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className={cn(
        'group relative overflow-hidden border-0',
        'bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm',
        'shadow-soft hover:shadow-lg transition-all duration-300',
        'animate-fade-up',
        className
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Subtle gradient overlay on hover */}
      <div className={cn(
        'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300',
        styles.gradient
      )} />

      <CardContent className="p-6 relative">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2 tracking-tight">
              {value}
            </p>

            {(change || subtitle) && (
              <div className="flex items-center gap-2 mt-3">
                {change && (
                  <div className={cn(
                    'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold',
                    change.trend === 'up' && 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
                    change.trend === 'down' && 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400',
                    change.trend === 'neutral' && 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400'
                  )}>
                    {change.trend === 'up' && <TrendingUp className="h-3 w-3" />}
                    {change.trend === 'down' && <TrendingDown className="h-3 w-3" />}
                    {change.trend === 'neutral' && <Minus className="h-3 w-3" />}
                    {change.trend === 'up' && '+'}
                    {change.value}%
                  </div>
                )}
                {(subtitle || change?.label) && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {subtitle || change?.label}
                  </span>
                )}
              </div>
            )}
          </div>

          {icon && (
            <div className={cn(
              'p-3 rounded-xl transition-all duration-300 group-hover:scale-110',
              styles.iconBg,
              styles.iconColor
            )}>
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
