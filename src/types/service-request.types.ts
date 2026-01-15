/**
 * Service Request Types
 */

import type { User } from './auth.types';

export enum ServiceRequestStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  AWAITING_DOCUMENTS = 'awaiting_documents',
  UNDER_REVIEW = 'under_review',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REJECTED = 'rejected',
}

export enum ServiceRequestPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export interface ServiceType {
  id: string;
  name: string;
  code: string;
  description?: string;
  price?: number;
  estimatedDays?: number;
  isActive: boolean;
  category?: string;
  icon?: string;
  formSchema?: Record<string, unknown>;
  requiredDocuments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ServiceRequest {
  id: string;
  referenceNumber: string;
  userId: string;
  user?: User;
  serviceTypeId: string;
  serviceType?: ServiceType;
  status: ServiceRequestStatus;
  priority: ServiceRequestPriority;
  formData?: Record<string, unknown>;
  assignedToId?: string;
  assignedTo?: User;
  notes?: ServiceRequestNote[];
  documents?: Document[];
  estimatedCompletionDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceRequestNote {
  id: string;
  content: string;
  isInternal: boolean;
  createdBy: User;
  createdAt: string;
}

export interface CreateServiceRequestData {
  serviceTypeId: string;
  formData: Record<string, unknown>;
}

export interface UpdateServiceRequestData {
  status?: ServiceRequestStatus;
  priority?: ServiceRequestPriority;
  formData?: Record<string, unknown>;
  assignedToId?: string;
}

export interface Document {
  id: string;
  userId: string;
  serviceRequestId?: string;
  type: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url?: string;
  s3Key?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewNotes?: string;
  uploadedAt: string;
  reviewedAt?: string;
}
