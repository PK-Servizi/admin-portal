/**
 * Service Requests List Component
 * Demonstrates RTK Query with optimistic updates and caching
 */

import React, { useState } from 'react';
import {
  useGetMyServiceRequestsQuery,
  useGetServiceTypesQuery,
  useCreateServiceRequestMutation,
  useDeleteServiceRequestMutation,
} from '@/services/api';
import { useToast, useApiError } from '@/hooks';

export const ServiceRequestsList: React.FC = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const toast = useToast();
  const { handleError } = useApiError();

  // Fetch service requests with automatic caching and refetching
  const {
    data: requestsData,
    isLoading,
    isFetching,
    error,
  } = useGetMyServiceRequestsQuery({
    page,
    limit: 10,
    status: statusFilter,
  });

  // Fetch service types for the create form
  const { data: serviceTypesData } = useGetServiceTypesQuery();

  // Mutations with optimistic updates
  const [createRequest, { isLoading: _isCreating }] = useCreateServiceRequestMutation();
  const [deleteRequest, { isLoading: isDeleting }] = useDeleteServiceRequestMutation();

  // Handle create request
  const handleCreate = async (serviceTypeId: string, formData: any) => {
    try {
      const result = await createRequest({ serviceTypeId, formData }).unwrap();
      toast.success('Service request created successfully!');
      console.log('Created:', result);
    } catch (err) {
      handleError(err);
    }
  };

  // Handle delete request
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this request?')) return;

    try {
      await deleteRequest(id).unwrap();
      toast.success('Service request deleted successfully!');
    } catch (err) {
      handleError(err);
    }
  };

  if (isLoading) {
    return <div>Loading service requests...</div>;
  }

  if (error) {
    return <div>Error loading service requests</div>;
  }

  const requests = requestsData?.data || [];
  const pagination = requestsData?.pagination;

  return (
    <div className="service-requests-container">
      <div className="header">
        <h1>My Service Requests</h1>
        <button onClick={() => handleCreate('service-type-id', { /* form data */ })}>
          Create New Request
        </button>
      </div>

      {/* Status filter */}
      <div className="filters">
        <select value={statusFilter || ''} onChange={(e) => setStatusFilter(e.target.value || undefined)}>
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Loading indicator for background fetches */}
      {isFetching && !isLoading && (
        <div className="fetching-indicator">Updating...</div>
      )}

      {/* Requests list */}
      <div className="requests-list">
        {requests.length === 0 ? (
          <div className="empty-state">No service requests found</div>
        ) : (
          requests.map((request) => (
            <div key={request.id} className="request-card">
              <div className="request-header">
                <h3>{request.referenceNumber}</h3>
                <span className={`status-badge status-${request.status}`}>
                  {request.status}
                </span>
              </div>
              <div className="request-body">
                <p>Type: {request.serviceType?.name}</p>
                <p>Priority: {request.priority}</p>
                <p>Created: {new Date(request.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="request-actions">
                <button onClick={() => console.log('View', request.id)}>View</button>
                <button onClick={() => console.log('Edit', request.id)}>Edit</button>
                <button 
                  onClick={() => handleDelete(request.id)}
                  disabled={isDeleting}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </button>
          <span>
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
            disabled={page === pagination.pages}
          >
            Next
          </button>
        </div>
      )}

      {/* Service Types for reference */}
      {serviceTypesData && (
        <div className="service-types-info">
          <h3>Available Service Types</h3>
          <ul>
            {serviceTypesData.data.map((type) => (
              <li key={type.id}>{type.name} - {type.description}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ServiceRequestsList;
