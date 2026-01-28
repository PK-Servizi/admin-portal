/**
 * Service Request Types
 */

import type { User } from './auth.types';

// ============================================================================
// Status Enums - Aligned with Backend
// ============================================================================

/**
 * Backend status values (actual API values)
 */
export enum BackendServiceRequestStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  PAYMENT_PENDING = 'payment_pending',
  AWAITING_FORM = 'awaiting_form',
  AWAITING_DOCUMENTS = 'awaiting_documents',
  IN_REVIEW = 'in_review',
  MISSING_DOCUMENTS = 'missing_documents',
  COMPLETED = 'completed',
  CLOSED = 'closed',
  REJECTED = 'rejected',
}

/**
 * Frontend-friendly status enum (maps to backend values)
 */
export enum ServiceRequestStatus {
  DRAFT = 'draft',
  PENDING = 'submitted', // Maps to 'submitted' on backend
  PAYMENT_PENDING = 'payment_pending',
  AWAITING_FORM = 'awaiting_form',
  AWAITING_DOCUMENTS = 'awaiting_documents',
  IN_PROGRESS = 'in_review', // Maps to 'in_review' on backend
  MISSING_DOCUMENTS = 'missing_documents',
  UNDER_REVIEW = 'in_review',
  COMPLETED = 'completed',
  CLOSED = 'closed',
  CANCELLED = 'closed', // Maps to 'closed' on backend
  REJECTED = 'rejected',
}

export enum ServiceRequestPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

// ============================================================================
// Status Mapping Utilities
// ============================================================================

/**
 * Status display configuration for UI
 */
export interface StatusConfig {
  label: string;
  color: 'gray' | 'blue' | 'yellow' | 'orange' | 'green' | 'red' | 'purple';
  bgColor: string;
  textColor: string;
  textClass?: string;
  icon?: string;
}

