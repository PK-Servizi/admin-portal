/**
 * Form Actions Component
 * Container for form buttons (submit, cancel, etc.)
 */

import React from 'react';

export interface FormActionsProps {
  children: React.ReactNode;
  align?: 'left' | 'center' | 'right' | 'between';
  className?: string;
}

export const FormActions: React.FC<FormActionsProps> = ({
  children,
  align = 'right',
  className = '',
}) => {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
    between: 'justify-between',
  };
  
  return (
    <div className={`form-actions flex items-center gap-3 pt-4 ${alignClasses[align]} ${className}`}>
      {children}
    </div>
  );
};
