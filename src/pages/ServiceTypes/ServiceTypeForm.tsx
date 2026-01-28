/**
 * Service Type Form Component
 * Modal form for creating and editing service types
 */

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import type { ServiceType, CreateServiceTypeData, UpdateServiceTypeData } from '@/types';
import { X, Loader2, Layers, Save } from 'lucide-react';

interface ServiceTypeFormProps {
  mode: 'create' | 'edit';
  serviceType?: ServiceType;
  onSubmit: (data: CreateServiceTypeData | UpdateServiceTypeData) => Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
}

export const ServiceTypeForm: React.FC<ServiceTypeFormProps> = ({
  mode,
  serviceType,
  onSubmit,
  onClose,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Initialize form with service type data for edit mode
  useEffect(() => {
    if (mode === 'edit' && serviceType) {
      setFormData({
        name: serviceType.name || '',
        code: serviceType.code || '',
        description: serviceType.description || '',
        isActive: serviceType.isActive ?? true,
      });
    }
  }, [mode, serviceType]);

  // Validation
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Il nome è obbligatorio';
    } else if (formData.name.length < 3) {
      newErrors.name = 'Il nome deve contenere almeno 3 caratteri';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Il nome non può superare i 100 caratteri';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  // Handle blur for validation
  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validate();
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, code: true, description: true });

    if (!validate()) return;

    try {
      const submitData: CreateServiceTypeData | UpdateServiceTypeData = {
        name: formData.name.trim(),
        ...(formData.code && { code: formData.code.trim() }),
        ...(formData.description && { description: formData.description.trim() }),
        isActive: formData.isActive,
      };
      await onSubmit(submitData);
    } catch (error) {
      // Error handling is done in parent component
      console.error('Form submission failed:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-lg w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg">
              <Layers className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {mode === 'create' ? 'Nuovo Tipo di Servizio' : 'Modifica Tipo di Servizio'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Nome <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              onBlur={() => handleBlur('name')}
              placeholder="es. Servizi Fiscali"
              className={cn(
                'w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors',
                touched.name && errors.name
                  ? 'border-red-500'
                  : 'border-gray-200 dark:border-gray-700'
              )}
            />
            {touched.name && errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Code */}
          <div>
            <label
              htmlFor="code"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Codice
            </label>
            <input
              type="text"
              id="code"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="es. FISCAL"
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Codice univoco per identificare il tipo di servizio
            </p>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Descrizione
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              placeholder="Descrizione del tipo di servizio..."
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-colors resize-none"
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-3">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-600"></div>
            </label>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {formData.isActive ? 'Attivo' : 'Inattivo'}
            </span>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Annulla
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {mode === 'create' ? 'Crea' : 'Salva'}
          </button>
        </div>
      </div>
    </div>
  );
};
