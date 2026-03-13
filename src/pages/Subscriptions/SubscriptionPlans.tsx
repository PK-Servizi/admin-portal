/**
 * Subscription Plans Management Page
 * Admin CRUD for subscription plans
 */

import React, { useState } from 'react';
import {
  useGetAdminSubscriptionPlansQuery,
  useCreateSubscriptionPlanMutation,
  useUpdateSubscriptionPlanMutation,
  useDeleteSubscriptionPlanMutation,
  useCloneSubscriptionPlanMutation,
} from '@/services/api/subscriptions.api';
import type { SubscriptionPlan } from '@/types';
import { cn } from '@/lib/utils';
import {
  Plus,
  Edit,
  Trash2,
  Copy,
  X,
  Loader2,
  Search,
  RefreshCw,
  CreditCard,
  Check,
  XCircle,
} from 'lucide-react';

interface PlanFormData {
  name: string;
  code: string;
  description: string;
  price: number;
  interval: 'monthly' | 'yearly';
  features: string;
  isActive: boolean;
  serviceRequestsLimit: number;
  documentsLimit: number;
  appointmentsLimit: number;
  coursesLimit: number;
  stripePriceId: string;
}

const initialFormData: PlanFormData = {
  name: '',
  code: '',
  description: '',
  price: 0,
  interval: 'monthly',
  features: '',
  isActive: true,
  serviceRequestsLimit: 0,
  documentsLimit: 0,
  appointmentsLimit: 0,
  coursesLimit: 0,
  stripePriceId: '',
};

