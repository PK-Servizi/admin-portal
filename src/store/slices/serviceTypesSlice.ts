/**
 * Service Types Slice
 * Manages UI state for service types management (selection, filters, modals)
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ServiceTypesViewMode = 'grid' | 'list';

interface ServiceTypesFilters {
  search: string;
  isActive: boolean | null;
  sortBy: 'name' | 'createdAt' | 'updatedAt';
  sortOrder: 'ASC' | 'DESC';
}

interface ServiceTypesState {
  // View state
  viewMode: ServiceTypesViewMode;
  
  // Selection state (for bulk operations)
  selectedIds: string[];
  bulkMode: boolean;
  
  // Modal state
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  isDeleteModalOpen: boolean;
  editingServiceTypeId: string | null;
  deletingServiceTypeId: string | null;
  
  // Filters
  filters: ServiceTypesFilters;
  
  // Pagination
  page: number;
  pageSize: number;
}

const initialState: ServiceTypesState = {
  viewMode: 'list',
  selectedIds: [],
  bulkMode: false,
  isCreateModalOpen: false,
  isEditModalOpen: false,
  isDeleteModalOpen: false,
  editingServiceTypeId: null,
  deletingServiceTypeId: null,
  filters: {
    search: '',
    isActive: null,
    sortBy: 'name',
    sortOrder: 'ASC',
  },
  page: 1,
  pageSize: 10,
};

const serviceTypesSlice = createSlice({
  name: 'serviceTypes',
  initialState,
  reducers: {
    // View mode
    setServiceTypesViewMode: (state, action: PayloadAction<ServiceTypesViewMode>) => {
      state.viewMode = action.payload;
    },

    // Selection
    setSelectedServiceTypeIds: (state, action: PayloadAction<string[]>) => {
      state.selectedIds = action.payload;
    },

    toggleServiceTypeSelection: (state, action: PayloadAction<string>) => {
      const index = state.selectedIds.indexOf(action.payload);
      if (index > -1) {
        state.selectedIds.splice(index, 1);
      } else {
        state.selectedIds.push(action.payload);
      }
    },

    selectAllServiceTypes: (state, action: PayloadAction<string[]>) => {
      state.selectedIds = action.payload;
    },

    clearServiceTypeSelection: (state) => {
      state.selectedIds = [];
    },

    toggleServiceTypesBulkMode: (state) => {
      state.bulkMode = !state.bulkMode;
      if (!state.bulkMode) {
        state.selectedIds = [];
      }
    },

    // Modals
    openCreateServiceTypeModal: (state) => {
      state.isCreateModalOpen = true;
    },

    closeCreateServiceTypeModal: (state) => {
      state.isCreateModalOpen = false;
    },

    openEditServiceTypeModal: (state, action: PayloadAction<string>) => {
      state.isEditModalOpen = true;
      state.editingServiceTypeId = action.payload;
    },

    closeEditServiceTypeModal: (state) => {
      state.isEditModalOpen = false;
      state.editingServiceTypeId = null;
    },

    openDeleteServiceTypeModal: (state, action: PayloadAction<string>) => {
      state.isDeleteModalOpen = true;
      state.deletingServiceTypeId = action.payload;
    },

    closeDeleteServiceTypeModal: (state) => {
      state.isDeleteModalOpen = false;
      state.deletingServiceTypeId = null;
    },

    // Filters
    setServiceTypesFilters: (state, action: PayloadAction<Partial<ServiceTypesFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.page = 1; // Reset to first page on filter change
    },

    setServiceTypesSearch: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
      state.page = 1;
    },

    setServiceTypesActiveFilter: (state, action: PayloadAction<boolean | null>) => {
      state.filters.isActive = action.payload;
      state.page = 1;
    },

    setServiceTypesSort: (state, action: PayloadAction<{ sortBy: ServiceTypesFilters['sortBy']; sortOrder: ServiceTypesFilters['sortOrder'] }>) => {
      state.filters.sortBy = action.payload.sortBy;
      state.filters.sortOrder = action.payload.sortOrder;
    },

    resetServiceTypesFilters: (state) => {
      state.filters = initialState.filters;
      state.page = 1;
    },

    // Pagination
    setServiceTypesPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },

    setServiceTypesPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.page = 1;
    },

    // Reset all state
    resetServiceTypesState: () => initialState,
  },
});

export const {
  setServiceTypesViewMode,
  setSelectedServiceTypeIds,
  toggleServiceTypeSelection,
  selectAllServiceTypes,
  clearServiceTypeSelection,
  toggleServiceTypesBulkMode,
  openCreateServiceTypeModal,
  closeCreateServiceTypeModal,
  openEditServiceTypeModal,
  closeEditServiceTypeModal,
  openDeleteServiceTypeModal,
  closeDeleteServiceTypeModal,
  setServiceTypesFilters,
  setServiceTypesSearch,
  setServiceTypesActiveFilter,
  setServiceTypesSort,
  resetServiceTypesFilters,
  setServiceTypesPage,
  setServiceTypesPageSize,
  resetServiceTypesState,
} = serviceTypesSlice.actions;

export default serviceTypesSlice.reducer;

// Selectors
export const selectServiceTypesViewMode = (state: { serviceTypes: ServiceTypesState }) => state.serviceTypes.viewMode;
export const selectServiceTypesSelectedIds = (state: { serviceTypes: ServiceTypesState }) => state.serviceTypes.selectedIds;
export const selectServiceTypesBulkMode = (state: { serviceTypes: ServiceTypesState }) => state.serviceTypes.bulkMode;
export const selectServiceTypesModals = (state: { serviceTypes: ServiceTypesState }) => ({
  isCreateModalOpen: state.serviceTypes.isCreateModalOpen,
  isEditModalOpen: state.serviceTypes.isEditModalOpen,
  isDeleteModalOpen: state.serviceTypes.isDeleteModalOpen,
  editingServiceTypeId: state.serviceTypes.editingServiceTypeId,
  deletingServiceTypeId: state.serviceTypes.deletingServiceTypeId,
});
export const selectServiceTypesFilters = (state: { serviceTypes: ServiceTypesState }) => state.serviceTypes.filters;
export const selectServiceTypesPagination = (state: { serviceTypes: ServiceTypesState }) => ({
  page: state.serviceTypes.page,
  pageSize: state.serviceTypes.pageSize,
});
