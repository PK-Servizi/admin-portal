/**
 * Service Types List Page
 * Display and manage all service types with CRUD operations
 */

import React, { useState, useMemo } from 'react';
import {
  useGetAdminServiceTypesQuery,
  useCreateServiceTypeMutation,
  useUpdateServiceTypeMutation,
  useDeleteServiceTypeMutation,
  useToggleServiceTypeActiveMutation,
  useBulkDeleteServiceTypesMutation,
} from '@/services/api/service-types.api';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import {
  selectServiceTypesModals,
  selectServiceTypesFilters,
  selectServiceTypesPagination,
  selectServiceTypesSelectedIds,
  selectServiceTypesBulkMode,
  openCreateServiceTypeModal,
  closeCreateServiceTypeModal,
  openEditServiceTypeModal,
  closeEditServiceTypeModal,
  openDeleteServiceTypeModal,
  closeDeleteServiceTypeModal,
  setServiceTypesSearch,
  setServiceTypesActiveFilter,
  setServiceTypesSort,
  resetServiceTypesFilters,
  setServiceTypesPage,
  setServiceTypesPageSize,
  setSelectedServiceTypeIds,
  toggleServiceTypeSelection,
  clearServiceTypeSelection,
  toggleServiceTypesBulkMode,
} from '@/store/slices/serviceTypesSlice';
import { cn } from '@/lib/utils';
import { formatDate, formatRelativeTime } from '@/utils/helpers';
import { ServiceTypeForm } from './ServiceTypeForm';
import type { CreateServiceTypeData, UpdateServiceTypeData } from '@/types';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FolderOpen,
  Layers,
} from 'lucide-react';

