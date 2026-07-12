/**
 * Create Invoice Page
 * Manual invoice creation for back office users
 */

import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useCreateInvoiceMutation,
  useSendInvoiceMutation,
  useGetBackOfficeUserQuery,
  useGetBackOfficeUsersQuery,
} from '@/services/api/backoffice-admin.api';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  Save,
  Send,
  Loader2,
  CreditCard,
  Plus,
  Trash2,
  AlertCircle,
} from 'lucide-react';

interface LineItem {
  description: string;
  amount: string;
  quantity: string;
}

export const CreateInvoice: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const [selectedUserId, setSelectedUserId] = useState(userId || '');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: '', amount: '', quantity: '1' },
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sendAfterCreate, setSendAfterCreate] = useState(false);

  // API hooks
  const { data: boUsersData } = useGetBackOfficeUsersQuery(
    { take: 100 },
    { skip: Boolean(userId) }
  );
  const { data: userData } = useGetBackOfficeUserQuery(selectedUserId, {
    skip: !selectedUserId,
  });

  const [createInvoice, { isLoading: isCreating }] = useCreateInvoiceMutation();
  const [sendInvoice, { isLoading: isSending }] = useSendInvoiceMutation();

  const boUsers = boUsersData?.data || [];
  const user = userData?.data;
  const isSubmitting = isCreating || isSending;

  const totalAmount = lineItems.reduce((sum, item) => {
    const amount = parseFloat(item.amount) || 0;
    const qty = parseInt(item.quantity) || 1;
    return sum + amount * qty;
  }, 0);

  const addLineItem = () => {
    setLineItems((prev) => [...prev, { description: '', amount: '', quantity: '1' }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length === 1) return;
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  const updateLineItem = (index: number, field: keyof LineItem, value: string) => {
    setLineItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
    if (errors[`lineItem_${index}`]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[`lineItem_${index}`];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedUserId) {
      newErrors.userId = 'Back office user is required';
    }

    let hasValidItem = false;
    lineItems.forEach((item, index) => {
      if (item.description.trim() && item.amount.trim()) {
        hasValidItem = true;
        const amount = parseFloat(item.amount);
        if (isNaN(amount) || amount <= 0) {
          newErrors[`lineItem_${index}`] = 'Amount must be greater than 0';
        }
      } else if (item.description.trim() || item.amount.trim()) {
        newErrors[`lineItem_${index}`] = 'Both description and amount are required';
      }
    });

    if (!hasValidItem) {
      newErrors.lineItems = 'At least one line item with description and amount is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const validItems = lineItems
        .filter((item) => item.description.trim() && item.amount.trim())
        .map((item) => ({
          description: item.description.trim(),
          amount: parseFloat(item.amount),
          quantity: parseInt(item.quantity) || 1,
        }));

      const result = await createInvoice({
        backOfficeUserId: selectedUserId,
        notes: notes.trim() || description.trim() || undefined,
        lineItems: validItems,
      }).unwrap();

      if (sendAfterCreate && result.data?.id) {
        await sendInvoice(result.data.id).unwrap();
      }

      if (userId) {
        navigate(`/backoffice/${userId}`);
      } else {
        navigate('/backoffice');
      }
    } catch (error: unknown) {
      console.error('Failed to create invoice:', error);
      const apiError = error as { data?: { message?: string } };
      if (apiError.data?.message) {
        setErrors({ submit: apiError.data.message });
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-orange-500" />
            Create Invoice
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {user
              ? `For ${user.fullName || user.email}`
              : 'Create a manual invoice for a back office user'}
          </p>
        </div>
      </div>

      {errors.submit && (
        <div className="flex items-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{errors.submit}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
          {/* BO User Selection (if not pre-selected) */}
          {!userId && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Back Office User <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className={cn(
                  'w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent',
                  errors.userId ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                )}
              >
                <option value="">Select a back office user</option>
                {boUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName || u.email}
                  </option>
                ))}
              </select>
              {errors.userId && (
                <p className="mt-1 text-sm text-red-500">{errors.userId}</p>
              )}
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Invoice Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Monthly service fees - January 2025"
            />
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                Line Items <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={addLineItem}
                className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700"
              >
                <Plus className="h-4 w-4" />
                Add Item
              </button>
            </div>
            {errors.lineItems && (
              <p className="mb-2 text-sm text-red-500">{errors.lineItems}</p>
            )}
            <div className="space-y-3">
              {lineItems.map((item, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                      placeholder="Description"
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div className="w-20">
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(index, 'quantity', e.target.value)}
                      placeholder="Qty"
                      min="1"
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                  <div className="w-28">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">€</span>
                      <input
                        type="number"
                        value={item.amount}
                        onChange={(e) => updateLineItem(index, 'amount', e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        className="w-full pl-7 pr-3 py-2 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLineItem(index)}
                    disabled={lineItems.length === 1}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  {errors[`lineItem_${index}`] && (
                    <p className="text-xs text-red-500 mt-1">{errors[`lineItem_${index}`]}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex justify-end mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  €{totalAmount.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Internal Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Internal notes (not visible to the user)"
            />
          </div>

          {/* Send after create */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={sendAfterCreate}
              onChange={(e) => setSendAfterCreate(e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-200">
              Send invoice immediately after creation (generates Stripe checkout link)
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : sendAfterCreate ? (
              <Send className="h-4 w-4" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {sendAfterCreate ? 'Create & Send Invoice' : 'Create Invoice'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateInvoice;
