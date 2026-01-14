/**
 * Admin Slice
 * Manages admin-specific state like dashboard preferences, selected filters, view modes
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type AdminView = 'dashboard' | 'requests' | 'users' | 'reports' | 'cms' | 'courses' | 'settings';
export type RequestView = 'list' | 'kanban' | 'calendar';

interface AdminState {
  // Current view
  currentView: AdminView;
  
  // Request management
  requestView: RequestView;
  selectedRequestIds: string[];
  
  // Dashboard preferences
  dashboardLayout: 'compact' | 'expanded';
  refreshInterval: number; // in seconds, 0 = disabled
  
  // Quick filters (saved user preferences)
  quickFilters: {
    requests: {
      showPendingOnly: boolean;
      showMyAssignments: boolean;
      priorityFilter: string[];
    };
    users: {
      showActiveOnly: boolean;
      roleFilter: string[];
    };
  };
  
  // Bulk operations
  bulkOperationMode: boolean;
  
  // Notifications
  showAdminNotifications: boolean;
  notificationSound: boolean;
}

const initialState: AdminState = {
  currentView: 'dashboard',
  requestView: 'list',
  selectedRequestIds: [],
  dashboardLayout: 'expanded',
  refreshInterval: 60, // 60 seconds default
  quickFilters: {
    requests: {
      showPendingOnly: false,
      showMyAssignments: false,
      priorityFilter: [],
    },
    users: {
      showActiveOnly: false,
      roleFilter: [],
    },
  },
  bulkOperationMode: false,
  showAdminNotifications: true,
  notificationSound: true,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    // View management
    setCurrentView: (state, action: PayloadAction<AdminView>) => {
      state.currentView = action.payload;
    },
    
    setRequestView: (state, action: PayloadAction<RequestView>) => {
      state.requestView = action.payload;
    },
    
    // Request selection
    setSelectedRequests: (state, action: PayloadAction<string[]>) => {
      state.selectedRequestIds = action.payload;
    },
    
    toggleRequestSelection: (state, action: PayloadAction<string>) => {
      const index = state.selectedRequestIds.indexOf(action.payload);
      if (index > -1) {
        state.selectedRequestIds.splice(index, 1);
      } else {
        state.selectedRequestIds.push(action.payload);
      }
    },
    
    selectAllRequests: (state, action: PayloadAction<string[]>) => {
      state.selectedRequestIds = action.payload;
    },
    
    clearRequestSelection: (state) => {
      state.selectedRequestIds = [];
    },
    
    // Dashboard preferences
    setDashboardLayout: (state, action: PayloadAction<'compact' | 'expanded'>) => {
      state.dashboardLayout = action.payload;
    },
    
    setRefreshInterval: (state, action: PayloadAction<number>) => {
      state.refreshInterval = action.payload;
    },
    
    // Quick filters
    setRequestQuickFilters: (state, action: PayloadAction<Partial<typeof initialState.quickFilters.requests>>) => {
      state.quickFilters.requests = { ...state.quickFilters.requests, ...action.payload };
    },
    
    setUserQuickFilters: (state, action: PayloadAction<Partial<typeof initialState.quickFilters.users>>) => {
      state.quickFilters.users = { ...state.quickFilters.users, ...action.payload };
    },
    
    resetQuickFilters: (state) => {
      state.quickFilters = initialState.quickFilters;
    },
    
    // Bulk operations
    enableBulkOperationMode: (state) => {
      state.bulkOperationMode = true;
    },
    
    disableBulkOperationMode: (state) => {
      state.bulkOperationMode = false;
      state.selectedRequestIds = [];
    },
    
    toggleBulkOperationMode: (state) => {
      state.bulkOperationMode = !state.bulkOperationMode;
      if (!state.bulkOperationMode) {
        state.selectedRequestIds = [];
      }
    },
    
    // Notifications
    toggleAdminNotifications: (state) => {
      state.showAdminNotifications = !state.showAdminNotifications;
    },
    
    setAdminNotifications: (state, action: PayloadAction<boolean>) => {
      state.showAdminNotifications = action.payload;
    },
    
    toggleNotificationSound: (state) => {
      state.notificationSound = !state.notificationSound;
    },
    
    setNotificationSound: (state, action: PayloadAction<boolean>) => {
      state.notificationSound = action.payload;
    },
    
    // Reset admin state
    resetAdminState: () => initialState,
  },
});

export const {
  setCurrentView,
  setRequestView,
  setSelectedRequests,
  toggleRequestSelection,
  selectAllRequests,
  clearRequestSelection,
  setDashboardLayout,
  setRefreshInterval,
  setRequestQuickFilters,
  setUserQuickFilters,
  resetQuickFilters,
  enableBulkOperationMode,
  disableBulkOperationMode,
  toggleBulkOperationMode,
  toggleAdminNotifications,
  setAdminNotifications,
  toggleNotificationSound,
  setNotificationSound,
  resetAdminState,
} = adminSlice.actions;

export default adminSlice.reducer;

// Selectors
export const selectCurrentView = (state: { admin: AdminState }) => state.admin.currentView;
export const selectRequestView = (state: { admin: AdminState }) => state.admin.requestView;
export const selectSelectedRequestIds = (state: { admin: AdminState }) => state.admin.selectedRequestIds;
export const selectDashboardLayout = (state: { admin: AdminState }) => state.admin.dashboardLayout;
export const selectRefreshInterval = (state: { admin: AdminState }) => state.admin.refreshInterval;
export const selectRequestQuickFilters = (state: { admin: AdminState }) => state.admin.quickFilters.requests;
export const selectUserQuickFilters = (state: { admin: AdminState }) => state.admin.quickFilters.users;
export const selectBulkOperationMode = (state: { admin: AdminState }) => state.admin.bulkOperationMode;
export const selectAdminNotifications = (state: { admin: AdminState }) => state.admin.showAdminNotifications;
export const selectNotificationSound = (state: { admin: AdminState }) => state.admin.notificationSound;