export const ServiceTypesList: React.FC = () => {
  const dispatch = useAppDispatch();
  
  // Redux state
  const modals = useAppSelector(selectServiceTypesModals);
  const filters = useAppSelector(selectServiceTypesFilters);
  const pagination = useAppSelector(selectServiceTypesPagination);
  const selectedIds = useAppSelector(selectServiceTypesSelectedIds);
  const bulkMode = useAppSelector(selectServiceTypesBulkMode);

  // Local state
  const [searchInput, setSearchInput] = useState(filters.search);
  const [showFilters, setShowFilters] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // API hooks
  const { data, isLoading, isFetching, refetch } = useGetAdminServiceTypesQuery({
    search: filters.search || undefined,
    isActive: filters.isActive ?? undefined,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
    skip: (pagination.page - 1) * pagination.pageSize,
    take: pagination.pageSize,
  });

  const [createServiceType, { isLoading: isCreating }] = useCreateServiceTypeMutation();
  const [updateServiceType, { isLoading: isUpdating }] = useUpdateServiceTypeMutation();
  const [deleteServiceType, { isLoading: isDeleting }] = useDeleteServiceTypeMutation();
  const [toggleActive, { isLoading: isToggling }] = useToggleServiceTypeActiveMutation();
  const [bulkDelete, { isLoading: isBulkDeleting }] = useBulkDeleteServiceTypesMutation();

  // Memoize data to avoid re-renders
  const serviceTypes = useMemo(() => data?.data || [], [data?.data]);
  const totalCount = data?.pagination?.total || 0;
  const totalPages = Math.ceil(totalCount / pagination.pageSize);

  // Memoized counts
  const { activeCount, inactiveCount } = useMemo(() => {
    return {
      activeCount: serviceTypes.filter(st => st.isActive).length,
      inactiveCount: serviceTypes.filter(st => !st.isActive).length,
    };
  }, [serviceTypes]);

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setServiceTypesSearch(searchInput));
  };

  // Clear all filters
  const clearFilters = () => {
    dispatch(resetServiceTypesFilters());
    setSearchInput('');
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    dispatch(setServiceTypesPage(newPage));
  };

  // Handle create
  const handleCreate = async (data: CreateServiceTypeData | UpdateServiceTypeData) => {
    try {
      await createServiceType(data as CreateServiceTypeData).unwrap();
      dispatch(closeCreateServiceTypeModal());
    } catch (error) {
      console.error('Failed to create service type:', error);
      throw error;
    }
  };

  // Handle update
  const handleUpdate = async (data: CreateServiceTypeData | UpdateServiceTypeData) => {
    if (!modals.editingServiceTypeId) return;
    try {
      await updateServiceType({ id: modals.editingServiceTypeId, data: data as UpdateServiceTypeData }).unwrap();
      dispatch(closeEditServiceTypeModal());
    } catch (error) {
      console.error('Failed to update service type:', error);
      throw error;
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!modals.deletingServiceTypeId) return;
    try {
      await deleteServiceType(modals.deletingServiceTypeId).unwrap();
      dispatch(closeDeleteServiceTypeModal());
    } catch (error) {
      console.error('Failed to delete service type:', error);
    }
  };

  // Handle toggle active
  const handleToggleActive = async (id: string) => {
    try {
      await toggleActive(id).unwrap();
      setOpenDropdown(null);
    } catch (error) {
      console.error('Failed to toggle service type:', error);
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} service types? This action cannot be undone.`)) {
      return;
    }
    try {
      await bulkDelete(selectedIds).unwrap();
      dispatch(clearServiceTypeSelection());
      dispatch(toggleServiceTypesBulkMode());
    } catch (error) {
      console.error('Failed to bulk delete:', error);
    }
  };

  // Select all on current page
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      dispatch(setSelectedServiceTypeIds(serviceTypes.map(st => st.id)));
    } else {
      dispatch(clearServiceTypeSelection());
    }
  };

  // Select single item
  const handleSelectItem = (id: string) => {
    dispatch(toggleServiceTypeSelection(id));
  };

  const hasActiveFilters = filters.search || filters.isActive !== null;

  // Get editing service type
  const editingServiceType = modals.editingServiceTypeId
    ? serviceTypes.find(st => st.id === modals.editingServiceTypeId)
    : undefined;

  // Get deleting service type
  const deletingServiceType = modals.deletingServiceTypeId
    ? serviceTypes.find(st => st.id === modals.deletingServiceTypeId)
    : undefined;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Layers className="h-7 w-7 text-indigo-500" />
            Service Types
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage service categories
          </p>
        </div>
        <div className="flex items-center gap-2">
          {bulkMode && selectedIds.length > 0 && (
            <button
              onClick={handleBulkDelete}
              disabled={isBulkDeleting}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {isBulkDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              Delete ({selectedIds.length})
            </button>
          )}
          <button
            onClick={() => dispatch(toggleServiceTypesBulkMode())}
            className={cn(
              'px-4 py-2 border rounded-lg transition-colors',
              bulkMode
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-500/10 dark:border-indigo-500/30 dark:text-indigo-400'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
            )}
          >
            {bulkMode ? 'Cancel' : 'Bulk Select'}
          </button>
          <button
            onClick={() => refetch()}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className={cn('h-5 w-5', isFetching && 'animate-spin')} />
          </button>
          <button
            onClick={() => dispatch(openCreateServiceTypeModal())}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Type
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg">
              <Layers className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-500/20 rounded-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-500/20 rounded-lg">
              <XCircle className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Inactive</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{inactiveCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search service type..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('');
                    if (filters.search) {
                      dispatch(setServiceTypesSearch(''));
                    }
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </form>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors',
              showFilters || hasActiveFilters
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-500/10 dark:border-indigo-500/30 dark:text-indigo-400'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
            )}
          >
            <Filter className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 px-1.5 py-0.5 bg-indigo-600 text-white text-xs rounded-full">
                {[filters.search, filters.isActive !== null].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {/* Filter options */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={filters.isActive === null ? '' : filters.isActive ? 'active' : 'inactive'}
                  onChange={(e) => {
                    const value = e.target.value;
                    dispatch(setServiceTypesActiveFilter(
                      value === '' ? null : value === 'active'
                    ));
                  }}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">All statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Sort by
                </label>
                <select
                  value={`${filters.sortBy}-${filters.sortOrder}`}
                  onChange={(e) => {
                    const [sortBy, sortOrder] = e.target.value.split('-') as [typeof filters.sortBy, typeof filters.sortOrder];
                    dispatch(setServiceTypesSort({ sortBy, sortOrder }));
                  }}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="name-ASC">Name (A-Z)</option>
                  <option value="name-DESC">Name (Z-A)</option>
                  <option value="createdAt-DESC">Most recent</option>
                  <option value="createdAt-ASC">Oldest first</option>
                  <option value="updatedAt-DESC">Last updated</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Clear filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
          </div>
        ) : serviceTypes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            <FolderOpen className="h-12 w-12 mb-4" />
            <p className="text-lg font-medium">No service types found</p>
            <p className="text-sm mt-1">
              {hasActiveFilters ? 'Try adjusting the filters' : 'Create your first service type'}
            </p>
            {!hasActiveFilters && (
              <button
                onClick={() => dispatch(openCreateServiceTypeModal())}
                className="mt-4 flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                New Type
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    {bulkMode && (
                      <th className="w-12 px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.length === serviceTypes.length && serviceTypes.length > 0}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                      </th>
                    )}
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Updated
                    </th>
                    <th className="w-12 px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {serviceTypes.map((serviceType) => (
                    <tr
                      key={serviceType.id}
                      className={cn(
                        'hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors',
                        selectedIds.includes(serviceType.id) && 'bg-indigo-50 dark:bg-indigo-500/10'
                      )}
                    >
                      {bulkMode && (
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(serviceType.id)}
                            onChange={() => handleSelectItem(serviceType.id)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg">
                            <Layers className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {serviceType.name}
                            </p>
                            {serviceType.description && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                {serviceType.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full',
                            serviceType.isActive
                              ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                              : 'bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400'
                          )}
                        >
                          {serviceType.isActive ? (
                            <>
                              <CheckCircle2 className="h-3 w-3" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3" />
                              Inactive
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(serviceType.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {formatRelativeTime(serviceType.updatedAt)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="relative">
                          <button
                            onClick={() => setOpenDropdown(openDropdown === serviceType.id ? null : serviceType.id)}
                            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <MoreVertical className="h-5 w-5" />
                          </button>
                          {openDropdown === serviceType.id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setOpenDropdown(null)}
                              />
                              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 py-1">
                                <button
                                  onClick={() => {
                                    dispatch(openEditServiceTypeModal(serviceType.id));
                                    setOpenDropdown(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  <Edit className="h-4 w-4" />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleToggleActive(serviceType.id)}
                                  disabled={isToggling}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                                >
                                  {serviceType.isActive ? (
                                    <>
                                      <ToggleLeft className="h-4 w-4" />
                                      Deactivate
                                    </>
                                  ) : (
                                    <>
                                      <ToggleRight className="h-4 w-4" />
                                      Activate
                                    </>
                                  )}
                                </button>
                                <hr className="my-1 border-gray-200 dark:border-gray-700" />
                                <button
                                  onClick={() => {
                                    dispatch(openDeleteServiceTypeModal(serviceType.id));
                                    setOpenDropdown(null);
                                  }}
                                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Show
                  </span>
                  <select
                    value={pagination.pageSize}
                    onChange={(e) => dispatch(setServiceTypesPageSize(Number(e.target.value)))}
                    className="px-2 py-1 text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                    <option value={100}>100</option>
                  </select>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    of {totalCount} results
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-200">
                    Page {pagination.page} of {totalPages}
                  </span>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === totalPages}
                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create Modal */}
      {modals.isCreateModalOpen && (
        <ServiceTypeForm
          mode="create"
          onSubmit={handleCreate}
          onClose={() => dispatch(closeCreateServiceTypeModal())}
          isLoading={isCreating}
        />
      )}

      {/* Edit Modal */}
      {modals.isEditModalOpen && editingServiceType && (
        <ServiceTypeForm
          mode="edit"
          serviceType={editingServiceType}
          onSubmit={handleUpdate}
          onClose={() => dispatch(closeEditServiceTypeModal())}
          isLoading={isUpdating}
        />
      )}

      {/* Delete Confirmation Modal */}
      {modals.isDeleteModalOpen && deletingServiceType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => dispatch(closeDeleteServiceTypeModal())} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-red-100 dark:bg-red-500/20 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Confirm deletion
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  This action cannot be undone
                </p>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Are you sure you want to delete the service type{' '}
              <span className="font-semibold">{deletingServiceType.name}</span>?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => dispatch(closeDeleteServiceTypeModal())}
                className="px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
