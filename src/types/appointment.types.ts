/**
 * Appointment Types
 */

import type { User } from './auth.types';

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show',
}

export interface Appointment {
  id: string;
  userId: string;
  user?: User;
  serviceRequestId?: string;
  operatorId?: string;
  operator?: User;
  scheduledDate: string;
  duration: number;
  status: AppointmentStatus;
  meetingType: 'in_person' | 'video' | 'phone';
  location?: string;
  meetingLink?: string;
  notes?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AvailableSlot {
  operatorId: string;
  operatorName: string;
  date: string;
  startTime: string;
  endTime: string;
}

export interface CreateAppointmentData {
  serviceRequestId?: string;
  scheduledDate: string;
  duration: number;
  meetingType: 'in_person' | 'video' | 'phone';
  notes?: string;
}

export interface RescheduleAppointmentData {
  scheduledDate: string;
  notes?: string;
}
