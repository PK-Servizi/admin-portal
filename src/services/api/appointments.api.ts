/**
 * Appointments API
 * Manages appointment scheduling and availability
 */

import { baseApi, API_TAGS } from './base.api';
import { AppointmentStatus } from '@/types';
import type {
  ApiResponse,
  PaginatedApiResponse,
  Appointment,
  AvailableSlot,
  CreateAppointmentData,
  RescheduleAppointmentData,
} from '@/types';

export const appointmentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get available time slots (public)
    getAvailableSlots: builder.query<
      ApiResponse<AvailableSlot[]>,
      { operatorId?: string; date?: string; duration?: number }
    >({
      query: (params) => ({
        url: '/appointments/available-slots',
        params,
      }),
      providesTags: [API_TAGS.Appointment],
      keepUnusedDataFor: 60, // Cache for 1 minute
    }),

    // Get my appointments
    getMyAppointments: builder.query<
      PaginatedApiResponse<Appointment[]>,
      { page?: number; limit?: number; status?: string }
    >({
      query: ({ page = 1, limit = 10, status }) => ({
        url: '/appointments/my',
        params: { page, limit, status },
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: API_TAGS.Appointment, id })),
              { type: API_TAGS.Appointment, id: 'LIST' },
            ]
          : [{ type: API_TAGS.Appointment, id: 'LIST' }],
      keepUnusedDataFor: 60,
    }),

    // Get appointment by ID
    getAppointment: builder.query<ApiResponse<Appointment>, string>({
      query: (id) => `/appointments/${id}`,
      providesTags: (_result, _error, id) => [{ type: API_TAGS.Appointment, id }],
    }),

    // Create appointment
    createAppointment: builder.mutation<ApiResponse<Appointment>, CreateAppointmentData>({
      query: (data) => ({
        url: '/appointments',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: [{ type: API_TAGS.Appointment, id: 'LIST' }, API_TAGS.Appointment],
      onQueryStarted: async (newAppointment, { dispatch, queryFulfilled }) => {
        // Optimistic update
        const patchResult = dispatch(
          appointmentsApi.util.updateQueryData('getMyAppointments', { page: 1, limit: 10 }, (draft) => {
            const tempAppointment: Appointment = {
              id: 'temp-' + Date.now(),
              userId: '',
              scheduledDate: newAppointment.scheduledDate,
              duration: newAppointment.duration,
              status: AppointmentStatus.SCHEDULED,
              meetingType: newAppointment.meetingType,
              notes: newAppointment.notes,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            draft.data.unshift(tempAppointment);
            draft.pagination.total += 1;
          })
        );

        try {
          const { data } = await queryFulfilled;
          // Update with real data
          dispatch(
            appointmentsApi.util.updateQueryData('getMyAppointments', { page: 1, limit: 10 }, (draft) => {
              const index = draft.data.findIndex((item) => item.id.startsWith('temp-'));
              if (index !== -1) {
                draft.data[index] = data.data;
              }
            })
          );
        } catch {
          patchResult.undo();
        }
      },
    }),

    // Reschedule appointment
    rescheduleAppointment: builder.mutation<
      ApiResponse<Appointment>,
      { id: string; data: RescheduleAppointmentData }
    >({
      query: ({ id, data }) => ({
        url: `/appointments/${id}/reschedule`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: API_TAGS.Appointment, id },
        { type: API_TAGS.Appointment, id: 'LIST' },
        API_TAGS.Appointment,
      ],
      onQueryStarted: async ({ id, data }, { dispatch, queryFulfilled }) => {
        // Optimistic update
        const patchResults: { undo: () => void }[] = [];

        patchResults.push(
          dispatch(
            appointmentsApi.util.updateQueryData('getAppointment', id, (draft) => {
              draft.data.scheduledDate = data.scheduledDate;
              if (data.notes) draft.data.notes = data.notes;
            })
          )
        );

        patchResults.push(
          dispatch(
            appointmentsApi.util.updateQueryData('getMyAppointments', { page: 1, limit: 10 }, (draft) => {
              const appointment = draft.data.find((app) => app.id === id);
              if (appointment) {
                appointment.scheduledDate = data.scheduledDate;
                if (data.notes) appointment.notes = data.notes;
              }
            })
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patchResults.forEach((patch) => patch.undo());
        }
      },
    }),

    // Cancel appointment
    cancelAppointment: builder.mutation<ApiResponse<Appointment>, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `/appointments/${id}/cancel`,
        method: 'PATCH',
        body: { reason },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: API_TAGS.Appointment, id },
        { type: API_TAGS.Appointment, id: 'LIST' },
        API_TAGS.Appointment,
      ],
      onQueryStarted: async ({ id, reason }, { dispatch, queryFulfilled }) => {
        // Optimistic update
        const patchResults: { undo: () => void }[] = [];

        patchResults.push(
          dispatch(
            appointmentsApi.util.updateQueryData('getAppointment', id, (draft) => {
              draft.data.status = AppointmentStatus.CANCELLED;
              if (reason) draft.data.cancelReason = reason;
            })
          )
        );

        patchResults.push(
          dispatch(
            appointmentsApi.util.updateQueryData('getMyAppointments', { page: 1, limit: 10 }, (draft) => {
              const appointment = draft.data.find((app) => app.id === id);
              if (appointment) {
                appointment.status = 'cancelled' as any;
                if (reason) appointment.cancelReason = reason;
              }
            })
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patchResults.forEach((patch) => patch.undo());
        }
      },
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAvailableSlotsQuery,
  useLazyGetAvailableSlotsQuery,
  useGetMyAppointmentsQuery,
  useGetAppointmentQuery,
  useCreateAppointmentMutation,
  useRescheduleAppointmentMutation,
  useCancelAppointmentMutation,
} = appointmentsApi;
