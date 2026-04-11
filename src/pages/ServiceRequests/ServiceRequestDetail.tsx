/**
 * Service Request Detail Page
 * View and manage a single service request with notes, documents, and status updates
 */

import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  useGetRequestDetailQuery,
  useUpdateRequestStatusMutation,
  useAssignToOperatorMutation,
  useAddInternalNoteMutation,
  useRequestAdditionalDocumentsMutation,
  useLazyGetDocumentViewUrlQuery,
} from '@/services/api/admin.api';
import { useGetAllUsersQuery } from '@/services/api/users-admin.api';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  Edit,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Mail,
  Phone,
  Send,
  UserPlus,
  Download,
  Eye,
  Loader2,
  MoreVertical,
  Plus,
} from 'lucide-react';
import { STATUS } from '@/constants';
import { STATUS_CONFIG } from '@/types/service-request.types';

const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400 border-gray-200 dark:border-gray-500/30',
  submitted: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200 dark:border-blue-500/30',
  payment_pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/30',
  awaiting_form: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400 border-yellow-200 dark:border-yellow-500/30',
  awaiting_documents: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 border-orange-200 dark:border-orange-500/30',
  in_review: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 border-purple-200 dark:border-purple-500/30',
  missing_documents: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400 border-orange-200 dark:border-orange-500/30',
  completed: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 border-green-200 dark:border-green-500/30',
  closed: 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400 border-gray-200 dark:border-gray-500/30',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-200 dark:border-red-500/30',
};

const StatusIcon: React.FC<{ status: string; className?: string }> = ({ status, className }) => {
  switch (status) {
    case 'draft':
      return <FileText className={cn('h-5 w-5', className)} />;
    case 'submitted':
    case 'payment_pending':
    case 'awaiting_form':
    case 'awaiting_documents':
      return <Clock className={cn('h-5 w-5', className)} />;
    case 'in_review':
    case 'missing_documents':
      return <AlertCircle className={cn('h-5 w-5', className)} />;
    case 'completed':
      return <CheckCircle className={cn('h-5 w-5', className)} />;
    case 'closed':
    case 'rejected':
      return <XCircle className={cn('h-5 w-5', className)} />;
    default:
      return <FileText className={cn('h-5 w-5', className)} />;
  }
};

/** Parse the backend internalNotes string into structured note entries */
function parseInternalNotes(notes: string | null | undefined): Array<{ timestamp: string; author: string; content: string }> {
  if (!notes) return [];
  return notes.split('\n').filter(Boolean).map((line) => {
    const match = line.match(/^\[(.+?)\]\s*Admin\s+(.+?):\s*(.+)$/);
    if (match) {
      return { timestamp: match[1], author: match[2], content: match[3] };
    }
    return { timestamp: '', author: '', content: line };
  });
}

