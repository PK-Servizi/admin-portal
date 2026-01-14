/**
 * UI Slice
 * Manages global UI state like modals, drawers, toasts, theme
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type ThemeMode = 'light' | 'dark' | 'system';
type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface Modal {
  id: string;
  component: string;
  props?: any;
}

interface UIState {
  theme: ThemeMode;
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  modals: Modal[];
  toasts: Toast[];
  loading: {
    global: boolean;
    operations: Record<string, boolean>;
  };
}

const initialState: UIState = {
  theme: (localStorage.getItem('theme') as ThemeMode) || 'system',
  sidebarOpen: true,
  sidebarCollapsed: false,
  modals: [],
  toasts: [],
  loading: {
    global: false,
    operations: {},
  },
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Theme
    setTheme: (state, action: PayloadAction<ThemeMode>) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },

    // Sidebar
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.sidebarOpen = action.payload;
    },
    toggleSidebarCollapsed: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },

    // Modals
    openModal: (state, action: PayloadAction<{ id: string; component: string; props?: any }>) => {
      state.modals.push(action.payload);
    },
    closeModal: (state, action: PayloadAction<string>) => {
      state.modals = state.modals.filter((modal) => modal.id !== action.payload);
    },
    closeAllModals: (state) => {
      state.modals = [];
    },

    // Toasts
    addToast: (state, action: PayloadAction<Omit<Toast, 'id'>>) => {
      const id = `toast-${Date.now()}-${Math.random()}`;
      state.toasts.push({ id, ...action.payload });
    },
    removeToast: (state, action: PayloadAction<string>) => {
      state.toasts = state.toasts.filter((toast) => toast.id !== action.payload);
    },
    clearToasts: (state) => {
      state.toasts = [];
    },

    // Loading
    setGlobalLoading: (state, action: PayloadAction<boolean>) => {
      state.loading.global = action.payload;
    },
    setOperationLoading: (state, action: PayloadAction<{ operation: string; loading: boolean }>) => {
      state.loading.operations[action.payload.operation] = action.payload.loading;
    },
    clearOperationLoading: (state, action: PayloadAction<string>) => {
      delete state.loading.operations[action.payload];
    },
  },
});

export const {
  setTheme,
  toggleSidebar,
  setSidebarOpen,
  toggleSidebarCollapsed,
  setSidebarCollapsed,
  openModal,
  closeModal,
  closeAllModals,
  addToast,
  removeToast,
  clearToasts,
  setGlobalLoading,
  setOperationLoading,
  clearOperationLoading,
} = uiSlice.actions;

export default uiSlice.reducer;

// Selectors
export const selectTheme = (state: { ui: UIState }) => state.ui.theme;
export const selectSidebarOpen = (state: { ui: UIState }) => state.ui.sidebarOpen;
export const selectSidebarCollapsed = (state: { ui: UIState }) => state.ui.sidebarCollapsed;
export const selectModals = (state: { ui: UIState }) => state.ui.modals;
export const selectToasts = (state: { ui: UIState }) => state.ui.toasts;
export const selectGlobalLoading = (state: { ui: UIState }) => state.ui.loading.global;
export const selectOperationLoading = (operation: string) => (state: { ui: UIState }) =>
  state.ui.loading.operations[operation] || false;
