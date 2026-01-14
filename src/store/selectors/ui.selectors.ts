/**
 * UI Selectors
 * Memoized selectors for UI state
 */

import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../index';

// Base selectors
const selectUIState = (state: RootState) => state.ui;

// Memoized selectors
export const selectTheme = createSelector(
  [selectUIState],
  (ui) => ui.theme
);

export const selectIsDarkMode = createSelector(
  [selectTheme],
  (theme) => theme === 'dark'
);

export const selectSidebarState = createSelector(
  [selectUIState],
  (ui) => ui.sidebarOpen
);

export const selectIsSidebarOpen = createSelector(
  [selectSidebarState],
  (sidebarOpen) => sidebarOpen
);

export const selectToasts = createSelector(
  [selectUIState],
  (ui) => ui.toasts
);

export const selectLoadingStates = createSelector(
  [selectUIState],
  (ui) => ui.loading
);

export const selectIsLoadingByKey = (key: string) =>
  createSelector(
    [selectLoadingStates],
    (loading) => loading.operations[key] || false
  );

export const selectIsAnyLoading = createSelector(
  [selectLoadingStates],
  (loading) => loading.global || Object.values(loading.operations).some((isLoading) => isLoading)
);

export const selectModals = createSelector(
  [selectUIState],
  (ui) => ui.modals
);

export const selectIsModalOpen = (modalId: string) =>
  createSelector(
    [selectModals],
    (modals) => modals.some((m) => m.id === modalId)
  );

export const selectActiveModals = createSelector(
  [selectModals],
  (modals) => modals.map((m) => m.id)
);

export const selectHasActiveModals = createSelector(
  [selectActiveModals],
  (activeModals) => activeModals.length > 0
);
