/**
 * FAQ Editor Component
 * Manage FAQs for a specific service
 */

import React, { useState, useCallback } from 'react';
import {
  useGetFAQsByServiceQuery,
  useCreateFAQMutation,
  useUpdateFAQMutation,
  useDeleteFAQMutation,
  type FAQ,
  type CreateFAQData,
  type UpdateFAQData,
} from '@/services/api/faqs.api';
import { cn } from '@/lib/utils';
import {
  X,
  Loader2,
  Plus,
  Save,
  HelpCircle,
  Trash2,
  Edit2,
  ChevronUp,
  ChevronDown,
  AlertCircle,
  GripVertical,
} from 'lucide-react';

interface FAQEditorProps {
  serviceId: string;
  serviceName: string;
  onClose: () => void;
}

interface FAQFormData {
  id?: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  isActive: boolean;
}

const INITIAL_FORM: FAQFormData = {
  question: '',
  answer: '',
  category: 'general',
  order: 0,
  isActive: true,
};

const FAQ_CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'pricing', label: 'Pricing' },
  { value: 'process', label: 'Process' },
  { value: 'documents', label: 'Documents' },
  { value: 'timeline', label: 'Timeline' },
  { value: 'other', label: 'Other' },
];

export const FAQEditor: React.FC<FAQEditorProps> = ({
  serviceId,
  serviceName,
  onClose,
}) => {
  const [editingFaq, setEditingFaq] = useState<FAQFormData | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<FAQFormData>(INITIAL_FORM);
  const [formErrors, setFormErrors] = useState<string[]>([]);

  // API hooks
  const { data: faqsResponse, isLoading, refetch } = useGetFAQsByServiceQuery(serviceId);
  const [createFAQ, { isLoading: isCreatingFAQ }] = useCreateFAQMutation();
  const [updateFAQ, { isLoading: isUpdatingFAQ }] = useUpdateFAQMutation();
  const [deleteFAQ, { isLoading: isDeletingFAQ }] = useDeleteFAQMutation();

  const faqs = faqsResponse?.data || [];
  const isSaving = isCreatingFAQ || isUpdatingFAQ;

  // Validate form
  const validateForm = useCallback((): boolean => {
    const errors: string[] = [];
    
    if (!formData.question.trim()) {
      errors.push('Question is required');
    }
    if (!formData.answer.trim()) {
      errors.push('Answer is required');
    }
    if (formData.question.length > 500) {
      errors.push('Question must be less than 500 characters');
    }

    setFormErrors(errors);
    return errors.length === 0;
  }, [formData]);

  // Handle form field change
  const handleFieldChange = (field: keyof FAQFormData, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setFormErrors([]);
  };

  // Start creating new FAQ
  const handleStartCreate = () => {
    setIsCreating(true);
    setEditingFaq(null);
    setFormData({
      ...INITIAL_FORM,
      order: faqs.length,
    });
    setFormErrors([]);
  };

  // Start editing existing FAQ
  const handleStartEdit = (faq: FAQ) => {
    setIsCreating(false);
    setEditingFaq({
      id: faq.id,
      question: faq.question,
      answer: faq.answer,
      category: faq.category || 'general',
      order: faq.order,
      isActive: faq.isActive,
    });
    setFormData({
      id: faq.id,
      question: faq.question,
      answer: faq.answer,
      category: faq.category || 'general',
      order: faq.order,
      isActive: faq.isActive,
    });
    setFormErrors([]);
  };

  // Cancel edit/create
  const handleCancel = () => {
    setIsCreating(false);
    setEditingFaq(null);
    setFormData(INITIAL_FORM);
    setFormErrors([]);
  };

  // Save FAQ (create or update)
  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      if (editingFaq?.id) {
        // Update existing
        const updateData: UpdateFAQData = {
          question: formData.question.trim(),
          answer: formData.answer.trim(),
          category: formData.category,
          order: formData.order,
          isActive: formData.isActive,
        };
        await updateFAQ({ id: editingFaq.id, data: updateData }).unwrap();
      } else {
        // Create new
        const createData: CreateFAQData = {
          serviceId,
          question: formData.question.trim(),
          answer: formData.answer.trim(),
          category: formData.category,
          order: formData.order,
          isActive: formData.isActive,
        };
        await createFAQ(createData).unwrap();
      }
      
      handleCancel();
      refetch();
    } catch (error) {
      console.error('Failed to save FAQ:', error);
      setFormErrors(['Failed to save FAQ. Please try again.']);
    }
  };

  // Delete FAQ
  const handleDelete = async (faqId: string) => {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) return;

    try {
      await deleteFAQ(faqId).unwrap();
      refetch();
    } catch (error) {
      console.error('Failed to delete FAQ:', error);
    }
  };

  // Move FAQ order
  const handleMoveOrder = async (faq: FAQ, direction: 'up' | 'down') => {
    const newOrder = direction === 'up' ? faq.order - 1 : faq.order + 1;

    if (newOrder < 0 || newOrder >= faqs.length) return;

    try {
      await updateFAQ({ 
        id: faq.id, 
        data: { order: newOrder } 
      }).unwrap();
      refetch();
    } catch (error) {
      console.error('Failed to reorder FAQ:', error);
    }
  };

  const isFormOpen = isCreating || editingFaq !== null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full mx-4 h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-500/20 rounded-lg">
              <HelpCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                FAQ Management
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage frequently asked questions for <span className="font-medium">{serviceName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Add Button */}
          {!isFormOpen && (
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={handleStartCreate}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add New FAQ
              </button>
            </div>
          )}

          {/* Form */}
          {isFormOpen && (
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <h3 className="font-medium text-gray-900 dark:text-white mb-4">
                {editingFaq?.id ? 'Edit FAQ' : 'New FAQ'}
              </h3>

              {/* Form Errors */}
              {formErrors.length > 0 && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                    {formErrors.map((error, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-4">
                {/* Question */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Question *
                  </label>
                  <input
                    type="text"
                    value={formData.question}
                    onChange={(e) => handleFieldChange('question', e.target.value)}
                    placeholder="Enter the frequently asked question..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Answer */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Answer *
                  </label>
                  <textarea
                    value={formData.answer}
                    onChange={(e) => handleFieldChange('answer', e.target.value)}
                    placeholder="Enter the answer..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleFieldChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {FAQ_CATEGORIES.map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Active Toggle */}
                  <div className="flex items-center gap-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Active
                    </label>
                    <button
                      type="button"
                      onClick={() => handleFieldChange('isActive', !formData.isActive)}
                      className={cn(
                        "relative w-11 h-6 rounded-full transition-colors",
                        formData.isActive ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600"
                      )}
                    >
                      <span
                        className={cn(
                          "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform",
                          formData.isActive && "translate-x-5"
                        )}
                      />
                    </button>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        {editingFaq?.id ? 'Update FAQ' : 'Create FAQ'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* FAQ List */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : faqs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-500 dark:text-gray-400">
                <HelpCircle className="h-12 w-12 mb-3 opacity-50" />
                <p>No FAQs yet. Create your first FAQ above.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div
                    key={faq.id}
                    className={cn(
                      "border rounded-lg p-4",
                      faq.isActive 
                        ? "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                        : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 opacity-60"
                    )}
                  >
                    <div className="flex items-start gap-4">
                      {/* Drag Handle / Order */}
                      <div className="flex flex-col items-center gap-1 text-gray-400">
                        <GripVertical className="h-4 w-4" />
                        <span className="text-xs font-medium">#{index + 1}</span>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white">
                              {faq.question}
                            </h4>
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                              {faq.answer}
                            </p>
                            <div className="mt-2 flex items-center gap-2">
                              <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                                {FAQ_CATEGORIES.find(c => c.value === faq.category)?.label || faq.category}
                              </span>
                              {!faq.isActive && (
                                <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                                  Inactive
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleMoveOrder(faq, 'up')}
                              disabled={index === 0}
                              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <ChevronUp className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleMoveOrder(faq, 'down')}
                              disabled={index === faqs.length - 1}
                              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <ChevronDown className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleStartEdit(faq)}
                              className="p-1.5 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(faq.id)}
                              disabled={isDeletingFAQ}
                              className="p-1.5 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 rounded hover:bg-red-50 dark:hover:bg-red-900/30 disabled:opacity-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {faqs.length} FAQ{faqs.length !== 1 ? 's' : ''} total
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default FAQEditor;
