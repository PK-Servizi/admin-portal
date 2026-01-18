/**
 * Documents Review Queue
 * Admin interface for reviewing and approving/rejecting user documents
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useGetPendingDocumentsQuery,
  useApproveDocumentMutation,
  useRejectDocumentMutation,
  Document,
} from '@/services/api/documents-admin.api';
import { cn } from '@/lib/utils';
import {
  FileText,
  CheckCircle,
  XCircle,
  Eye,
  Download,
  Search,
  Loader2,
  RefreshCw,
  FilePlus,
  Clock,
  User,
  Calendar,
  ChevronLeft,
  ChevronRight,
  X,
  AlertTriangle,
} from 'lucide-react';
import { format } from 'date-fns';

const DOCUMENT_TYPES = [
  { value: '', label: 'All Types' },
  { value: 'identity', label: 'Identity Document' },
  { value: 'proof_of_address', label: 'Proof of Address' },
  { value: 'tax_document', label: 'Tax Document' },
  { value: 'contract', label: 'Contract' },
  { value: 'other', label: 'Other' },
];

export const DocumentsReview: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [documentToReject, setDocumentToReject] = useState<string | null>(null);

  // API hooks
  const { data, isLoading, isFetching, refetch } = useGetPendingDocumentsQuery({
    page,
    limit,
    search: searchTerm || undefined,
    category: documentType || undefined,
  });
  const [approveDocument, { isLoading: isApproving }] = useApproveDocumentMutation();
  const [rejectDocument, { isLoading: isRejecting }] = useRejectDocumentMutation();

  const documents = data?.data || [];
  const totalPages = Math.ceil((data?.data?.length || 0) / limit) || 1;
  const totalItems = data?.data?.length || 0;

  // Handle approve
  const handleApprove = async (documentId: string) => {
    try {
      await approveDocument({ id: documentId }).unwrap();
    } catch (error) {
      console.error('Failed to approve document:', error);
    }
  };

  // Handle reject
  const openRejectModal = (documentId: string) => {
    setDocumentToReject(documentId);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleReject = async () => {
    if (!documentToReject) return;
    
    try {
      await rejectDocument({
        id: documentToReject,
        data: { reason: rejectReason },
      }).unwrap();
      setShowRejectModal(false);
      setDocumentToReject(null);
      setRejectReason('');
    } catch (error) {
      console.error('Failed to reject document:', error);
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400">
            <Clock className="h-3 w-3" />
            Pending Review
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400">
            <CheckCircle className="h-3 w-3" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400">
            <XCircle className="h-3 w-3" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Document Review</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Review and approve pending documents ({totalItems} pending)
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by user name or document..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Document Type Filter */}
          <select
            value={documentType}
            onChange={(e) => {
              setDocumentType(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {DOCUMENT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Documents Grid */}
      {documents.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
          <FilePlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No pending documents
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            All documents have been reviewed.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc: Document) => (
            <div
              key={doc.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-shadow"
            >
              {/* Document Preview */}
              <div className="relative aspect-video bg-gray-100 dark:bg-gray-900 rounded-lg mb-4 overflow-hidden">
                {doc.mimeType?.startsWith('image/') ? (
                  <img
                    src={doc.fileUrl}
                    alt={doc.fileName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <FileText className="h-16 w-16 text-gray-400" />
                  </div>
                )}
                <button
                  onClick={() => setSelectedDocument(doc)}
                  className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 flex items-center justify-center gap-2 text-white transition-opacity"
                >
                  <Eye className="h-5 w-5" />
                  View
                </button>
              </div>

              {/* Document Info */}
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <h4 className="font-medium text-gray-900 dark:text-white truncate">
                    {doc.fileName || 'Document'}
                  </h4>
                  {getStatusBadge(doc.status)}
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                  {doc.category?.replace(/_/g, ' ')}
                </p>

                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <User className="h-3 w-3" />
                  <Link
                    to={`/users/${doc.userId}`}
                    className="hover:text-blue-500 transition-colors"
                  >
                    {doc.user?.firstName} {doc.user?.lastName}
                  </Link>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(doc.uploadedAt), 'MMM dd, yyyy HH:mm')}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => handleApprove(doc.id)}
                  disabled={isApproving}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve
                </button>
                <button
                  onClick={() => openRejectModal(doc.id)}
                  disabled={isRejecting}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </button>
                <a
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Page {page} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      {selectedDocument && (
        <>
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={() => setSelectedDocument(null)}
          />
          <div className="fixed inset-4 md:inset-12 bg-white dark:bg-gray-800 rounded-xl shadow-2xl z-50 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {selectedDocument.fileName || 'Document'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                  {selectedDocument.category?.replace(/_/g, ' ')}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={selectedDocument.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-3 py-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Download
                </a>
                <button
                  onClick={() => setSelectedDocument(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4">
              {selectedDocument.mimeType?.startsWith('image/') ? (
                <img
                  src={selectedDocument.fileUrl}
                  alt={selectedDocument.fileName}
                  className="max-w-full max-h-full mx-auto rounded-lg"
                />
              ) : selectedDocument.mimeType === 'application/pdf' ? (
                <iframe
                  src={selectedDocument.fileUrl}
                  className="w-full h-full rounded-lg"
                  title={selectedDocument.fileName}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <FileText className="h-24 w-24 text-gray-400 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Preview not available for this file type
                  </p>
                  <a
                    href={selectedDocument.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Download to View
                  </a>
                </div>
              )}
            </div>
            {selectedDocument.status === 'pending' && (
              <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => openRejectModal(selectedDocument.id)}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </button>
                <button
                  onClick={() => {
                    handleApprove(selectedDocument.id);
                    setSelectedDocument(null);
                  }}
                  disabled={isApproving}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* Reject Reason Modal */}
      {showRejectModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60]"
            onClick={() => setShowRejectModal(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl z-[60] p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-500/20 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Reject Document
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Please provide a reason for rejection. This will be sent to the user.
                </p>
              </div>
            </div>

            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 resize-none"
              placeholder="Reason for rejection..."
            />

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={!rejectReason.trim() || isRejecting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isRejecting && <Loader2 className="h-4 w-4 animate-spin" />}
                Reject Document
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DocumentsReview;