export const SubscriptionPlans: React.FC = () => {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PlanFormData>(initialFormData);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // API hooks
  const { data, isLoading, isFetching, refetch } = useGetAdminSubscriptionPlansQuery();
  const [createPlan, { isLoading: isCreating }] = useCreateSubscriptionPlanMutation();
  const [updatePlan, { isLoading: isUpdating }] = useUpdateSubscriptionPlanMutation();
  const [deletePlan, { isLoading: isDeleting }] = useDeleteSubscriptionPlanMutation();
  const [clonePlan] = useCloneSubscriptionPlanMutation();

  const plans = data?.data || [];
  const isSaving = isCreating || isUpdating;

  const filteredPlans = plans.filter(
    (plan) =>
      plan.name.toLowerCase().includes(search.toLowerCase()) ||
      plan.code?.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenCreate = () => {
    setFormData(initialFormData);
    setIsEditing(false);
    setEditingId(null);
    setShowModal(true);
  };

  const handleOpenEdit = (plan: SubscriptionPlan) => {
    setFormData({
      name: plan.name,
      code: plan.code || '',
      description: plan.description || '',
      price: plan.price,
      interval: plan.interval || 'monthly',
      features: (plan.features || []).join('\n'),
      isActive: plan.isActive,
      serviceRequestsLimit: plan.limits?.serviceRequests || 0,
      documentsLimit: plan.limits?.documents || 0,
      appointmentsLimit: plan.limits?.appointments || 0,
      coursesLimit: plan.limits?.courses || 0,
      stripePriceId: plan.stripePriceId || '',
    });
    setIsEditing(true);
    setEditingId(plan.id);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const planData = {
      name: formData.name,
      code: formData.code,
      description: formData.description || undefined,
      price: Number(formData.price),
      interval: formData.interval,
      features: formData.features.split('\n').filter((f) => f.trim()),
      isActive: formData.isActive,
      limits: {
        serviceRequests: Number(formData.serviceRequestsLimit) || undefined,
        documents: Number(formData.documentsLimit) || undefined,
        appointments: Number(formData.appointmentsLimit) || undefined,
        courses: Number(formData.coursesLimit) || undefined,
      },
      stripePriceId: formData.stripePriceId || undefined,
    };

    try {
      if (isEditing && editingId) {
        await updatePlan({ id: editingId, data: planData }).unwrap();
      } else {
        await createPlan(planData).unwrap();
      }
      setShowModal(false);
      setFormData(initialFormData);
    } catch (error) {
      console.error('Failed to save plan:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePlan(id).unwrap();
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete plan:', error);
    }
  };

  const handleClone = async (id: string) => {
    try {
      await clonePlan(id).unwrap();
    } catch (error) {
      console.error('Failed to clone plan:', error);
    }
  };

  const handleChange = (field: keyof PlanFormData, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Subscription Plans</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage subscription plans and pricing
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <RefreshCw className={cn('h-5 w-5', isFetching && 'animate-spin')} />
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Plan
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search plans..."
          className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPlans.map((plan) => (
          <div
            key={plan.id}
            className={cn(
              'bg-white dark:bg-gray-800 rounded-xl border p-6 relative',
              plan.isActive
                ? 'border-gray-200 dark:border-gray-700'
                : 'border-red-200 dark:border-red-800 opacity-75'
            )}
          >
            {plan.isPopular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
                Popular
              </div>
            )}

            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{plan.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{plan.code}</p>
              </div>
              <span
                className={cn(
                  'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
                  plan.isActive
                    ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                )}
              >
                {plan.isActive ? <Check className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                {plan.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="mb-4">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  €{plan.price}
                </span>
                <span className="text-gray-500 dark:text-gray-400 text-sm">
                  /{plan.interval || 'month'}
                </span>
              </div>
            </div>

            {plan.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{plan.description}</p>
            )}

            {plan.features && plan.features.length > 0 && (
              <ul className="space-y-2 mb-4">
                {plan.features.slice(0, 5).map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-200">{feature}</span>
                  </li>
                ))}
                {plan.features.length > 5 && (
                  <li className="text-sm text-gray-500 dark:text-gray-400">
                    +{plan.features.length - 5} more features
                  </li>
                )}
              </ul>
            )}

            {plan.limits && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-1">
                {plan.limits.serviceRequests && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {plan.limits.serviceRequests} service requests
                  </p>
                )}
                {plan.limits.documents && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {plan.limits.documents} documents
                  </p>
                )}
                {plan.limits.appointments && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {plan.limits.appointments} appointments
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => handleOpenEdit(plan)}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
              >
                <Edit className="h-4 w-4" />
                Edit
              </button>
              <button
                onClick={() => handleClone(plan.id)}
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title="Clone plan"
              >
                <Copy className="h-4 w-4" />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(plan.id)}
                className="flex items-center justify-center gap-1.5 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                title="Deactivate plan"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredPlans.length === 0 && (
        <div className="text-center py-12">
          <CreditCard className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">No plans found</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {search ? 'Try a different search term' : 'Create your first subscription plan'}
          </p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setShowModal(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-xl shadow-xl z-50 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isEditing ? 'Edit Plan' : 'Create New Plan'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => handleChange('code', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., basic, pro"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Price (€) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleChange('price', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Billing Interval
                  </label>
                  <select
                    value={formData.interval}
                    onChange={(e) => handleChange('interval', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Features (one per line)
                </label>
                <textarea
                  value={formData.features}
                  onChange={(e) => handleChange('features', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Usage Limits (0 = unlimited)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Service Requests</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.serviceRequestsLimit}
                      onChange={(e) => handleChange('serviceRequestsLimit', e.target.value)}
                      className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Documents</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.documentsLimit}
                      onChange={(e) => handleChange('documentsLimit', e.target.value)}
                      className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Appointments</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.appointmentsLimit}
                      onChange={(e) => handleChange('appointmentsLimit', e.target.value)}
                      className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Courses</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.coursesLimit}
                      onChange={(e) => handleChange('coursesLimit', e.target.value)}
                      className="w-full px-3 py-1.5 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Stripe Price ID
                </label>
                <input
                  type="text"
                  value={formData.stripePriceId}
                  onChange={(e) => handleChange('stripePriceId', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="price_..."
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => handleChange('isActive', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-200">
                  Active
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isEditing ? 'Save Changes' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setShowDeleteConfirm(null)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm bg-white dark:bg-gray-800 rounded-xl shadow-xl z-50 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Deactivate Plan?
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              This will deactivate the plan. Existing subscribers won&apos;t be affected,
              but new users won&apos;t be able to subscribe to it.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                disabled={isDeleting}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
                Deactivate
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SubscriptionPlans;
