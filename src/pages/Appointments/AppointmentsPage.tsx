/**
 * Appointments Page
 * Calendar view for managing appointments with FullCalendar
 */

import React, { useState, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import {
  useGetAppointmentsQuery,
  useCreateAppointmentMutation,
  useRescheduleAppointmentMutation,
  useCancelAppointmentMutation,
} from '@/services/api/appointments.api';
import type { Appointment } from '@/types';
import { cn } from '@/lib/utils';
import {
  Plus,
  X,
  Calendar,
  Clock,
  User,
  MapPin,
  Loader2,
  RefreshCw,
} from 'lucide-react';

interface AppointmentModalData {
  id?: string;
  title: string;
  date: string;
  time: string;
  duration: number;
  userId: string;
  notes: string;
}

const initialModalData: AppointmentModalData = {
  title: '',
  date: '',
  time: '',
  duration: 30,
  userId: '',
  notes: '',
};

export const AppointmentsPage: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState<AppointmentModalData>(initialModalData);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  // API hooks
  const { data, isLoading, isFetching, refetch } = useGetAppointmentsQuery({});
  const [createAppointment, { isLoading: isCreating }] = useCreateAppointmentMutation();
  const [rescheduleAppointment] = useRescheduleAppointmentMutation();
  const [cancelAppointment, { isLoading: isCancelling }] = useCancelAppointmentMutation();

  const appointments = data?.data || [];

  // Transform appointments for FullCalendar
  const calendarEvents = appointments.map((apt: Appointment) => ({
    id: apt.id,
    title: apt.notes || 'Appointment',
    start: apt.scheduledDate,
    end: apt.scheduledDate,
    backgroundColor: getEventColor(apt.status),
    borderColor: getEventColor(apt.status),
    extendedProps: {
      ...apt,
    },
  }));

  function getEventColor(status: string) {
    switch (status) {
      case 'scheduled':
        return '#3b82f6';
      case 'confirmed':
        return '#22c55e';
      case 'in_progress':
        return '#f59e0b';
      case 'completed':
        return '#6b7280';
      case 'cancelled':
        return '#ef4444';
      case 'no_show':
        return '#9ca3af';
      default:
        return '#3b82f6';
    }
  }

  // Handle date click to create new appointment
  const handleDateClick = useCallback((arg: { dateStr: string }) => {
    setModalData({
      ...initialModalData,
      date: arg.dateStr,
      time: '09:00',
    });
    setIsEditing(false);
    setShowModal(true);
  }, []);

  // Handle event click to view/edit appointment
  const handleEventClick = useCallback((arg: { event: { id: string; title: string; start: Date | null; end: Date | null; extendedProps: Record<string, unknown> } }) => {
    const appointment = arg.event.extendedProps as unknown as Appointment;
    setSelectedAppointment({
      ...appointment,
      id: arg.event.id,
    });
  }, []);

  // Handle event drag and drop for rescheduling
  const handleEventDrop = useCallback(async (arg: { event: { id: string; start: Date | null }; revert: () => void }) => {
    try {
      await rescheduleAppointment({
        id: arg.event.id,
        data: {
          scheduledDate: arg.event.start?.toISOString() || '',
        },
      }).unwrap();
    } catch (error) {
      console.error('Failed to reschedule appointment:', error);
      arg.revert();
    }
  }, [rescheduleAppointment]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const scheduledDate = new Date(`${modalData.date}T${modalData.time}`).toISOString();
      
      await createAppointment({
        scheduledDate,
        duration: modalData.duration,
        meetingType: 'in_person',
        notes: modalData.notes || undefined,
      }).unwrap();
      
      setShowModal(false);
      setModalData(initialModalData);
    } catch (error) {
      console.error('Failed to create appointment:', error);
    }
  };

  // Handle cancel appointment
  const handleCancelAppointment = async () => {
    if (!selectedAppointment?.id) return;
    
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      await cancelAppointment({ id: selectedAppointment.id }).unwrap();
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Appointments</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage and schedule appointments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className={cn('h-5 w-5', isFetching && 'animate-spin')} />
          </button>
          <button
            onClick={() => {
              setModalData(initialModalData);
              setIsEditing(false);
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Appointment
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <style>{`
          .fc {
            --fc-border-color: rgb(229 231 235);
            --fc-button-bg-color: rgb(59 130 246);
            --fc-button-border-color: rgb(59 130 246);
            --fc-button-hover-bg-color: rgb(37 99 235);
            --fc-button-hover-border-color: rgb(37 99 235);
            --fc-button-active-bg-color: rgb(29 78 216);
            --fc-today-bg-color: rgb(239 246 255);
            --fc-event-border-color: transparent;
          }
          .dark .fc {
            --fc-border-color: rgb(55 65 81);
            --fc-page-bg-color: rgb(31 41 55);
            --fc-neutral-bg-color: rgb(55 65 81);
            --fc-today-bg-color: rgb(30 58 138 / 0.2);
          }
          .fc .fc-button-primary:not(:disabled).fc-button-active,
          .fc .fc-button-primary:not(:disabled):active {
            background-color: var(--fc-button-active-bg-color);
            border-color: var(--fc-button-active-bg-color);
          }
          .fc-theme-standard td,
          .fc-theme-standard th {
            border-color: var(--fc-border-color);
          }
          .fc .fc-daygrid-day-number,
          .fc .fc-col-header-cell-cushion {
            color: rgb(17 24 39);
          }
          .dark .fc .fc-daygrid-day-number,
          .dark .fc .fc-col-header-cell-cushion {
            color: rgb(243 244 246);
          }
          .fc-event {
            cursor: pointer;
            border-radius: 4px;
            padding: 2px 4px;
          }
          .fc-event-title {
            font-weight: 500;
          }
        `}</style>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          events={calendarEvents}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          height="auto"
          aspectRatio={1.8}
        />
      </div>

      {/* Legend */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Status:</span>
          {[
            { label: 'Scheduled', color: '#3b82f6' },
            { label: 'Confirmed', color: '#22c55e' },
            { label: 'In Progress', color: '#f59e0b' },
            { label: 'Completed', color: '#6b7280' },
            { label: 'Cancelled', color: '#ef4444' },
          ].map((status) => (
            <div key={status.label} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: status.color }}
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">{status.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Create/Edit Appointment Modal */}
      {showModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setShowModal(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl z-50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isEditing ? 'Edit Appointment' : 'New Appointment'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={modalData.title}
                  onChange={(e) => setModalData({ ...modalData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Appointment title"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={modalData.date}
                    onChange={(e) => setModalData({ ...modalData, date: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    value={modalData.time}
                    onChange={(e) => setModalData({ ...modalData, time: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Duration (minutes)
                </label>
                <select
                  value={modalData.duration}
                  onChange={(e) => setModalData({ ...modalData, duration: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={45}>45 minutes</option>
                  <option value={60}>1 hour</option>
                  <option value={90}>1.5 hours</option>
                  <option value={120}>2 hours</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes
                </label>
                <textarea
                  value={modalData.notes}
                  onChange={(e) => setModalData({ ...modalData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isCreating && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isEditing ? 'Save Changes' : 'Create Appointment'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Appointment Detail Modal */}
      {selectedAppointment && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setSelectedAppointment(null)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl z-50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Appointment Details
              </h3>
              <button
                onClick={() => setSelectedAppointment(null)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-xl font-medium text-gray-900 dark:text-white">
                  {selectedAppointment.notes || 'Appointment'}
                </h4>
                <span
                  className={cn(
                    'inline-block mt-2 px-2.5 py-1 rounded-full text-xs font-medium capitalize',
                    selectedAppointment.status === 'confirmed'
                      ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                      : selectedAppointment.status === 'cancelled'
                      ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                      : 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                  )}
                >
                  {String(selectedAppointment.status)?.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {new Date(selectedAppointment.scheduledDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-300">
                    {new Date(selectedAppointment.scheduledDate).toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                    {selectedAppointment.duration && (
                      <>
                        {' ('}
                        {selectedAppointment.duration} min
                        {')'}
                      </>
                    )}
                  </span>
                </div>
                {selectedAppointment.user && (
                  <div className="flex items-center gap-3 text-sm">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {selectedAppointment.user.firstName} {selectedAppointment.user.lastName}
                    </span>
                  </div>
                )}
                {selectedAppointment.location && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700 dark:text-gray-300">
                      {selectedAppointment.location}
                    </span>
                  </div>
                )}
              </div>

              {selectedAppointment.notes && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Notes</p>
                  <p className="text-gray-700 dark:text-gray-300">{selectedAppointment.notes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-between gap-3 pt-6 mt-4 border-t border-gray-200 dark:border-gray-700">
              {selectedAppointment.status !== 'cancelled' && selectedAppointment.status !== 'completed' && (
                <button
                  onClick={handleCancelAppointment}
                  disabled={isCancelling}
                  className="px-4 py-2 text-red-600 hover:text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  {isCancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Cancel Appointment'}
                </button>
              )}
              <button
                onClick={() => setSelectedAppointment(null)}
                className="ml-auto px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AppointmentsPage;
