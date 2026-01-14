/**
 * Status Badge Components
 * Pre-configured badges for common entity statuses
 */

import React from 'react';
import { Badge, type BadgeProps } from './Badge';

// Service Request Status
export const ServiceRequestStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const config: Record<string, Omit<BadgeProps, 'children'>> = {
    draft: { variant: 'default', dot: true },
    submitted: { variant: 'info', dot: true },
    in_review: { variant: 'warning', dot: true },
    in_progress: { variant: 'primary', dot: true },
    missing_documents: { variant: 'warning', dot: true },
    completed: { variant: 'success', dot: true },
    rejected: { variant: 'danger', dot: true },
  };
  
  const labels: Record<string, string> = {
    draft: 'Draft',
    submitted: 'Submitted',
    in_review: 'In Review',
    in_progress: 'In Progress',
    missing_documents: 'Missing Documents',
    completed: 'Completed',
    rejected: 'Rejected',
  };
  
  return (
    <Badge {...(config[status] || config.draft)}>
      {labels[status] || status}
    </Badge>
  );
};

// Subscription Status
export const SubscriptionStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const config: Record<string, Omit<BadgeProps, 'children'>> = {
    active: { variant: 'success', dot: true },
    trial: { variant: 'info', dot: true },
    paused: { variant: 'warning', dot: true },
    cancelled: { variant: 'danger', dot: true },
    expired: { variant: 'default', dot: true },
  };
  
  const labels: Record<string, string> = {
    active: 'Active',
    trial: 'Trial',
    paused: 'Paused',
    cancelled: 'Cancelled',
    expired: 'Expired',
  };
  
  return (
    <Badge {...(config[status] || config.active)}>
      {labels[status] || status}
    </Badge>
  );
};

// Payment Status
export const PaymentStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const config: Record<string, Omit<BadgeProps, 'children'>> = {
    pending: { variant: 'warning', dot: true },
    completed: { variant: 'success', dot: true },
    failed: { variant: 'danger', dot: true },
    refunded: { variant: 'info', dot: true },
  };
  
  const labels: Record<string, string> = {
    pending: 'Pending',
    completed: 'Completed',
    failed: 'Failed',
    refunded: 'Refunded',
  };
  
  return (
    <Badge {...(config[status] || config.pending)}>
      {labels[status] || status}
    </Badge>
  );
};

// Appointment Status
export const AppointmentStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const config: Record<string, Omit<BadgeProps, 'children'>> = {
    scheduled: { variant: 'info', dot: true },
    confirmed: { variant: 'primary', dot: true },
    completed: { variant: 'success', dot: true },
    cancelled: { variant: 'danger', dot: true },
    no_show: { variant: 'warning', dot: true },
  };
  
  const labels: Record<string, string> = {
    scheduled: 'Scheduled',
    confirmed: 'Confirmed',
    completed: 'Completed',
    cancelled: 'Cancelled',
    no_show: 'No Show',
  };
  
  return (
    <Badge {...(config[status] || config.scheduled)}>
      {labels[status] || status}
    </Badge>
  );
};

// Document Status
export const DocumentStatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const config: Record<string, Omit<BadgeProps, 'children'>> = {
    pending: { variant: 'warning', dot: true },
    approved: { variant: 'success', dot: true },
    rejected: { variant: 'danger', dot: true },
  };
  
  const labels: Record<string, string> = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
  };
  
  return (
    <Badge {...(config[status] || config.pending)}>
      {labels[status] || status}
    </Badge>
  );
};

// User Role Badge
export const UserRoleBadge: React.FC<{ role: string }> = ({ role }) => {
  const config: Record<string, Omit<BadgeProps, 'children'>> = {
    admin: { variant: 'danger' },
    operator: { variant: 'primary' },
    user: { variant: 'default' },
    customer: { variant: 'info' },
  };
  
  const labels: Record<string, string> = {
    admin: 'Admin',
    operator: 'Operator',
    user: 'User',
    customer: 'Customer',
  };
  
  return (
    <Badge {...(config[role.toLowerCase()] || config.user)}>
      {labels[role.toLowerCase()] || role}
    </Badge>
  );
};

// Priority Badge
export const PriorityBadge: React.FC<{ priority: string }> = ({ priority }) => {
  const config: Record<string, Omit<BadgeProps, 'children'>> = {
    low: { variant: 'default' },
    normal: { variant: 'info' },
    high: { variant: 'warning' },
    urgent: { variant: 'danger' },
  };
  
  const labels: Record<string, string> = {
    low: 'Low',
    normal: 'Normal',
    high: 'High',
    urgent: 'Urgent',
  };
  
  return (
    <Badge {...(config[priority.toLowerCase()] || config.normal)}>
      {labels[priority.toLowerCase()] || priority}
    </Badge>
  );
};
