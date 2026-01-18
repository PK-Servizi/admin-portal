/**
 * Service Requests List Page
 * Full-featured service requests management with filters, status updates, and operator assignment
 */

import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  useGetAllRequestsQuery,
  useUpdateRequestStatusMutation,
  useAssignToOperatorMutation,
  useBulkUpdateStatusMutation,
} from '@/services/api/admin.api';
import { useGetAllUsersQuery } from '@/services/api/users-admin.api';
import { cn } from '@/lib/utils';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  UserPlus,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  X,
  Download,
  RefreshCw,
  FileText,
  Calendar,
} from 'lucide-react';
import { PAGINATION, STATUS, PRIORITY } from '@/constants';

interface RequestFilters {
  search: string;
  status: string;
  priority: string;
  serviceTypeId: string;
  assignedOperatorId: string;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400',
  in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
  completed: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
  cancelled: 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
};

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400',
  medium: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400',
  urgent: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
};

const StatusIcon: React.FC<{ status: string }> = ({ status }) => {
  switch (status) {
    case 'pending':
      return <Clock className="h-4 w-4" />;
    case 'in_progress':
      return <AlertCircle className="h-4 w-4" />;
    case 'completed':
      return <CheckCircle className="h-4 w-4" />;
    case 'cancelled':
    case 'rejected':
      return <XCircle className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

export const ServiceRequestsListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Pagination state
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const [pageSize, setPageSize] = useState(
    Number(searchParams.get('pageSize')) || PAGINATION.DEFAULT_PAGE_SIZE
  );

  // Filter state
  const [filters, setFilters] = useState<RequestFilters>({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || '',
    priority: searchParams.get('priority') || '',
    serviceTypeId: searchParams.get('serviceTypeId') || '',
    assignedOperatorId: searchParams.get('assignedOperatorId') || '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.search);

  // Selected requests for bulk actions
  const [selectedRequests, setSelectedRequests] = useState<string[]>([]);

  // Modal states
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);

  // Dropdown state
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // API hooks
  const { data, isLoading, isFetching, refetch } = useGetAllRequestsQuery({
    skip: (page - 1) * pageSize,
    take: pageSize,
    search: filters.search || undefined,
    status: filters.status || undefined,
    priority: filters.priority || undefined,
    serviceTypeId: filters.serviceTypeId || undefined,
    assignedOperatorId: filters.assignedOperatorId || undefined,
  });

  const { data: operatorsData } = useGetAllUsersQuery({
    role: 'operator',
    take: 100,
  });

  const [updateStatus] = useUpdateRequestStatusMutation();
  const [assignOperator, { isLoading: isAssigning }] = useAssignToOperatorMutation();
  const [bulkUpdateStatus, { isLoading: isBulkUpdating }] = useBulkUpdateStatusMutation();

  const requests = data?.data || [];
  const totalCount = data?.pagination?.total || 0;
  const totalPages = Math.ceil(totalCount / pageSize);
  const operators = operatorsData?.data || [];

  // Update URL params when filters change
  const updateSearchParams = (newFilters: Partial<RequestFilters>, newPage?: number) => {
    const params = new URLSearchParams();
    const updatedFilters = { ...filters, ...newFilters };
    
    if (updatedFilters.search) params.set('search', updatedFilters.search);
    if (updatedFilters.status) params.set('status', updatedFilters.status);
    if (updatedFilters.priority) params.set('priority', updatedFilters.priority);
    if (updatedFilters.serviceTypeId) params.set('serviceTypeId', updatedFilters.serviceTypeId);
    if (updatedFilters.assignedOperatorId) params.set('assignedOperatorId', updatedFilters.assignedOperatorId);
    if (newPage && newPage > 1) params.set('page', String(newPage));
    
    setSearchParams(params);
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, search: searchInput }));
    setPage(1);
    updateSearchParams({ search: searchInput }, 1);
  };

  // Handle filter change
  const handleFilterChange = (key: keyof RequestFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
    updateSearchParams({ [key]: value }, 1);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: '',
      status: '',
      priority: '',
      serviceTypeId: '',
      assignedOperatorId: '',
    });
    setSearchInput('');
    setPage(1);
    setSearchParams(new URLSearchParams());
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateSearchParams({}, newPage);
  };

  // Handle status update
  const handleStatusUpdate = async (requestId: string, status: string, reason?: string) => {
    try {
      await updateStatus({ id: requestId, data: { status, reason } }).unwrap();
      setSelectedRequest(null);
      setOpenDropdown(null);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  // Handle operator assignment
  const handleAssignOperator = async (requestId: string, operatorId: string) => {
    try {
      await assignOperator({ id: requestId, data: { operatorId } }).unwrap();
      setShowAssignModal(false);
      setSelectedRequest(null);
      setOpenDropdown(null);
    } catch (error) {
      console.error('Failed to assign operator:', error);
    }
  };

  // Handle bulk status update
  const handleBulkStatusUpdate = async (status: string) => {
    if (selectedRequests.length === 0) return;
    
    try {
      await bulkUpdateStatus({ requestIds: selectedRequests, status }).unwrap();
      setSelectedRequests([]);
    } catch (error) {
      console.error('Failed to bulk update status:', error);
    }
  };

  // Select all requests on current page
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRequests(requests.map((r) => r.id));
    } else {
      setSelectedRequests([]);
    }
  };

  // Select single request
  const handleSelectRequest = (requestId: string, checked: boolean) => {
    if (checked) {
      setSelectedRequests((prev) => [...prev, requestId]);
    } else {
      setSelectedRequests((prev) => prev.filter((id) => id !== requestId));
    }
  };

  const hasActiveFilters = Object.values(filters).some(Boolean);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Service Requests</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage and process service requests
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
            className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <Link
            to="/service-requests/new"
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Request
          </Link>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedRequests.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-200 dark:border-blue-500/30 p-4">
          <div className="flex items-center justify-between">
            <span className="text-blue-700 dark:text-blue-400 font-medium">
              {selectedRequests.length} request(s) selected
            </span>
            <div className="flex items-center gap-2">
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleBulkStatusUpdate(e.target.value);
                  }
                }}
                className="px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
                disabled={isBulkUpdating}
              >
                <option value="">Change Status...</option>
                {Object.entries(STATUS.SERVICE_REQUEST).map(([key, value]) => (
                  <option key={key} value={value}>
                    {key.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setSelectedRequests([])}
                className="px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                Clear selection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <form onSubmit={handleSearch} className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by request ID or description..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput('');
                    if (filters.search) {
                      handleFilterChange('search', '');
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
                ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-500/10 dark:border-blue-500/30 dark:text-blue-400'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
            )}
          >
            <Filter className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-1 px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                {Object.values(filters).filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {/* Filter options */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Statuses</option>
                  {Object.entries(STATUS.SERVICE_REQUEST).map(([key, value]) => (
                    <option key={key} value={value}>
                      {key.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Priority
                </label>
                <select
                  value={filters.priority}
                  onChange={(e) => handleFilterChange('priority', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Priorities</option>
                  {Object.entries(PRIORITY).map(([key, value]) => (
                    <option key={key} value={value}>
                      {key}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Assigned To
                </label>
                <select
                  value={filters.assignedOperatorId}
                  onChange={(e) => handleFilterChange('assignedOperatorId', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Operators</option>
                  <option value="unassigned">Unassigned</option>
                  {operators.map((op) => (
                    <option key={op.id} value={op.id}>
                      {op.firstName} {op.lastName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Requests Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No requests found</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {hasActiveFilters
                ? 'Try adjusting your search or filter criteria'
                : 'No service requests have been submitted yet'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-4 text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="w-12 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedRequests.length === requests.length && requests.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Request
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="w-12 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {requests.map((request) => (
                  <tr
                    key={request.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRequests.includes(request.id)}
                        onChange={(e) => handleSelectRequest(request.id, e.target.checked)}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/service-requests/${request.id}`}
                        className="group"
                      >
                        <p className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                          #{request.id.slice(0, 8)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                          {request.serviceType?.name || 'Unknown Service'}
                        </p>
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                          {request.user?.firstName?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {request.user?.firstName} {request.user?.lastName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {request.user?.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
                          statusColors[request.status] || statusColors.pending
                        )}
                      >
                        <StatusIcon status={request.status} />
                        {request.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'px-2.5 py-1 rounded-full text-xs font-medium capitalize',
                          priorityColors[request.priority] || priorityColors.medium
                        )}
                      >
                        {request.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {request.assignedTo ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center text-green-600 text-xs font-medium">
                            {request.assignedTo.firstName?.charAt(0)}
                          </div>
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {request.assignedTo.firstName} {request.assignedTo.lastName}
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedRequest(request.id);
                            setShowAssignModal(true);
                          }}
                          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
                        >
                          <UserPlus className="h-4 w-4" />
                          Assign
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="h-4 w-4" />
                        {new Date(request.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative">
                        <button
                          onClick={() =>
                            setOpenDropdown(openDropdown === request.id ? null : request.id)
                          }
                          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <MoreVertical className="h-5 w-5" />
                        </button>

                        {openDropdown === request.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setOpenDropdown(null)}
                            />
                            <div className="absolute right-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                              <Link
                                to={`/service-requests/${request.id}`}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={() => setOpenDropdown(null)}
                              >
                                <Eye className="h-4 w-4" />
                                View Details
                              </Link>
                              <Link
                                to={`/service-requests/${request.id}/edit`}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                                onClick={() => setOpenDropdown(null)}
                              >
                                <Edit className="h-4 w-4" />
                                Edit
                              </Link>
                              <button
                                onClick={() => {
                                  setSelectedRequest(request.id);
                                  setShowAssignModal(true);
                                }}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <UserPlus className="h-4 w-4" />
                                Assign Operator
                              </button>
                              <div className="border-t border-gray-200 dark:border-gray-700 my-1" />
                              <div className="px-4 py-2">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                                  Change Status
                                </p>
                                <div className="space-y-1">
                                  {Object.entries(STATUS.SERVICE_REQUEST).map(([key, value]) => (
                                    <button
                                      key={key}
                                      onClick={() => handleStatusUpdate(request.id, value)}
                                      disabled={request.status === value}
                                      className={cn(
                                        'w-full text-left px-2 py-1 text-xs rounded transition-colors',
                                        request.status === value
                                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                                      )}
                                    >
                                      {key.replace(/_/g, ' ')}
                                    </button>
                                  ))}
                                </div>
                              </div>
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
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span>
                Showing {(page - 1) * pageSize + 1} to{' '}
                {Math.min(page * pageSize, totalCount)} of {totalCount} requests
              </span>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="px-2 py-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                {PAGINATION.PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size} / page
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={cn(
                        'px-3 py-1 rounded-lg text-sm font-medium transition-colors',
                        page === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      )}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Assign Operator Modal */}
      {showAssignModal && selectedRequest && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => {
              setShowAssignModal(false);
              setSelectedRequest(null);
            }}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl z-50 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Assign Operator
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {operators.map((operator) => (
                <button
                  key={operator.id}
                  onClick={() => handleAssignOperator(selectedRequest, operator.id)}
                  disabled={isAssigning}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-white font-medium">
                    {operator.firstName?.charAt(0)}
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {operator.firstName} {operator.lastName}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{operator.email}</p>
                  </div>
                </button>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedRequest(null);
                }}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ServiceRequestsListPage;
