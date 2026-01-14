/**
 * Form Group Component
 * Wrapper for form fields with consistent spacing
 */

import React from 'react';

export interface FormGroupProps {
  children: React.ReactNode;
  className?: string;
}

export const FormGroup: React.FC<FormGroupProps> = ({ children, className = '' }) => {
  return <div className={`form-group mb-4 ${className}`}>{children}</div>;
};
