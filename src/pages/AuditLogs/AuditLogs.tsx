/**
 * Audit Logs Page
 * View system audit logs and user activity
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetAuditLogsQuery, type AuditLog } from '@/services/api/admin.api';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Filter,
  Loader2,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  X,
  User,
  FileText,
  Settings,
  Shield,
  CreditCard,
  LogIn,
  LogOut,
  Edit,
  Trash2,
  Plus,
  Key,
  Clock,
  History,
} from 'lucide-react';

const ACTION_TYPES = [
  { value: '', label: 'All Actions' },
  { value: 'create', label: 'Create' },
  { value: 'update', label: 'Update' },
  { value: 'delete', label: 'Delete' },
  { value: 'login', label: 'Login' },
  { value: 'logout', label: 'Logout' },
  { value: 'view', label: 'View' },
  { value: 'export', label: 'Export' },
];

const RESOURCES = [
  { value: '', label: 'All Resources' },
  { value: 'user', label: 'Users' },
  { value: 'service_request', label: 'Service Requests' },
  { value: 'subscription', label: 'Subscriptions' },
  { value: 'payment', label: 'Payments' },
  { value: 'document', label: 'Documents' },
  { value: 'role', label: 'Roles' },
  { value: 'settings', label: 'Settings' },
];

export const AuditLogs: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionType, setActionType] = useState('');
  const [resource, setResource] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // API hooks - map page/limit to skip/take
  const { data, isLoading, isFetching, refetch } = useGetAuditLogsQuery({
    skip: (page - 1) * limit,
    take: limit,
    action: actionType || undefined,
    resource: resource || undefined,
    startDate: dateFrom || undefined,
    endDate: dateTo || undefined,
  });

  const logs: AuditLog[] = data?.data || [];
  const totalPages = data?.pagination?.pages || 1;
  const totalItems = data?.pagination?.total || 0;

  // Get action icon
  const getActionIcon = (action: string) => {
    switch (action?.toLowerCase()) {
      case 'create':
        return <Plus className="h-4 w-4 text-emerald-500" />;
      case 'update':
        return <Edit className="h-4 w-4 text-indigo-500" />;
      case 'delete':
        return <Trash2 className="h-4 w-4 text-rose-500" />;
      case 'login':
        return <LogIn className="h-4 w-4 text-violet-500" />;
      case 'logout':
        return <LogOut className="h-4 w-4 text-slate-500" />;
      case 'view':
        return <Eye className="h-4 w-4 text-slate-500" />;
      case 'export':
        return <Download className="h-4 w-4 text-amber-500" />;
      default:
        return <FileText className="h-4 w-4 text-slate-500" />;
    }
  };

  // Get resource icon
  const getResourceIcon = (resource: string) => {
    switch (resource?.toLowerCase()) {
      case 'user':
        return <User className="h-4 w-4" />;
      case 'service_request':
        return <FileText className="h-4 w-4" />;
      case 'subscription':
      case 'payment':
        return <CreditCard className="h-4 w-4" />;
      case 'role':
      case 'permission':
        return <Shield className="h-4 w-4" />;
      case 'settings':
        return <Settings className="h-4 w-4" />;
      case 'auth':
        return <Key className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // Get action badge
  const getActionBadge = (action: string) => {
    const classes = {
      create: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
      update: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400',
      delete: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400',
      login: 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400',
      logout: 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400',
      view: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
      export: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
    };

    return (
      <span
        className={cn(
          'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize',
          classes[action?.toLowerCase() as keyof typeof classes] || classes.view
        )}
      >
        {getActionIcon(action)}
        {action}
      </span>
    );
  };

  // Export logs
  const handleExport = () => {
    const csvContent = [
      ['Timestamp', 'User', 'Action', 'Resource', 'Resource ID', 'IP Address', 'Details'].join(','),
      ...logs.map((log) =>
        [
          format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss'),
          log.userEmail || log.userId,
          log.action,
          log.resource,
          log.resourceId,
          log.ipAddress,
          JSON.stringify(log.details || {}).replace(/,/g, ';'),
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          </div>
          <p className="text-slate-500 dark:text-slate-400">Loading audit logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-up">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Audit Logs
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Track all system activities and changes
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="icon"
            className="border-slate-200 dark:border-slate-700"
            title="Refresh"
          >
            <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
          </Button>
          <Button
            onClick={handleExport}
            variant="outline"
            className="border-slate-200 dark:border-slate-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm shadow-soft animate-fade-up" style={{ animationDelay: '50ms' }}>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search by user, resource ID, or details..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                className="pl-10 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={actionType}
                onChange={(e) => {
                  setActionType(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
              >
                {ACTION_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>

              <select
                value={resource}
                onChange={(e) => {
                  setResource(e.target.value);
                  setPage(1);
                }}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
              >
                {RESOURCES.map((res) => (
                  <option key={res.value} value={res.value}>
                    {res.label}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors text-sm',
                  showFilters
                    ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200 dark:border-indigo-500/30 text-indigo-600 dark:text-indigo-400'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                )}
              >
                <Filter className="h-4 w-4" />
                Date Range
              </button>
            </div>
          </div>

          {/* Date Range Filters */}
          {showFilters && (
            <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2">
                <label className="text-sm text-slate-500 dark:text-slate-400">From:</label>
                <input
                  type="datetime-local"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    setPage(1);
                  }}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm text-slate-500 dark:text-slate-400">To:</label>
                <input
                  type="datetime-local"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value);
                    setPage(1);
                }}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm"
              />
            </div>
            {(dateFrom || dateTo) && (
              <button
                onClick={() => {
                  setDateFrom('');
                  setDateTo('');
                }}
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Clear dates
              </button>
            )}
          </div>
        )}
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card className="border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm shadow-soft overflow-hidden animate-fade-up" style={{ animationDelay: '100ms' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  User
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Action
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Resource
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  IP Address
                </th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center mx-auto mb-4">
                      <History className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400">No audit logs found</p>
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <Clock className="h-4 w-4" />
                        {format(new Date(log.createdAt), 'MMM dd, HH:mm:ss')}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {log.userEmail ? (
                        <Link
                          to={`/users/${log.userId}`}
                          className="flex items-center gap-2 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        >
                          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full flex items-center justify-center text-xs font-medium text-white">
                            {log.userEmail[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">
                              {log.userEmail}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                              {log.userId.slice(0, 8)}...
                            </p>
                          </div>
                        </Link>
                      ) : (
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          System
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">{getActionBadge(log.action)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">{getResourceIcon(log.resource)}</span>
                        <div>
                          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">
                            {log.resource?.replace(/_/g, ' ')}
                          </p>
                          {log.resourceId && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                              {log.resourceId.slice(0, 8)}...
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-slate-500 dark:text-slate-400 font-mono">
                        {log.ipAddress || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalItems)} of{' '}
              {totalItems} logs
            </p>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                variant="outline"
                size="icon"
                className="border-slate-200 dark:border-slate-700"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-slate-700 dark:text-slate-300">
                Page {page} of {totalPages}
              </span>
              <Button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                variant="outline"
                size="icon"
                className="border-slate-200 dark:border-slate-700"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Log Detail Modal */}
      {selectedLog && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setSelectedLog(null)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl shadow-2xl z-50 max-h-[80vh] overflow-hidden border border-slate-200 dark:border-slate-700">
            {/* Gradient accent line */}
            <div className="h-1 w-full bg-gradient-to-r from-indigo-500 to-violet-500" />
            
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-4rem)]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Log Details</h3>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Timestamp</p>
                    <p className="text-sm text-slate-900 dark:text-white">
                      {format(new Date(selectedLog.createdAt), 'PPpp')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Action</p>
                    {getActionBadge(selectedLog.action)}
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Resource</p>
                    <p className="text-sm text-slate-900 dark:text-white capitalize">
                      {selectedLog.resource?.replace(/_/g, ' ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Resource ID</p>
                    <p className="text-sm text-slate-900 dark:text-white font-mono">
                      {selectedLog.resourceId || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">IP Address</p>
                    <p className="text-sm text-slate-900 dark:text-white font-mono">
                      {selectedLog.ipAddress || '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">User Agent</p>
                    <p className="text-sm text-slate-900 dark:text-white truncate" title={selectedLog.userAgent}>
                      {selectedLog.userAgent || '-'}
                    </p>
                  </div>
                </div>

                {selectedLog.userEmail && (
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Performed By</p>
                    <Link
                      to={`/users/${selectedLog.userId}`}
                      className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-full flex items-center justify-center text-sm font-medium text-white">
                        {selectedLog.userEmail[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {selectedLog.userEmail}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-mono">
                          ID: {selectedLog.userId.slice(0, 8)}...
                        </p>
                      </div>
                    </Link>
                  </div>
                )}

                {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Details</p>
                    <pre className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs text-slate-700 dark:text-slate-300 overflow-x-auto">
                      {JSON.stringify(selectedLog.details, null, 2)}
                    </pre>
                  </div>
                )}

                {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Details Fields</p>
                    <div className="space-y-2">
                      {Object.entries(selectedLog.details).map(([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm"
                        >
                          <span className="text-slate-600 dark:text-slate-400">{key}</span>
                          <span className="text-slate-900 dark:text-white font-mono text-xs">
                            {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
                <Button
                  onClick={() => setSelectedLog(null)}
                  variant="outline"
                  className="border-slate-200 dark:border-slate-700"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AuditLogs;
