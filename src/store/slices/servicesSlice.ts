/**
 * Services Slice
 * Manages UI state for services management (selection, filters, modals, schema editor)
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { FormSchema, DocumentRequirement } from '@/types/service-request.types';

export type ServicesViewMode = 'grid' | 'list';
export type EditorTab = 'details' | 'schema' | 'documents' | 'preview';

interface ServicesFilters {
  search: string;
  serviceTypeId: string | null;
  category: string | null;
  isActive: boolean | null;
  sortBy: 'name' | 'code' | 'basePrice' | 'createdAt' | 'updatedAt';
  sortOrder: 'ASC' | 'DESC';
}

interface SchemaEditorState {
  isOpen: boolean;
  serviceId: string | null;
  currentSchema: FormSchema | null;
  isDirty: boolean;
  validationErrors: string[];
}

interface DocumentRequirementsEditorState {
  isOpen: boolean;
  serviceId: string | null;
  currentRequirements: DocumentRequirement[];
  isDirty: boolean;
}

interface ServicesState {
  // View state
  viewMode: ServicesViewMode;
  activeTab: EditorTab;
  
  // Selection state (for bulk operations)
  selectedIds: string[];
  bulkMode: boolean;
  
  // Modal state
  isCreateModalOpen: boolean;
  isEditModalOpen: boolean;
  isDeleteModalOpen: boolean;
  isDuplicateModalOpen: boolean;
  editingServiceId: string | null;
  deletingServiceId: string | null;
  duplicatingServiceId: string | null;
  
  // Schema editor state
  schemaEditor: SchemaEditorState;
  
  // Document requirements editor state
  documentRequirementsEditor: DocumentRequirementsEditorState;
  
  // Filters
  filters: ServicesFilters;
  
  // Pagination
  page: number;
  pageSize: number;
  
  // Expanded rows (for list view with details)
  expandedRowIds: string[];
}

const initialState: ServicesState = {
  viewMode: 'list',
  activeTab: 'details',
  selectedIds: [],
  bulkMode: false,
  isCreateModalOpen: false,
  isEditModalOpen: false,
  isDeleteModalOpen: false,
  isDuplicateModalOpen: false,
  editingServiceId: null,
  deletingServiceId: null,
  duplicatingServiceId: null,
  schemaEditor: {
    isOpen: false,
    serviceId: null,
    currentSchema: null,
    isDirty: false,
    validationErrors: [],
  },
  documentRequirementsEditor: {
    isOpen: false,
    serviceId: null,
    currentRequirements: [],
    isDirty: false,
  },
  filters: {
    search: '',
    serviceTypeId: null,
    category: null,
    isActive: null,
    sortBy: 'name',
    sortOrder: 'ASC',
  },
  page: 1,
  pageSize: 10,
  expandedRowIds: [],
};

const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    // View mode
    setServicesViewMode: (state, action: PayloadAction<ServicesViewMode>) => {
      state.viewMode = action.payload;
    },

    setServicesActiveTab: (state, action: PayloadAction<EditorTab>) => {
      state.activeTab = action.payload;
    },

    // Selection
    setSelectedServiceIds: (state, action: PayloadAction<string[]>) => {
      state.selectedIds = action.payload;
    },

    toggleServiceSelection: (state, action: PayloadAction<string>) => {
      const index = state.selectedIds.indexOf(action.payload);
      if (index > -1) {
        state.selectedIds.splice(index, 1);
      } else {
        state.selectedIds.push(action.payload);
      }
    },

    selectAllServices: (state, action: PayloadAction<string[]>) => {
      state.selectedIds = action.payload;
    },

    clearServiceSelection: (state) => {
      state.selectedIds = [];
    },

    toggleServicesBulkMode: (state) => {
      state.bulkMode = !state.bulkMode;
      if (!state.bulkMode) {
        state.selectedIds = [];
      }
    },

    // Modals
    openCreateServiceModal: (state) => {
      state.isCreateModalOpen = true;
      state.activeTab = 'details';
    },

    closeCreateServiceModal: (state) => {
      state.isCreateModalOpen = false;
    },

    openEditServiceModal: (state, action: PayloadAction<string>) => {
      state.isEditModalOpen = true;
      state.editingServiceId = action.payload;
      state.activeTab = 'details';
    },

    closeEditServiceModal: (state) => {
      state.isEditModalOpen = false;
      state.editingServiceId = null;
    },

    openDeleteServiceModal: (state, action: PayloadAction<string>) => {
      state.isDeleteModalOpen = true;
      state.deletingServiceId = action.payload;
    },

    closeDeleteServiceModal: (state) => {
      state.isDeleteModalOpen = false;
      state.deletingServiceId = null;
    },

    openDuplicateServiceModal: (state, action: PayloadAction<string>) => {
      state.isDuplicateModalOpen = true;
      state.duplicatingServiceId = action.payload;
    },

    closeDuplicateServiceModal: (state) => {
      state.isDuplicateModalOpen = false;
      state.duplicatingServiceId = null;
    },

    // Schema Editor
    openSchemaEditor: (state, action: PayloadAction<{ serviceId: string; schema: FormSchema | null }>) => {
      state.schemaEditor.isOpen = true;
      state.schemaEditor.serviceId = action.payload.serviceId;
      state.schemaEditor.currentSchema = action.payload.schema;
      state.schemaEditor.isDirty = false;
      state.schemaEditor.validationErrors = [];
    },

    closeSchemaEditor: (state) => {
      state.schemaEditor.isOpen = false;
      state.schemaEditor.serviceId = null;
      state.schemaEditor.currentSchema = null;
      state.schemaEditor.isDirty = false;
      state.schemaEditor.validationErrors = [];
    },

    updateSchemaEditorContent: (state, action: PayloadAction<FormSchema>) => {
      state.schemaEditor.currentSchema = action.payload;
      state.schemaEditor.isDirty = true;
    },

    setSchemaValidationErrors: (state, action: PayloadAction<string[]>) => {
      state.schemaEditor.validationErrors = action.payload;
    },

    markSchemaAsSaved: (state) => {
      state.schemaEditor.isDirty = false;
    },

    // Document Requirements Editor
    openDocumentRequirementsEditor: (state, action: PayloadAction<{ serviceId: string; requirements: DocumentRequirement[] }>) => {
      state.documentRequirementsEditor.isOpen = true;
      state.documentRequirementsEditor.serviceId = action.payload.serviceId;
      state.documentRequirementsEditor.currentRequirements = action.payload.requirements;
      state.documentRequirementsEditor.isDirty = false;
    },

    closeDocumentRequirementsEditor: (state) => {
      state.documentRequirementsEditor.isOpen = false;
      state.documentRequirementsEditor.serviceId = null;
      state.documentRequirementsEditor.currentRequirements = [];
      state.documentRequirementsEditor.isDirty = false;
    },

    updateDocumentRequirements: (state, action: PayloadAction<DocumentRequirement[]>) => {
      state.documentRequirementsEditor.currentRequirements = action.payload;
      state.documentRequirementsEditor.isDirty = true;
    },

    addDocumentRequirement: (state, action: PayloadAction<DocumentRequirement>) => {
      state.documentRequirementsEditor.currentRequirements.push(action.payload);
      state.documentRequirementsEditor.isDirty = true;
    },

    removeDocumentRequirement: (state, action: PayloadAction<number>) => {
      state.documentRequirementsEditor.currentRequirements.splice(action.payload, 1);
      state.documentRequirementsEditor.isDirty = true;
    },

    markDocumentRequirementsAsSaved: (state) => {
      state.documentRequirementsEditor.isDirty = false;
    },

    // Filters
    setServicesFilters: (state, action: PayloadAction<Partial<ServicesFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.page = 1;
    },

    setServicesSearch: (state, action: PayloadAction<string>) => {
      state.filters.search = action.payload;
      state.page = 1;
    },

    setServicesServiceTypeFilter: (state, action: PayloadAction<string | null>) => {
      state.filters.serviceTypeId = action.payload;
      state.page = 1;
    },

    setServicesCategoryFilter: (state, action: PayloadAction<string | null>) => {
      state.filters.category = action.payload;
      state.page = 1;
    },

    setServicesActiveFilter: (state, action: PayloadAction<boolean | null>) => {
      state.filters.isActive = action.payload;
      state.page = 1;
    },

    setServicesSort: (state, action: PayloadAction<{ sortBy: ServicesFilters['sortBy']; sortOrder: ServicesFilters['sortOrder'] }>) => {
      state.filters.sortBy = action.payload.sortBy;
      state.filters.sortOrder = action.payload.sortOrder;
    },

    resetServicesFilters: (state) => {
      state.filters = initialState.filters;
      state.page = 1;
    },

    // Pagination
    setServicesPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },

    setServicesPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.page = 1;
    },

    // Expanded rows
    toggleExpandedRow: (state, action: PayloadAction<string>) => {
      const index = state.expandedRowIds.indexOf(action.payload);
      if (index > -1) {
        state.expandedRowIds.splice(index, 1);
      } else {
        state.expandedRowIds.push(action.payload);
      }
    },

    collapseAllRows: (state) => {
      state.expandedRowIds = [];
    },

    // Reset all state
    resetServicesState: () => initialState,
  },
});

export const {
  setServicesViewMode,
  setServicesActiveTab,
  setSelectedServiceIds,
  toggleServiceSelection,
  selectAllServices,
  clearServiceSelection,
  toggleServicesBulkMode,
  openCreateServiceModal,
  closeCreateServiceModal,
  openEditServiceModal,
  closeEditServiceModal,
  openDeleteServiceModal,
  closeDeleteServiceModal,
  openDuplicateServiceModal,
  closeDuplicateServiceModal,
  openSchemaEditor,
  closeSchemaEditor,
  updateSchemaEditorContent,
  setSchemaValidationErrors,
  markSchemaAsSaved,
  openDocumentRequirementsEditor,
  closeDocumentRequirementsEditor,
  updateDocumentRequirements,
  addDocumentRequirement,
  removeDocumentRequirement,
  markDocumentRequirementsAsSaved,
  setServicesFilters,
  setServicesSearch,
  setServicesServiceTypeFilter,
  setServicesCategoryFilter,
  setServicesActiveFilter,
  setServicesSort,
  resetServicesFilters,
  setServicesPage,
  setServicesPageSize,
  toggleExpandedRow,
  collapseAllRows,
  resetServicesState,
} = servicesSlice.actions;

export default servicesSlice.reducer;

// Selectors
export const selectServicesViewMode = (state: { services: ServicesState }) => state.services.viewMode;
export const selectServicesActiveTab = (state: { services: ServicesState }) => state.services.activeTab;
export const selectServicesSelectedIds = (state: { services: ServicesState }) => state.services.selectedIds;
export const selectServicesBulkMode = (state: { services: ServicesState }) => state.services.bulkMode;
export const selectServicesModals = (state: { services: ServicesState }) => ({
  isCreateModalOpen: state.services.isCreateModalOpen,
  isEditModalOpen: state.services.isEditModalOpen,
  isDeleteModalOpen: state.services.isDeleteModalOpen,
  isDuplicateModalOpen: state.services.isDuplicateModalOpen,
  editingServiceId: state.services.editingServiceId,
  deletingServiceId: state.services.deletingServiceId,
  duplicatingServiceId: state.services.duplicatingServiceId,
});
export const selectSchemaEditor = (state: { services: ServicesState }) => state.services.schemaEditor;
export const selectDocumentRequirementsEditor = (state: { services: ServicesState }) => state.services.documentRequirementsEditor;
export const selectServicesFilters = (state: { services: ServicesState }) => state.services.filters;
export const selectServicesPagination = (state: { services: ServicesState }) => ({
  page: state.services.page,
  pageSize: state.services.pageSize,
});
export const selectServicesExpandedRows = (state: { services: ServicesState }) => state.services.expandedRowIds;
