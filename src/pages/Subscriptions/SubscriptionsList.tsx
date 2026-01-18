/**
 * Subscriptions Admin Page
 * Manage subscription plans and user subscriptions
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useGetAllSubscriptionsQuery,
  useGetSubscriptionPlansQuery,
  useAdminCancelSubscriptionMutation,
} from '@/services/api/subscriptions.api';
import type { Subscription, SubscriptionPlan } from '@/types';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  CreditCard,
  Search,
  Loader2,
  RefreshCw,
  Crown,
  ChevronLeft,
  ChevronRight,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  X,
  Eye,
  AlertTriangle,
  Sparkles,
  Zap,
  Shield,
} from 'lucide-react';

const SUBSCRIPTION_STATUSES = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'expired', label: 'Expired' },
  { value: 'past_due', label: 'Past Due' },
  { value: 'trialing', label: 'Trialing' },
];

export const SubscriptionsList: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  // API hooks
  const { data, isLoading, isFetching, refetch } = useGetAllSubscriptionsQuery({
    page,
    limit,
    search: searchTerm || undefined,
    status: status || undefined,
    planId: selectedPlan || undefined,
  });
  const { data: plansData } = useGetSubscriptionPlansQuery({});
  const [cancelSubscription, { isLoading: isCancelling }] = useAdminCancelSubscriptionMutation();

  const subscriptions = data?.data || [];
  const totalPages = data?.pagination?.pages || 1;
  const totalItems = data?.pagination?.total || 0;
  const plans = plansData?.data || [];

  // Stats
  const stats = {
    activeSubscriptions: subscriptions.filter((s: Subscription) => s.status === 'active').length,
    totalMRR: subscriptions
      .filter((s: Subscription) => s.status === 'active')
      .reduce((acc: number, s: Subscription) => acc + (s.plan?.price || 0), 0),
    churnedThisMonth: subscriptions.filter((s: Subscription) => {
      const cancelledAt = s.cancelledAt ? new Date(s.cancelledAt) : null;
      if (!cancelledAt) return false;
      const now = new Date();
      return cancelledAt.getMonth() === now.getMonth() && cancelledAt.getFullYear() === now.getFullYear();
    }).length,
    trialConversions: 0,
  };

  // Format currency
  const formatCurrency = (amount: number, currency = 'EUR') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount / 100);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400">
            <CheckCircle className="h-3 w-3" />
            Active
          </span>
        );
      case 'trialing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
            <Sparkles className="h-3 w-3" />
            Trial
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-400">
            <XCircle className="h-3 w-3" />
            Cancelled
          </span>
        );
      case 'past_due':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400">
            <AlertTriangle className="h-3 w-3" />
            Past Due
          </span>
        );
      case 'expired':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400">
            <Clock className="h-3 w-3" />
            Expired
          </span>
        );
      default:
        return null;
    }
  };

  // Get plan icon
  const getPlanIcon = (planName: string) => {
    const name = planName?.toLowerCase();
    if (name?.includes('premium') || name?.includes('pro')) {
      return <Crown className="h-4 w-4 text-yellow-500" />;
    }
    if (name?.includes('business') || name?.includes('enterprise')) {
      return <Shield className="h-4 w-4 text-purple-500" />;
    }
    return <Zap className="h-4 w-4 text-blue-500" />;
  };

  // Handle cancel
  const openCancelModal = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setCancelReason('');
    setShowCancelModal(true);
  };

  const handleCancel = async () => {
    if (!selectedSubscription) return;

    try {
      await cancelSubscription({
        id: selectedSubscription.id,
        reason: cancelReason,
      }).unwrap();
      setShowCancelModal(false);
      setSelectedSubscription(null);
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
    }
  };

  // Export
  const handleExport = () => {
    const csvContent = [
      ['ID', 'User', 'Plan', 'Status', 'Start Date', 'End Date', 'Amount'].join(','),
      ...subscriptions.map((s: Subscription & { user?: { firstName?: string; lastName?: string } }) =>
        [
          s.id,
          `${s.user?.firstName} ${s.user?.lastName}`,
          s.plan?.name,
          s.status,
          format(new Date(s.startDate || s.createdAt), 'yyyy-MM-dd'),
          s.endDate ? format(new Date(s.endDate), 'yyyy-MM-dd') : 'N/A',
          formatCurrency(s.plan?.price || 0),
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `subscriptions-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Subscriptions</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage user subscriptions and plans
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
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-500/20 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.activeSubscriptions}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
              <CreditCard className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Monthly Revenue</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(stats.totalMRR)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-500/20 rounded-lg">
              <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Churned This Month</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {stats.churnedThisMonth}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-500/20 rounded-lg">
              <Crown className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Plans Available</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{plans.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by user name or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filters */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {SUBSCRIPTION_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          <select
            value={selectedPlan}
            onChange={(e) => {
              setSelectedPlan(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Plans</option>
            {plans.map((plan: SubscriptionPlan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Plan
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Started
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Renews/Ends
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <Crown className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400">No subscriptions found</p>
                  </td>
                </tr>
              ) : (
                subscriptions.map((subscription: Subscription & { user?: { firstName?: string; lastName?: string; email?: string } }) => (
                  <tr
                    key={subscription.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <Link
                        to={`/users/${subscription.userId}`}
                        className="flex items-center gap-3 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                          {subscription.user?.firstName?.[0]}
                          {subscription.user?.lastName?.[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {subscription.user?.firstName} {subscription.user?.lastName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {subscription.user?.email}
                          </p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {getPlanIcon(subscription.plan?.name || '')}
                        <span className="font-medium text-gray-900 dark:text-white">
                          {subscription.plan?.name || 'Unknown Plan'}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">{getStatusBadge(subscription.status)}</td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {format(new Date(subscription.startDate || subscription.createdAt), 'MMM dd, yyyy')}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {subscription.endDate
                          ? format(new Date(subscription.endDate), 'MMM dd, yyyy')
                          : 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(subscription.plan?.price || 0)}
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          /{subscription.plan?.interval || 'mo'}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedSubscription(subscription)}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {subscription.status === 'active' && (
                          <button
                            onClick={() => openCancelModal(subscription)}
                            className="p-2 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Cancel"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, totalItems)} of{' '}
              {totalItems} subscriptions
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
      </div>

      {/* Subscription Detail Modal */}
      {selectedSubscription && !showCancelModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setSelectedSubscription(null)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white dark:bg-gray-800 rounded-xl shadow-xl z-50 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Subscription Details
              </h3>
              <button
                onClick={() => setSelectedSubscription(null)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getPlanIcon(selectedSubscription.plan?.name || '')}
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedSubscription.plan?.name}
                  </span>
                </div>
                {getStatusBadge(selectedSubscription.status)}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">User</p>
                  <Link
                    to={`/users/${selectedSubscription.userId}`}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    User #{selectedSubscription.userId?.slice(0, 8)}
                  </Link>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Amount</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {formatCurrency(selectedSubscription.plan?.price || 0)}/
                    {selectedSubscription.plan?.interval || 'month'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Start Date</p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {format(
                      new Date(selectedSubscription.startDate || selectedSubscription.createdAt),
                      'PPP'
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {selectedSubscription.status === 'cancelled' ? 'Ends' : 'Renews'}
                  </p>
                  <p className="text-sm text-gray-900 dark:text-white">
                    {selectedSubscription.endDate
                      ? format(
                          new Date(selectedSubscription.endDate),
                          'PPP'
                        )
                      : 'N/A'}
                  </p>
                </div>
              </div>

              {selectedSubscription.plan?.features && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Plan Features</p>
                  <ul className="space-y-2">
                    {selectedSubscription.plan.features.map((feature: string, index: number) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                      >
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-gray-200 dark:border-gray-700">
              {selectedSubscription.status === 'active' && (
                <button
                  onClick={() => openCancelModal(selectedSubscription)}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                >
                  <XCircle className="h-4 w-4" />
                  Cancel Subscription
                </button>
              )}
              <button
                onClick={() => setSelectedSubscription(null)}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </>
      )}

      {/* Cancel Modal */}
      {showCancelModal && selectedSubscription && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setShowCancelModal(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-xl z-50 p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="p-2 bg-red-100 dark:bg-red-500/20 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Cancel Subscription
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Are you sure you want to cancel this subscription? The user will lose access at
                  the end of their current billing period.
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Cancellation Reason (optional)
              </label>
              <textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-red-500 resize-none"
                placeholder="Reason for cancellation..."
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancel}
                disabled={isCancelling}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isCancelling && <Loader2 className="h-4 w-4 animate-spin" />}
                Cancel Subscription
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SubscriptionsList;
