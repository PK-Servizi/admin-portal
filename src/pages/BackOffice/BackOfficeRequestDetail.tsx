/**
 * Back Office Request Detail Page
 * Admin review screen for Back Office requests
 * Supports: view customer info, documents, approve, reject, request info
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useGetBackOfficeRequestDetailQuery,
  useStartBackOfficeReviewMutation,
  useRequestBackOfficeInfoMutation,
  useApproveBackOfficeRequestMutation,
  useRejectBackOfficeRequestMutation,
  useSendInvitationMutation,
} from '@/services/api/backoffice-admin.api';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  Loader2,
  CheckCircle,
  XCircle,
  MessageSquare,
  Send,
  FileText,
  User,
  Calendar,
  AlertTriangle,
  Info,
} from 'lucide-react';

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  submitted: 'bg-blue-100 text-blue-700',
  under_review: 'bg-purple-100 text-purple-700',
  more_information_required: 'bg-yellow-100 text-yellow-700',
  resubmitted: 'bg-blue-100 text-blue-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-500',
};

export const BackOfficeRequestDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [reason, setReason] = useState('');
  const [showReasonInput, setShowReasonInput] = useState<'reject' | 'info' | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const { data, isLoading, refetch } = useGetBackOfficeRequestDetailQuery(id!);
  const [startReview] = useStartBackOfficeReviewMutation();
  const [requestInfo] = useRequestBackOfficeInfoMutation();
  const [approve] = useApproveBackOfficeRequestMutation();
  const [reject] = useRejectBackOfficeRequestMutation();
  const [sendInvitation] = useSendInvitationMutation();

  const request = data?.data;
  const customerName = request?.formData?.customerName || 'N/A';
  const customerId = request?.formData?.backOfficeCustomerId || '';

  useEffect(() => {
    if (actionSuccess) {
      const t = setTimeout(() => setActionSuccess(''), 5000);
      return () => clearTimeout(t);
    }
  }, [actionSuccess]);

  const handleAction = async (action: string) => {
    setActionLoading(action);
    setActionError('');
    setActionSuccess('');
    try {
      let result;
      switch (action) {
        case 'start-review':
          result = await startReview(id!).unwrap();
          break;
        case 'request-info':
          result = await requestInfo({ id: id!, reason }).unwrap();
          setReason('');
          setShowReasonInput(null);
          break;
        case 'approve':
          result = await approve({ id: id!, notes: '' }).unwrap();
          break;
        case 'reject':
          result = await reject({ id: id!, reason }).unwrap();
          setReason('');
          setShowReasonInput(null);
          break;
        case 'send-invitation':
          result = await sendInvitation({
            recipientUserId: request!.userId,
            customerId,
            requestId: id!,
          }).unwrap();
          break;
      }
      setActionSuccess(result?.message || `${action} completato con successo`);
      refetch();
    } catch (err: any) {
      setActionError(err?.data?.message || `Azione fallita: ${action}`);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('it-IT', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Richiesta non trovata</p>
        <button onClick={() => navigate('/backoffice/requests')} className="mt-4 text-purple-600 hover:underline">
          Torna alla lista
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/backoffice/requests')} className="p-2 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Dettaglio Richiesta</h1>
            <span className={cn(
              'inline-flex px-3 py-1 rounded-full text-sm font-medium',
              STATUS_STYLES[request.status] || 'bg-gray-100 text-gray-700'
            )}>
              {request.status?.replace(/_/g, ' ')}
            </span>
          </div>
          <p className="text-gray-500 mt-1">Cliente: {customerName}</p>
        </div>
      </div>

      {/* Action messages */}
      {actionError && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg flex items-center gap-2">
          <XCircle className="h-5 w-5 flex-shrink-0" />
          {actionError}
        </div>
      )}
      {actionSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle className="h-5 w-5 flex-shrink-0" />
          {actionSuccess}
        </div>
      )}

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-gray-400" />
            Informazioni Cliente
          </h2>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Nome</dt>
              <dd className="text-sm font-medium text-gray-900">{customerName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Email</dt>
              <dd className="text-sm font-medium text-gray-900">{request.formData?.customerEmail || '-'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Codice Fiscale</dt>
              <dd className="text-sm font-medium text-gray-900">{request.formData?.customerFiscalCode || '-'}</dd>
            </div>
          </dl>
        </div>

        {/* Request Info */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Info className="h-5 w-5 text-gray-400" />
            Dettagli Richiesta
          </h2>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Servizio</dt>
              <dd className="text-sm font-medium text-gray-900">{request.service?.name || 'N/A'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Operatore BO</dt>
              <dd className="text-sm font-medium text-gray-900">{request.user?.fullName || request.user?.email || 'N/A'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-sm text-gray-500">Inviata il</dt>
              <dd className="text-sm font-medium text-gray-900">{formatDate(request.submittedAt || request.createdAt)}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Documents */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-gray-400" />
          Documenti
        </h2>
        {request.documents && request.documents.length > 0 ? (
          <div className="space-y-2">
            {request.documents.map((doc: any) => (
              <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-200 truncate">
                    {doc.originalFilename || doc.filename}
                  </span>
                  <span className={cn(
                    'inline-flex px-2 py-0.5 rounded text-xs font-medium',
                    doc.status === 'approved' ? 'bg-green-100 text-green-700' :
                    doc.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-yellow-100 text-yellow-700'
                  )}>
                    {doc.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">Nessun documento caricato</p>
        )}
      </div>

      {/* Status History */}
      {request.statusHistory && request.statusHistory.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-400" />
            Cronologia Stati
          </h2>
          <div className="space-y-3">
            {request.statusHistory.map((h: any) => (
              <div key={h.id} className="flex items-start gap-3 text-sm">
                <div className="w-2 h-2 mt-1.5 rounded-full bg-purple-400 flex-shrink-0" />
                <div>
                  <p className="text-gray-700">
                    <span className="font-medium">{h.fromStatus || '-'}</span>
                    {' → '}
                    <span className="font-medium">{h.toStatus}</span>
                  </p>
                  {h.notes && <p className="text-gray-500 text-xs mt-0.5">{h.notes}</p>}
                  <p className="text-gray-400 text-xs mt-0.5">{formatDate(h.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Notes */}
      {request.userNotes && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-gray-400" />
            Note Operatore
          </h2>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{request.userNotes}</p>
        </div>
      )}

      {/* Internal Notes */}
      {request.internalNotes && (
        <div className="bg-yellow-50 dark:bg-yellow-900/10 rounded-xl border border-yellow-200 dark:border-yellow-700 p-6">
          <h2 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2 flex items-center gap-2">
            <Info className="h-5 w-5" />
            Note Interne (Admin)
          </h2>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 whitespace-pre-wrap">{request.internalNotes}</p>
        </div>
      )}

      {/* Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Azioni</h2>

        {/* Start Review */}
        {request.status === 'submitted' && (
          <button
            onClick={() => handleAction('start-review')}
            disabled={actionLoading === 'start-review'}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {actionLoading === 'start-review' ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Inizia Revisione
          </button>
        )}

        {/* Review Actions */}
        {(request.status === 'under_review' || request.status === 'resubmitted') && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              {/* Approve */}
              <button
                onClick={() => handleAction('approve')}
                disabled={actionLoading === 'approve'}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {actionLoading === 'approve' ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                Approva
              </button>

              {/* Request Info */}
              <button
                onClick={() => setShowReasonInput(showReasonInput === 'info' ? null : 'info')}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
                Richiedi Info
              </button>

              {/* Reject */}
              <button
                onClick={() => setShowReasonInput(showReasonInput === 'reject' ? null : 'reject')}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <XCircle className="h-4 w-4" />
                Respingi
              </button>
            </div>

            {/* Reason/Notes Inputs */}
            {showReasonInput === 'info' && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-200">
                <label className="block text-sm font-medium text-yellow-800 mb-2">Motivo della richiesta informazioni</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-white border border-yellow-300 rounded-lg text-sm focus:ring-2 focus:ring-yellow-500"
                  placeholder="Spiega quali informazioni sono necessarie..."
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleAction('request-info')}
                    disabled={!reason || actionLoading === 'request-info'}
                    className="flex items-center gap-2 px-3 py-1.5 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 text-sm"
                  >
                    {actionLoading === 'request-info' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                    Invia Richiesta
                  </button>
                  <button onClick={() => setShowReasonInput(null)} className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800">
                    Annulla
                  </button>
                </div>
              </div>
            )}

            {showReasonInput === 'reject' && (
              <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200">
                <label className="block text-sm font-medium text-red-800 mb-2">Motivo del respingimento</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-white border border-red-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500"
                  placeholder="Spiega il motivo del respingimento..."
                />
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleAction('reject')}
                    disabled={!reason || actionLoading === 'reject'}
                    className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 text-sm"
                  >
                    {actionLoading === 'reject' ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
                    Respingi
                  </button>
                  <button onClick={() => setShowReasonInput(null)} className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800">
                    Annulla
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* After Approval: Send Invitation */}
        {request.status === 'approved' && (
          <div className="space-y-3">
            {!request.invitationSent ? (
              <button
                onClick={() => handleAction('send-invitation')}
                disabled={actionLoading === 'send-invitation'}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {actionLoading === 'send-invitation' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Concedi Accesso Fatture
              </button>
            ) : (
              <p className="text-sm text-green-600 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Accesso fatture già concesso
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BackOfficeRequestDetail;