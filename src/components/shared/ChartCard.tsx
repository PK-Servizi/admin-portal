/**
 * Chart Card Component
 * Card container for charts and graphs
 */

import React from 'react';
import { Card } from './Card';

export interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  loading?: boolean;
  className?: string;
}

export const ChartCard: React.FC<ChartCardProps> = ({
  title,
  subtitle,
  children,
  actions,
  loading = false,
  className = '',
}) => {
  if (loading) {
    return (
      <Card className={className} title={title} subtitle={subtitle}>
        <div className="animate-pulse h-64 bg-gray-200 rounded" />
      </Card>
    );
  }
  
  return (
    <Card
      className={className}
      title={title}
      subtitle={subtitle}
      headerActions={actions}
    >
      {children}
    </Card>
  );
};
