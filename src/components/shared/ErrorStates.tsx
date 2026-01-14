/**
 * Error State Components
 * Empty states, error displays, and fallbacks
 */

import React from 'react';
import { Button } from '@/components/ui/button';

export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  className = '',
}) => {
  return (
    <div className={`empty-state flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      {icon && <div className="mb-4 text-gray-400">{icon}</div>}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-500 mb-6 max-w-md">{description}</p>}
      {action && (
        <Button variant="default" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
};

export interface ErrorDisplayProps {
  title?: string;
  message: string;
  error?: Error;
  retry?: () => void;
  showDetails?: boolean;
  className?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  title = 'Something went wrong',
  message,
  error,
  retry,
  showDetails = false,
  className = '',
}) => {
  const [showFullError, setShowFullError] = React.useState(false);
  
  return (
    <div className={`error-display bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
      <div className="flex items-start gap-3">
        <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-red-900 mb-1">{title}</h3>
          <p className="text-sm text-red-700 mb-3">{message}</p>
          
          {showDetails && error && (
            <div className="mt-3">
              <button
                onClick={() => setShowFullError(!showFullError)}
                className="text-xs text-red-700 underline hover:text-red-800"
              >
                {showFullError ? 'Hide' : 'Show'} technical details
              </button>
              {showFullError && (
                <pre className="mt-2 p-3 bg-red-100 rounded text-xs overflow-auto max-h-40">
                  {error.stack || error.message}
                </pre>
              )}
            </div>
          )}
          
          {retry && (
            <div className="mt-4">
              <Button variant="destructive" size="sm" onClick={retry}>
                Try Again
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export interface NoResultsProps {
  query?: string;
  onClearFilters?: () => void;
  className?: string;
}

export const NoResults: React.FC<NoResultsProps> = ({
  query,
  onClearFilters,
  className = '',
}) => {
  return (
    <div className={`no-results flex flex-col items-center justify-center py-12 px-4 text-center ${className}`}>
      <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {query ? `No results for "${query}"` : 'No results found'}
      </h3>
      <p className="text-sm text-gray-500 mb-4">
        {query 
          ? 'Try adjusting your search or filters to find what you\'re looking for.'
          : 'Try adjusting your filters to see more results.'
        }
      </p>
      {onClearFilters && (
        <Button variant="ghost" size="sm" onClick={onClearFilters}>
          Clear Filters
        </Button>
      )}
    </div>
  );
};

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <ErrorDisplay
          title="Application Error"
          message="An unexpected error occurred. Please refresh the page and try again."
          error={this.state.error}
          showDetails={import.meta.env.DEV}
          retry={() => window.location.reload()}
        />
      );
    }
    
    return this.props.children;
  }
}