export const STATUS_CONFIG: Record<string, StatusConfig> = {
  draft: { label: 'Bozza', color: 'gray', bgColor: 'bg-gray-100', textColor: 'text-gray-700', textClass: 'text-gray-600 dark:text-gray-400' },
  submitted: { label: 'Inviato', color: 'blue', bgColor: 'bg-blue-100', textColor: 'text-blue-700', textClass: 'text-blue-600 dark:text-blue-400' },
  payment_pending: { label: 'In Attesa Pagamento', color: 'yellow', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700', textClass: 'text-yellow-600 dark:text-yellow-400' },
  awaiting_form: { label: 'In Attesa Modulo', color: 'yellow', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700', textClass: 'text-yellow-600 dark:text-yellow-400' },
  awaiting_documents: { label: 'In Attesa Documenti', color: 'orange', bgColor: 'bg-orange-100', textColor: 'text-orange-700', textClass: 'text-orange-600 dark:text-orange-400' },
  in_review: { label: 'In Lavorazione', color: 'purple', bgColor: 'bg-purple-100', textColor: 'text-purple-700', textClass: 'text-purple-600 dark:text-purple-400' },
  missing_documents: { label: 'Documenti Mancanti', color: 'orange', bgColor: 'bg-orange-100', textColor: 'text-orange-700', textClass: 'text-orange-600 dark:text-orange-400' },
  completed: { label: 'Completato', color: 'green', bgColor: 'bg-green-100', textColor: 'text-green-700', textClass: 'text-green-600 dark:text-green-400' },
  closed: { label: 'Chiuso', color: 'gray', bgColor: 'bg-gray-100', textColor: 'text-gray-700', textClass: 'text-gray-600 dark:text-gray-400' },
  rejected: { label: 'Rifiutato', color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-700', textClass: 'text-red-600 dark:text-red-400' },
};

export const PRIORITY_CONFIG: Record<string, StatusConfig> = {
  low: { label: 'Bassa', color: 'gray', bgColor: 'bg-gray-100', textColor: 'text-gray-600' },
  normal: { label: 'Normale', color: 'blue', bgColor: 'bg-blue-100', textColor: 'text-blue-600' },
  high: { label: 'Alta', color: 'orange', bgColor: 'bg-orange-100', textColor: 'text-orange-600' },
  urgent: { label: 'Urgente', color: 'red', bgColor: 'bg-red-100', textColor: 'text-red-600' },
};

// ============================================================================
// Service Type Interface
// ============================================================================

export interface ServiceType {
  id: string;
  name: string;
  code?: string;
  description?: string;
  price?: number;
  estimatedDays?: number;
  isActive: boolean;
  category?: string;
  icon?: string;
  formSchema?: FormSchema;
  requiredDocuments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceTypeData {
  name: string;
  code?: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateServiceTypeData {
  name?: string;
  code?: string;
  description?: string;
  isActive?: boolean;
}

// ============================================================================
// Service Interface (Individual services within a service type)
// ============================================================================

export interface Service {
  id: string;
  name: string;
  code: string;
  description?: string;
  category?: string;
  basePrice?: number;
  requiredDocuments: string[];
  documentRequirements?: DocumentRequirement[];
  formSchema?: FormSchema;
  isActive: boolean;
  serviceTypeId: string;
  serviceType?: ServiceType;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceData {
  name: string;
  code: string;
  description?: string;
  category?: string;
  basePrice?: number;
  requiredDocuments?: string[];
  documentRequirements?: DocumentRequirement[];
  formSchema?: FormSchema;
  isActive?: boolean;
  serviceTypeId: string;
}

export interface UpdateServiceData {
  name?: string;
  code?: string;
  description?: string;
  category?: string;
  basePrice?: number;
  requiredDocuments?: string[];
  documentRequirements?: DocumentRequirement[];
  formSchema?: FormSchema;
  isActive?: boolean;
  serviceTypeId?: string;
}

// ============================================================================
// Form Schema Types (for dynamic forms)
// ============================================================================

export type FormFieldType = 
  | 'text'
  | 'textarea'
  | 'number'
  | 'email'
  | 'phone'
  | 'date'
  | 'datetime'
  | 'select'
  | 'multiselect'
  | 'checkbox'
  | 'radio'
  | 'file'
  | 'section'
  | 'heading';

export interface FormFieldOption {
  label: string;
  value: string;
}

export interface FormFieldValidation {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  patternMessage?: string;
  email?: boolean;
  phone?: boolean;
}

export interface FormField {
  id: string;
  name: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  helpText?: string;
  defaultValue?: unknown;
  options?: FormFieldOption[];
  validation?: FormFieldValidation;
  conditionalDisplay?: {
    dependsOn: string;
    values: string[];
  };
  width?: 'full' | 'half' | 'third';
  order: number;
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  order: number;
}

export interface FormSchema {
  version: string;
  sections: FormSection[];
  settings?: {
    showProgressBar?: boolean;
    allowSaveDraft?: boolean;
    submitButtonText?: string;
  };
}

// ============================================================================
// Document Requirement Types
// ============================================================================

export interface DocumentRequirement {
  id: string;
  name: string;
  description?: string;
  category?: string;
  type?: string; // Document type for categorization (identity, fiscal_code, etc.)
  isRequired?: boolean;
  required?: boolean; // Alias for isRequired
  allowedMimeTypes?: string[];
  acceptedFormats?: string[]; // Alias for allowedMimeTypes
  maxSizeBytes?: number;
  maxFileSize?: number; // Alias for maxSizeBytes
  maxFiles?: number;
  helpText?: string;
  exampleUrl?: string;
  order?: number;
}

// ============================================================================
// Service Request Interface
// ============================================================================

export interface ServiceRequest {
  id: string;
  referenceNumber: string;
  userId: string;
  user?: User;
  serviceId?: string;
  service?: Service;
  serviceTypeId: string;
  serviceType?: ServiceType;
  status: ServiceRequestStatus | string;
  priority: ServiceRequestPriority | string;
  formData?: Record<string, unknown>;
  assignedToId?: string;
  assignedTo?: User;
  assignedOperatorId?: string;
  assignedOperator?: User;
  internalNotes?: string;
  userNotes?: string;
  notes?: ServiceRequestNote[];
  documents?: Document[];
  statusHistory?: RequestStatusHistory[];
  paymentId?: string;
  estimatedCompletionDate?: string;
  submittedAt?: string;
  formCompletedAt?: string;
  documentsUploadedAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RequestStatusHistory {
  id: string;
  serviceRequestId: string;
  fromStatus: string;
  toStatus: string;
  reason?: string;
  changedBy?: User;
  changedById: string;
  createdAt: string;
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
  serviceId?: string;
  formData: Record<string, unknown>;
}

export interface UpdateServiceRequestData {
  status?: ServiceRequestStatus | string;
  priority?: ServiceRequestPriority | string;
  formData?: Record<string, unknown>;
  assignedToId?: string;
}

// ============================================================================
// Document Interface
// ============================================================================

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

// ============================================================================
// Workflow Types
// ============================================================================

export enum WorkflowStep {
  PAYMENT = 'payment',
  QUESTIONNAIRE = 'questionnaire',
  DOCUMENTS = 'documents',
  REVIEW = 'review',
  COMPLETED = 'completed',
}

export interface WorkflowProgress {
  currentStep: WorkflowStep;
  currentStepIndex: number;
  completedSteps: WorkflowStep[];
  paymentCompleted: boolean;
  questionnaireCompleted: boolean;
  documentsUploaded: boolean;
  isInReview: boolean;
  isCompleted: boolean;
  isRejected: boolean;
  progressPercentage: number;
}

/**
 * Calculate workflow progress from service request data or status
 */
export const getWorkflowProgress = (requestOrStatus: ServiceRequest | BackendServiceRequestStatus | string): WorkflowProgress => {
  // Handle status string directly
  if (typeof requestOrStatus === 'string') {
    const status = requestOrStatus as BackendServiceRequestStatus;
    const isRejected = status === 'rejected';
    const isCompleted = ['completed', 'closed'].includes(status);
    const isInReview = ['in_review', 'submitted'].includes(status);
    
    // Determine step based on status
    let currentStepIndex = 0;
    let paymentCompleted = false;
    let questionnaireCompleted = false;
    let documentsUploaded = false;
    
    if (status === 'draft') {
      currentStepIndex = 0;
    } else if (status === 'payment_pending') {
      currentStepIndex = 0;
    } else if (status === 'awaiting_form') {
      currentStepIndex = 1;
      paymentCompleted = true;
    } else if (status === 'awaiting_documents' || status === 'missing_documents') {
      currentStepIndex = 2;
      paymentCompleted = true;
      questionnaireCompleted = true;
    } else if (status === 'in_review' || status === 'submitted') {
      currentStepIndex = 3;
      paymentCompleted = true;
      questionnaireCompleted = true;
      documentsUploaded = true;
    } else if (status === 'completed' || status === 'closed') {
      currentStepIndex = 4;
      paymentCompleted = true;
      questionnaireCompleted = true;
      documentsUploaded = true;
    } else if (status === 'rejected') {
      currentStepIndex = 3; // Rejected during review
      paymentCompleted = true;
      questionnaireCompleted = true;
      documentsUploaded = true;
    }
    
    const stepOrder = [WorkflowStep.PAYMENT, WorkflowStep.QUESTIONNAIRE, WorkflowStep.DOCUMENTS, WorkflowStep.REVIEW, WorkflowStep.COMPLETED];
    const currentStep = stepOrder[currentStepIndex];
    const completedSteps = stepOrder.slice(0, currentStepIndex);
    const progressPercentage = (currentStepIndex / (stepOrder.length - 1)) * 100;
    
    return {
      currentStep,
      currentStepIndex,
      completedSteps,
      paymentCompleted,
      questionnaireCompleted,
      documentsUploaded,
      isInReview,
      isCompleted,
      isRejected,
      progressPercentage,
    };
  }
  
  // Handle ServiceRequest object
  const request = requestOrStatus as ServiceRequest;
  const paymentCompleted = !!request.paymentId || request.status !== 'payment_pending';
  const questionnaireCompleted = !!request.formCompletedAt || !!request.formData;
  const documentsUploaded = !!(request.documentsUploadedAt || (request.documents && request.documents.length > 0));
  const isInReview = ['in_review', 'submitted'].includes(request.status as string);
  const isCompleted = ['completed', 'closed'].includes(request.status as string);
  const isRejected = request.status === 'rejected';

  const completedSteps: WorkflowStep[] = [];
  let currentStep: WorkflowStep = WorkflowStep.PAYMENT;
  let currentStepIndex = 0;

  if (paymentCompleted) {
    completedSteps.push(WorkflowStep.PAYMENT);
    currentStep = WorkflowStep.QUESTIONNAIRE;
    currentStepIndex = 1;
  }
  if (questionnaireCompleted) {
    completedSteps.push(WorkflowStep.QUESTIONNAIRE);
    currentStep = WorkflowStep.DOCUMENTS;
    currentStepIndex = 2;
  }
  if (documentsUploaded) {
    completedSteps.push(WorkflowStep.DOCUMENTS);
    currentStep = WorkflowStep.REVIEW;
    currentStepIndex = 3;
  }
  if (isInReview) {
    completedSteps.push(WorkflowStep.REVIEW);
    currentStep = WorkflowStep.COMPLETED;
    currentStepIndex = 4;
  }
  if (isCompleted) {
    completedSteps.push(WorkflowStep.COMPLETED);
    currentStepIndex = 4;
  }
  
  const progressPercentage = (currentStepIndex / 4) * 100;

  return {
    currentStep,
    currentStepIndex,
    completedSteps,
    paymentCompleted,
    questionnaireCompleted,
    documentsUploaded,
    isInReview,
    isCompleted,
    isRejected,
    progressPercentage,
  };
};

