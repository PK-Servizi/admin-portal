/**
 * Button Component
 * Modern reusable button with variants, gradients, and animations
 * Optimized with React.memo
 */

import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'ghost' | 'outline' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button = React.memo<ButtonProps>(({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled,
  icon,
  iconPosition = 'left',
  className = '',
  ...props
}) => {
  const baseClasses = cn(
    'inline-flex items-center justify-center font-medium rounded-xl',
    'transition-all duration-200',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary/50',
    'disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none',
    'active:scale-[0.98]'
  );

  const variantClasses = {
    primary: cn(
      'bg-primary text-primary-foreground',
      'hover:bg-primary/90',
      'shadow-sm hover:shadow-md hover:shadow-primary/25'
    ),
    secondary: cn(
      'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100',
      'hover:bg-slate-200 dark:hover:bg-slate-700',
      'shadow-sm'
    ),
    success: cn(
      'bg-emerald-600 text-white',
      'hover:bg-emerald-700',
      'shadow-sm hover:shadow-md hover:shadow-emerald-500/25'
    ),
    danger: cn(
      'bg-rose-600 text-white',
      'hover:bg-rose-700',
      'shadow-sm hover:shadow-md hover:shadow-rose-500/25'
    ),
    warning: cn(
      'bg-amber-500 text-white',
      'hover:bg-amber-600',
      'shadow-sm hover:shadow-md hover:shadow-amber-500/25'
    ),
    info: cn(
      'bg-cyan-600 text-white',
      'hover:bg-cyan-700',
      'shadow-sm hover:shadow-md hover:shadow-cyan-500/25'
    ),
    ghost: cn(
      'bg-transparent text-slate-700 dark:text-slate-300',
      'hover:bg-slate-100 dark:hover:bg-slate-800'
    ),
    outline: cn(
      'bg-transparent border-2 border-primary text-primary',
      'hover:bg-primary/5'
    ),
    gradient: cn(
      'bg-gradient-to-r from-indigo-500 to-violet-500 text-white',
      'hover:from-indigo-600 hover:to-violet-600',
      'shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40'
    ),
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
    icon: 'p-2.5',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        widthClass,
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <Loader2 className="h-4 w-4 animate-spin" />
      )}
      {icon && iconPosition === 'left' && !loading && (
        <span className="flex-shrink-0">{icon}</span>
      )}
      {children}
      {icon && iconPosition === 'right' && !loading && (
        <span className="flex-shrink-0">{icon}</span>
      )}
    </button>
  );
});

Button.displayName = 'Button';
