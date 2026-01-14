/**
 * Filters Slice
 * Manages filter states for lists (service requests, payments, etc.)
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ServiceRequestsFilters {
  status: string[];
  priority: string[];
  serviceType: string[];
  dateRange: {
    start: string | null;
    end: string | null;
  };
  search: string;
}

interface AppointmentsFilters {
  status: string[];
  meetingType: string[];
  dateRange: {
    start: string | null;
    end: string | null;
  };
}

interface PaymentsFilters {
  status: string[];
  dateRange: {
    start: string | null;
    end: string | null;
  };
  minAmount: number | null;
  maxAmount: number | null;
}

interface FiltersState {
  serviceRequests: ServiceRequestsFilters;
  appointments: AppointmentsFilters;
  payments: PaymentsFilters;
}

const initialState: FiltersState = {
  serviceRequests: {
    status: [],
    priority: [],
    serviceType: [],
    dateRange: {
      start: null,
      end: null,
    },
    search: '',
  },
  appointments: {
    status: [],
    meetingType: [],
    dateRange: {
      start: null,
      end: null,
    },
  },
  payments: {
    status: [],
    dateRange: {
      start: null,
      end: null,
    },
    minAmount: null,
    maxAmount: null,
  },
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    // Service Requests Filters
    setServiceRequestsFilters: (state, action: PayloadAction<Partial<ServiceRequestsFilters>>) => {
      state.serviceRequests = { ...state.serviceRequests, ...action.payload };
    },
    resetServiceRequestsFilters: (state) => {
      state.serviceRequests = initialState.serviceRequests;
    },

    // Appointments Filters
    setAppointmentsFilters: (state, action: PayloadAction<Partial<AppointmentsFilters>>) => {
      state.appointments = { ...state.appointments, ...action.payload };
    },
    resetAppointmentsFilters: (state) => {
      state.appointments = initialState.appointments;
    },

    // Payments Filters
    setPaymentsFilters: (state, action: PayloadAction<Partial<PaymentsFilters>>) => {
      state.payments = { ...state.payments, ...action.payload };
    },
    resetPaymentsFilters: (state) => {
      state.payments = initialState.payments;
    },

    // Reset all filters
    resetAllFilters: () => initialState,
  },
});

export const {
  setServiceRequestsFilters,
  resetServiceRequestsFilters,
  setAppointmentsFilters,
  resetAppointmentsFilters,
  setPaymentsFilters,
  resetPaymentsFilters,
  resetAllFilters,
} = filtersSlice.actions;

export default filtersSlice.reducer;

// Selectors
export const selectServiceRequestsFilters = (state: { filters: FiltersState }) => state.filters.serviceRequests;
export const selectAppointmentsFilters = (state: { filters: FiltersState }) => state.filters.appointments;
export const selectPaymentsFilters = (state: { filters: FiltersState }) => state.filters.payments;