export const ServiceRequestDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [newNote, setNewNote] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showRequestDocsModal, setShowRequestDocsModal] = useState(false);
  const [requestDocsReason, setRequestDocsReason] = useState('');
  const [requestDocsCategories, setRequestDocsCategories] = useState<string[]>([]);

  // API hooks
  const { data, isLoading, error } = useGetRequestDetailQuery(id!);
  const { data: operatorsData } = useGetAllUsersQuery({ role: 'operator', take: 100 });

  const [updateStatus, { isLoading: isUpdatingStatus }] = useUpdateRequestStatusMutation();
  const [assignOperator, { isLoading: isAssigning }] = useAssignToOperatorMutation();
  const [addNote, { isLoading: isAddingNote }] = useAddInternalNoteMutation();
  const [requestDocuments, { isLoading: isRequestingDocs }] = useRequestAdditionalDocumentsMutation();
  const [getDocumentViewUrl] = useLazyGetDocumentViewUrlQuery();

  const request = data?.data;
  const operators = operatorsData?.data || [];

  const handleStatusUpdate = async (status: string) => {
    try {
      await updateStatus({ id: id!, data: { status } }).unwrap();
      setShowStatusDropdown(false);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleAssignOperator = async (operatorId: string) => {
    try {
      await assignOperator({ id: id!, data: { operatorId } }).unwrap();
      setShowAssignModal(false);
    } catch (error) {
      console.error('Failed to assign operator:', error);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      await addNote({ id: id!, data: { note: newNote } }).unwrap();
      setNewNote('');
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  };

  const handleRequestDocuments = async (e: React.FormEvent) => {
    e.preventDefault();
    if (requestDocsCategories.length === 0 || !requestDocsReason.trim()) return;

    try {
      await requestDocuments({
        id: id!,
        data: { categories: requestDocsCategories, reason: requestDocsReason },
      }).unwrap();
      setShowRequestDocsModal(false);
      setRequestDocsReason('');
      setRequestDocsCategories([]);
    } catch (error) {
      console.error('Failed to request documents:', error);
    }
  };

  const documentCategories = [
    'identity_document',
    'fiscal_code',
    'income_certificate',
    'bank_statement',
    'property_document',
    'medical_receipts',
    'expense_receipts',
    'other',
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Request not found</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          The request you're looking for doesn't exist or has been deleted.
        </p>
        <Link
          to="/service-requests"
          className="mt-4 text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
        >
          Back to Service Requests
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/service-requests')}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Request #{id?.slice(0, 8)}
              </h1>
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium border',
                  statusColors[request.status] || statusColors.draft
                )}
              >
                <StatusIcon status={request.status} className="h-4 w-4" />
                {STATUS_CONFIG[request.status]?.label || request.status.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              {request.service?.name || request.serviceType?.name || 'Unknown Service Type'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Status dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              disabled={isUpdatingStatus}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {isUpdatingStatus ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <MoreVertical className="h-4 w-4" />
              )}
              Update Status
            </button>
            {showStatusDropdown && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowStatusDropdown(false)}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-20">
                  {Object.entries(STATUS.SERVICE_REQUEST).map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() => handleStatusUpdate(value)}
                      disabled={request.status === value}
                      className={cn(
                        'w-full text-left px-4 py-2 text-sm transition-colors',
                        request.status === value
                          ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                          : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
                      )}
                    >
                      {STATUS_CONFIG[value]?.label || key.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          <Link
            to={`/service-requests/${id}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Request Details */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Request Details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Service Type
                </label>
                <p className="mt-1 text-gray-900 dark:text-white">
                  {request.service?.name || request.serviceType?.name || 'Unknown Service'}
                </p>
              </div>
              {request.userNotes && (
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    User Notes
                  </label>
                  <p className="mt-1 text-gray-900 dark:text-white whitespace-pre-wrap">
                    {request.userNotes}
                  </p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Priority
                  </label>
                  <p className="mt-1 text-gray-900 dark:text-white capitalize">
                    {request.priority || 'Normal'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Submitted At
                  </label>
                  <p className="mt-1 text-gray-900 dark:text-white">
                    {request.submittedAt ? new Date(request.submittedAt).toLocaleString() : 'Not submitted yet'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Questionnaire / Form Data */}
          {request.formData && Object.keys(request.formData).length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Questionnaire Responses
              </h2>
              <div className="space-y-3">
                {Object.entries(request.formData)
                  .filter(([, value]) => {
                    // Hide base64 file data and empty values
                    const str = String(value ?? '');
                    return !str.startsWith('data:') && !str.startsWith('blob:');
                  })
                  .map(([key, value]) => {
                    let displayValue: React.ReactNode;
                    const str = String(value ?? '-');

                    if (typeof value === 'boolean') {
                      displayValue = value ? 'Yes' : 'No';
                    } else if (typeof value === 'object' && value !== null) {
                      if (Array.isArray(value)) {
                        displayValue = value.length > 0 ? value.join(', ') : '-';
                      } else {
                        displayValue = (
                          <pre className="text-xs bg-gray-50 dark:bg-gray-900 p-2 rounded overflow-x-auto">
                            {JSON.stringify(value, null, 2)}
                          </pre>
                        );
                      }
                    } else if (str === 'true' || str === 'false') {
                      displayValue = str === 'true' ? 'Yes' : 'No';
                    } else {
                      displayValue = str;
                    }

                    return (
                      <div key={key} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400 sm:w-1/3 capitalize">
                          {key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim()}
                        </label>
                        <p className="text-sm text-gray-900 dark:text-white sm:w-2/3 break-words">
                          {displayValue}
                        </p>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Documents */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Documents
              </h2>
              <button
                onClick={() => setShowRequestDocsModal(true)}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                <Plus className="h-4 w-4" />
                Request Documents
              </button>
            </div>
            {request.documents && request.documents.length > 0 ? (
              <div className="space-y-3">
                {request.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{doc.originalFilename || doc.filename || doc.originalName}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                            {(doc.category || '').replace(/_/g, ' ')}
                          </span>
                          <span className="text-xs text-gray-300 dark:text-gray-600">•</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(doc.createdAt || doc.uploadedAt || '').toLocaleDateString()}
                          </span>
                          <span className="text-xs text-gray-300 dark:text-gray-600">•</span>
                          <span className={cn(
                            'text-xs font-medium px-1.5 py-0.5 rounded capitalize',
                            doc.status === 'approved' && 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
                            doc.status === 'rejected' && 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',
                            doc.status === 'pending' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400',
                          )}>
                            {doc.status}
                          </span>
                        </div>
                        {doc.adminNotes && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">{doc.adminNotes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={async () => {
                          try {
                            const result = await getDocumentViewUrl(doc.id).unwrap();
                            if (result?.data?.url) window.open(result.data.url, '_blank');
                          } catch { /* ignore */ }
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            const result = await getDocumentViewUrl(doc.id).unwrap();
                            if (result?.data?.url) {
                              const a = document.createElement('a');
                              a.href = result.data.url;
                              a.download = doc.originalFilename || doc.filename || 'download';
                              a.click();
                            }
                          } catch { /* ignore */ }
                        }}
                        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600"
                        title="Download"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                No documents uploaded yet
              </p>
            )}
            {request.documents && request.documents.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {request.documents.length}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{request.documents.filter((d: any) => d.status === 'approved').length}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Approved</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-yellow-600">{request.documents.filter((d: any) => d.status === 'pending').length}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Pending</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-600">{request.documents.filter((d: any) => d.status === 'rejected').length}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Rejected</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Internal Notes */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Internal Notes
            </h2>
            
            {/* Add note form */}
            <form onSubmit={handleAddNote} className="mb-4">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <textarea
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add an internal note..."
                    rows={2}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!newNote.trim() || isAddingNote}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed self-end"
                >
                  {isAddingNote ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </button>
              </div>
            </form>

            {/* Notes list */}
            <div className="space-y-4">
              {(() => {
                const parsedNotes = parseInternalNotes(request.internalNotes);
                return parsedNotes.length > 0 ? (
                  parsedNotes.map((note, idx) => (
                    <div key={idx} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 text-sm font-medium flex-shrink-0">
                        A
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            Admin
                          </span>
                          {note.timestamp && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(note.timestamp).toLocaleString()}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-gray-700 dark:text-gray-200">{note.content}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No internal notes yet
                  </p>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* User Info */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Submitted By
            </h2>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                {(request.user?.fullName || request.user?.firstName || 'U').charAt(0)}
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {request.user?.fullName || `${request.user?.firstName || ''} ${request.user?.lastName || ''}`.trim() || 'Unknown'}
                </p>
                <Link
                  to={`/users/${request.user?.id}`}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  View Profile
                </Link>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-gray-700 dark:text-gray-200">{request.user?.email}</span>
              </div>
              {(request.user?.phoneNumber || request.user?.phone) && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-700 dark:text-gray-200">{request.user?.phoneNumber || request.user?.phone}</span>
                </div>
              )}
            </div>
          </div>

          {/* Assignment */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Assignment
            </h2>
            {request.assignedOperator ? (
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-500/20 flex items-center justify-center text-green-600 font-medium">
                  {(request.assignedOperator.fullName || request.assignedOperator.firstName || 'O').charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {request.assignedOperator.fullName || `${request.assignedOperator.firstName || ''} ${request.assignedOperator.lastName || ''}`.trim()}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Operator</p>
                </div>
                <button
                  onClick={() => setShowAssignModal(true)}
                  className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  Change
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAssignModal(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
              >
                <UserPlus className="h-5 w-5" />
                Assign Operator
              </button>
            )}
          </div>

          {/* Timeline */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Timeline
            </h2>
            <div className="space-y-4">
              {request.statusHistory && request.statusHistory.length > 0 ? (
                [...request.statusHistory]
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .map((entry) => (
                    <div key={entry.id} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {STATUS_CONFIG[entry.fromStatus]?.label || entry.fromStatus} &rarr; {STATUS_CONFIG[entry.toStatus]?.label || entry.toStatus}
                        </p>
                        {(entry.notes || entry.reason) && (
                          <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">{entry.notes || entry.reason}</p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(entry.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
              ) : (
                <>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Created</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(request.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {request.updatedAt !== request.createdAt && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Last Updated</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(request.updatedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Assign Operator Modal */}
      {showAssignModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setShowAssignModal(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl z-50 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Assign Operator
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Select Operator
                </label>
                <select
                  defaultValue={request?.assignedOperator?.id || request?.assignedOperatorId || ''}
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAssignOperator(e.target.value);
                    }
                  }}
                  disabled={isAssigning}
                  className="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                >
                  <option value="" disabled>
                    -- Choose an operator --
                  </option>
                  {operators.map((operator) => (
                    <option key={operator.id} value={operator.id}>
                      {operator.fullName || `${operator.firstName || ''} ${operator.lastName || ''}`.trim()} — {operator.email}
                    </option>
                  ))}
                </select>
              </div>
              {isAssigning && (
                <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Assigning...
                </div>
              )}
              {operators.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No operators found. Please ensure users with the operator role exist.
                </p>
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowAssignModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </>
      )}

      {/* Request Documents Modal */}
      {showRequestDocsModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setShowRequestDocsModal(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl z-50 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Request Additional Documents
            </h3>
            <form onSubmit={handleRequestDocuments} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Document Categories <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {documentCategories.map((cat) => (
                    <label key={cat} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={requestDocsCategories.includes(cat)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setRequestDocsCategories([...requestDocsCategories, cat]);
                          } else {
                            setRequestDocsCategories(requestDocsCategories.filter((c) => c !== cat));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-200 capitalize">
                        {cat.replace(/_/g, ' ')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={requestDocsReason}
                  onChange={(e) => setRequestDocsReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Explain why additional documents are needed..."
                  required
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRequestDocsModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={requestDocsCategories.length === 0 || !requestDocsReason.trim() || isRequestingDocs}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isRequestingDocs && <Loader2 className="h-4 w-4 animate-spin" />}
                  Send Request
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default ServiceRequestDetail;
