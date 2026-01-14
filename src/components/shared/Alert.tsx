/**
 * Alert Component
 * Wrapper around shadcn Alert with extended variants
 * Fully responsive with mobile-first design
 */

import React from 'react';
import { Alert as ShadcnAlert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { AlertCircle, CheckCircle2, Info, XCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface AlertProps {
  children: React.ReactNode;
  variant?: 'default' | 'destructive' | 'info' | 'success' | 'warning' | 'error';
  title?: string;
  closable?: boolean;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  children,
  variant = 'info',
  title,
  closable = false,
  onClose,
  className = '',
}) => {
  const [visible, setVisible] = React.useState(true);
  
  if (!visible) return null;
  
  const handleClose = () => {
    setVisible(false);
    onClose?.();
  };
  
  // Map custom variants to styles
  const getVariantClass = () => {
    switch (variant) {
      case 'info':
        return 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200';
      case 'success':
        return 'border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-200';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200';
      case 'error':
        return 'border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-200';
      default:
        return '';
    }
  };
  
  const getIcon = () => {
    const iconClass = 'h-5 w-5 flex-shrink-0';
    switch (variant) {
      case 'info':
        return <Info className={iconClass} />;
      case 'success':
        return <CheckCircle2 className={iconClass} />;
      case 'warning':
        return <AlertCircle className={iconClass} />;
      case 'error':
      case 'destructive':
        return <XCircle className={iconClass} />;
      default:
        return <Info className={iconClass} />;
    }
  };
  
  const shadcnVariant = variant === 'error' || variant === 'destructive' ? 'destructive' : 'default';
  
  return (
    <ShadcnAlert
      variant={shadcnVariant}
      className={cn(
        'relative',
        variant === 'info' || variant === 'success' || variant === 'warning' ? getVariantClass() : '',
        className
      )}
    >
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1 min-w-0">
          {title && <AlertTitle className="mb-1 text-sm sm:text-base">{title}</AlertTitle>}
          <AlertDescription className="text-sm [&>p]:leading-relaxed">
            {children}
          </AlertDescription>
        </div>
        {closable && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 hover:bg-transparent flex-shrink-0"
            onClick={handleClose}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        )}
      </div>
    </ShadcnAlert>
  );
};
