/**
 * Workflow Progress Indicator Component
 * Visual stepper showing service request workflow progress
 */

import React from 'react';
import { cn } from '@/lib/utils';
import type { WorkflowProgress, BackendServiceRequestStatus } from '@/types';
import { WorkflowStep, STATUS_CONFIG } from '@/types';
import { getWorkflowProgress } from '@/types';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  CreditCard,
  FileText,
  FolderOpen,
  Search,
  Flag,
} from 'lucide-react';

interface WorkflowProgressIndicatorProps {
  status: BackendServiceRequestStatus;
  className?: string;
  showLabels?: boolean;
  compact?: boolean;
}

interface StepConfig {
  step: WorkflowStep;
  icon: React.ElementType;
  label: string;
  description: string;
}

const WORKFLOW_STEPS: StepConfig[] = [
  {
    step: WorkflowStep.PAYMENT,
    icon: CreditCard,
    label: 'Payment',
    description: 'Awaiting payment',
  },
  {
    step: WorkflowStep.QUESTIONNAIRE,
    icon: FileText,
    label: 'Questionnaire',
    description: 'Form completion',
  },
  {
    step: WorkflowStep.DOCUMENTS,
    icon: FolderOpen,
    label: 'Documents',
    description: 'Document upload',
  },
  {
    step: WorkflowStep.REVIEW,
    icon: Search,
    label: 'Review',
    description: 'Under staff review',
  },
  {
    step: WorkflowStep.COMPLETED,
    icon: Flag,
    label: 'Completed',
    description: 'Request completed',
  },
];

const getStepStatus = (
  stepIndex: number,
  progress: WorkflowProgress
): 'completed' | 'current' | 'pending' | 'error' => {
  if (progress.isRejected) {
    // If rejected, show error on current step
    if (stepIndex === progress.currentStepIndex) {
      return 'error';
    }
    if (stepIndex < progress.currentStepIndex) {
      return 'completed';
    }
    return 'pending';
  }

  if (stepIndex < progress.currentStepIndex) {
    return 'completed';
  }
  if (stepIndex === progress.currentStepIndex) {
    return 'current';
  }
  return 'pending';
};

export const WorkflowProgressIndicator: React.FC<WorkflowProgressIndicatorProps> = ({
  status,
  className,
  showLabels = true,
  compact = false,
}) => {
  const progress = getWorkflowProgress(status);

  // For draft status, show empty progress
  if (status === 'draft') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Clock className="h-4 w-4 text-gray-400" />
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Draft - Not yet submitted
        </span>
      </div>
    );
  }

  // For rejected or closed status, show special indicator
  if (progress.isRejected || status === 'closed') {
    const statusConfig = STATUS_CONFIG[status];
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <AlertCircle className={cn('h-4 w-4', statusConfig?.textClass || 'text-gray-500')} />
        <span className={cn('text-sm', statusConfig?.textClass || 'text-gray-500')}>
          {statusConfig?.label || 'Closed'}
        </span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={cn('flex items-center gap-1', className)}>
        {WORKFLOW_STEPS.map((step, index) => {
          const stepStatus = getStepStatus(index, progress);
          return (
            <div
              key={step.step}
              className={cn(
                'h-2 flex-1 rounded-full transition-colors',
                stepStatus === 'completed' && 'bg-emerald-500',
                stepStatus === 'current' && 'bg-indigo-500',
                stepStatus === 'pending' && 'bg-gray-200 dark:bg-gray-700',
                stepStatus === 'error' && 'bg-red-500'
              )}
            />
          );
        })}
        <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
          {Math.round(progress.progressPercentage)}%
        </span>
      </div>
    );
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Progress Bar */}
      <div className="relative">
        {/* Background Line */}
        <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200 dark:bg-gray-700" />
        
        {/* Progress Line */}
        <div
          className="absolute top-5 left-5 h-0.5 bg-emerald-500 transition-all duration-500"
          style={{
            width: `calc(${progress.progressPercentage}% - 40px)`,
          }}
        />

        {/* Steps */}
        <div className="relative flex justify-between">
          {WORKFLOW_STEPS.map((step, index) => {
            const stepStatus = getStepStatus(index, progress);
            const Icon = step.icon;

            return (
              <div
                key={step.step}
                className="flex flex-col items-center"
                style={{ width: '20%' }}
              >
                {/* Icon Circle */}
                <div
                  className={cn(
                    'relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300',
                    stepStatus === 'completed' &&
                      'bg-emerald-500 border-emerald-500 text-white',
                    stepStatus === 'current' &&
                      'bg-indigo-500 border-indigo-500 text-white animate-pulse',
                    stepStatus === 'pending' &&
                      'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400',
                    stepStatus === 'error' &&
                      'bg-red-500 border-red-500 text-white'
                  )}
                >
                  {stepStatus === 'completed' ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : stepStatus === 'error' ? (
                    <AlertCircle className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>

                {/* Label */}
                {showLabels && (
                  <div className="mt-2 text-center">
                    <span
                      className={cn(
                        'block text-xs font-medium',
                        stepStatus === 'completed' && 'text-emerald-600 dark:text-emerald-400',
                        stepStatus === 'current' && 'text-indigo-600 dark:text-indigo-400',
                        stepStatus === 'pending' && 'text-gray-400 dark:text-gray-500',
                        stepStatus === 'error' && 'text-red-600 dark:text-red-400'
                      )}
                    >
                      {step.label}
                    </span>
                    {stepStatus === 'current' && (
                      <span className="block text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                        {step.description}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Status Text */}
      <div className="mt-4 text-center">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Current status:{' '}
          <span className={cn('font-medium', STATUS_CONFIG[status]?.textClass)}>
            {STATUS_CONFIG[status]?.label || status}
          </span>
        </span>
      </div>
    </div>
  );
};

/**
 * Mini version for table cells or compact displays
 */
export const WorkflowProgressMini: React.FC<{
  status: BackendServiceRequestStatus;
  className?: string;
}> = ({ status, className }) => {
  const progress = getWorkflowProgress(status);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex gap-0.5">
        {WORKFLOW_STEPS.map((step, index) => {
          const stepStatus = getStepStatus(index, progress);
          return (
            <div
              key={step.step}
              className={cn(
                'w-3 h-3 rounded-full transition-colors',
                stepStatus === 'completed' && 'bg-emerald-500',
                stepStatus === 'current' && 'bg-indigo-500',
                stepStatus === 'pending' && 'bg-gray-300 dark:bg-gray-600',
                stepStatus === 'error' && 'bg-red-500'
              )}
              title={step.label}
            />
          );
        })}
      </div>
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {Math.round(progress.progressPercentage)}%
      </span>
    </div>
  );
};
