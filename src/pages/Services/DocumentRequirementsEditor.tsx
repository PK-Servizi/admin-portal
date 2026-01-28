/**
 * Document Requirements Editor Component
 * Manage required documents for a service
 */

import React, { useState, useMemo } from 'react';
import { useUpdateServiceDocumentRequirementsMutation } from '@/services/api/services.api';
import { useAppDispatch } from '@/store/hooks';
import { closeDocumentRequirementsEditor } from '@/store/slices/servicesSlice';
import { cn } from '@/lib/utils';
import type { DocumentRequirement } from '@/types';
import {
  X,
  Loader2,
  Save,
  FileText,
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  FileCheck,
  FileWarning,
  Info,
} from 'lucide-react';

interface DocumentRequirementsEditorProps {
  serviceId: string;
  initialRequirements: DocumentRequirement[];
  onClose: () => void;
}

const DOCUMENT_TYPE_OPTIONS = [
  { value: 'identity', label: 'Documento di Identità' },
  { value: 'fiscal_code', label: 'Codice Fiscale' },
  { value: 'residence', label: 'Certificato di Residenza' },
  { value: 'income', label: 'Dichiarazione dei Redditi' },
  { value: 'property', label: 'Documentazione Immobiliare' },
  { value: 'vehicle', label: 'Documentazione Veicolo' },
  { value: 'medical', label: 'Documentazione Medica' },
  { value: 'education', label: 'Titoli di Studio' },
  { value: 'work', label: 'Documentazione Lavorativa' },
  { value: 'other', label: 'Altro' },
];

const ACCEPTED_FORMATS = [
  { value: 'application/pdf', label: 'PDF' },
  { value: 'image/jpeg', label: 'JPEG' },
  { value: 'image/png', label: 'PNG' },
  { value: 'image/gif', label: 'GIF' },
  { value: 'application/msword', label: 'DOC' },
  { value: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', label: 'DOCX' },
];

const generateId = () => `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const DocumentRequirementsEditor: React.FC<DocumentRequirementsEditorProps> = ({
  serviceId,
  initialRequirements,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const [requirements, setRequirements] = useState<DocumentRequirement[]>(
    initialRequirements.length > 0
      ? initialRequirements
      : [
          {
            id: generateId(),
            name: 'Documento di Identità',
            description: 'Carta di identità o passaporto in corso di validità',
            type: 'identity',
            required: true,
            acceptedFormats: ['application/pdf', 'image/jpeg', 'image/png'],
            maxFileSize: 5 * 1024 * 1024, // 5MB
            order: 1,
          },
        ]
  );
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [isDirty, setIsDirty] = useState(false);
  const [errors, setErrors] = useState<Map<string, string[]>>(new Map());

  const [updateRequirements, { isLoading: isSaving }] = useUpdateServiceDocumentRequirementsMutation();

  // Sort requirements by order
  const sortedRequirements = useMemo(
    () => [...requirements].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    [requirements]
  );

  // Toggle expanded
  const toggleExpanded = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  // Add new requirement
  const handleAdd = () => {
    const maxOrder = Math.max(0, ...requirements.map((r) => r.order ?? 0));
    const newRequirement: DocumentRequirement = {
      id: generateId(),
      name: '',
      description: '',
      type: 'other',
      required: true,
      acceptedFormats: ['application/pdf', 'image/jpeg', 'image/png'],
      maxFileSize: 5 * 1024 * 1024,
      order: maxOrder + 1,
    };
    setRequirements([...requirements, newRequirement]);
    setExpandedIds(new Set([...expandedIds, newRequirement.id]));
    setIsDirty(true);
  };

  // Remove requirement
  const handleRemove = (id: string) => {
    if (requirements.length <= 1) {
      return; // Keep at least one requirement
    }
    setRequirements(requirements.filter((r) => r.id !== id));
    setIsDirty(true);
  };

  // Update requirement
  const handleUpdate = (id: string, updates: Partial<DocumentRequirement>) => {
    setRequirements(
      requirements.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
    setIsDirty(true);
    // Clear errors for this field
    if (errors.has(id)) {
      const newErrors = new Map(errors);
      newErrors.delete(id);
      setErrors(newErrors);
    }
  };

  // Move requirement up/down
  const handleMove = (id: string, direction: 'up' | 'down') => {
    const index = sortedRequirements.findIndex((r) => r.id === id);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === sortedRequirements.length - 1)
    ) {
      return;
    }

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const currentReq = sortedRequirements[index];
    const targetReq = sortedRequirements[targetIndex];

    // Swap orders
    setRequirements(
      requirements.map((r) => {
        if (r.id === currentReq.id) {
          return { ...r, order: targetReq.order };
        }
        if (r.id === targetReq.id) {
          return { ...r, order: currentReq.order };
        }
        return r;
      })
    );
    setIsDirty(true);
  };

  // Toggle accepted format
  const handleToggleFormat = (id: string, format: string) => {
    const requirement = requirements.find((r) => r.id === id);
    if (!requirement || !requirement.acceptedFormats) return;

    const formats = requirement.acceptedFormats.includes(format)
      ? requirement.acceptedFormats.filter((f) => f !== format)
      : [...requirement.acceptedFormats, format];

    handleUpdate(id, { acceptedFormats: formats });
  };

  // Validate requirements
  const validate = (): boolean => {
    const newErrors = new Map<string, string[]>();
    let isValid = true;

    requirements.forEach((req) => {
      const reqErrors: string[] = [];

      if (!req.name.trim()) {
        reqErrors.push('Il nome è obbligatorio');
      }
      if (!req.acceptedFormats || req.acceptedFormats.length === 0) {
        reqErrors.push('Seleziona almeno un formato accettato');
      }
      if (!req.maxFileSize || req.maxFileSize <= 0) {
        reqErrors.push('La dimensione massima deve essere maggiore di 0');
      }

      if (reqErrors.length > 0) {
        newErrors.set(req.id, reqErrors);
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  // Save requirements
  const handleSave = async () => {
    if (!validate()) {
      return;
    }

    try {
      await updateRequirements({
        id: serviceId,
        documentRequirements: sortedRequirements,
      }).unwrap();
      setIsDirty(false);
      dispatch(closeDocumentRequirementsEditor());
      onClose();
    } catch (error) {
      console.error('Failed to save requirements:', error);
    }
  };

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
    }
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-3xl w-full mx-4 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-500/20 rounded-lg">
              <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Documenti Richiesti
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Configura i documenti necessari per questo servizio
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isDirty && (
              <span className="text-sm text-amber-600 dark:text-amber-400">
                Modifiche non salvate
              </span>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {sortedRequirements.map((requirement, index) => {
              const isExpanded = expandedIds.has(requirement.id);
              const reqErrors = errors.get(requirement.id) || [];
              const hasErrors = reqErrors.length > 0;

              return (
                <div
                  key={requirement.id}
                  className={cn(
                    'border rounded-lg transition-colors',
                    hasErrors
                      ? 'border-red-300 dark:border-red-500/50 bg-red-50/50 dark:bg-red-500/5'
                      : 'border-gray-200 dark:border-gray-700'
                  )}
                >
                  {/* Collapsed Header */}
                  <div
                    className="flex items-center gap-3 p-4 cursor-pointer"
                    onClick={() => toggleExpanded(requirement.id)}
                  >
                    <GripVertical className="h-5 w-5 text-gray-400 cursor-grab" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        {requirement.required ? (
                          <FileCheck className="h-4 w-4 text-emerald-500" />
                        ) : (
                          <FileWarning className="h-4 w-4 text-amber-500" />
                        )}
                        <span className="font-medium text-gray-900 dark:text-white truncate">
                          {requirement.name || 'Nuovo Documento'}
                        </span>
                        {requirement.required && (
                          <span className="text-xs px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 rounded-full">
                            Obbligatorio
                          </span>
                        )}
                      </div>
                      {requirement.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-0.5">
                          {requirement.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMove(requirement.id, 'up');
                        }}
                        disabled={index === 0}
                        className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronUp className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMove(requirement.id, 'down');
                        }}
                        disabled={index === sortedRequirements.length - 1}
                        className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(requirement.id);
                        }}
                        disabled={requirements.length <= 1}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-0 border-t border-gray-200 dark:border-gray-700 mt-0">
                      <div className="pt-4 space-y-4">
                        {/* Errors */}
                        {hasErrors && (
                          <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-500/10 rounded-lg">
                            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
                              {reqErrors.map((error, i) => (
                                <li key={i}>{error}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Name */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Nome Documento *
                          </label>
                          <input
                            type="text"
                            value={requirement.name}
                            onChange={(e) =>
                              handleUpdate(requirement.id, { name: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Es. Documento di Identità"
                          />
                        </div>

                        {/* Description */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Descrizione
                          </label>
                          <textarea
                            value={requirement.description || ''}
                            onChange={(e) =>
                              handleUpdate(requirement.id, { description: e.target.value })
                            }
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                            placeholder="Descrizione del documento richiesto"
                          />
                        </div>

                        {/* Type and Required */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Tipo Documento
                            </label>
                            <select
                              value={requirement.type}
                              onChange={(e) =>
                                handleUpdate(requirement.id, { type: e.target.value })
                              }
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            >
                              {DOCUMENT_TYPE_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              Obbligatorio
                            </label>
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdate(requirement.id, { required: !requirement.required })
                              }
                              className={cn(
                                'relative inline-flex h-10 w-20 items-center justify-center rounded-lg border transition-colors',
                                requirement.required
                                  ? 'bg-emerald-50 dark:bg-emerald-500/20 border-emerald-300 dark:border-emerald-500/50 text-emerald-700 dark:text-emerald-400'
                                  : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400'
                              )}
                            >
                              {requirement.required ? 'Sì' : 'No'}
                            </button>
                          </div>
                        </div>

                        {/* File Size */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Dimensione Massima File
                          </label>
                          <div className="flex items-center gap-3">
                            <input
                              type="range"
                              min={1}
                              max={20}
                              value={(requirement.maxFileSize ?? 5 * 1024 * 1024) / (1024 * 1024)}
                              onChange={(e) =>
                                handleUpdate(requirement.id, {
                                  maxFileSize: parseInt(e.target.value) * 1024 * 1024,
                                })
                              }
                              className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                            />
                            <span className="w-16 text-sm text-gray-600 dark:text-gray-400 text-right">
                              {formatFileSize(requirement.maxFileSize ?? 5 * 1024 * 1024)}
                            </span>
                          </div>
                        </div>

                        {/* Accepted Formats */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Formati Accettati *
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {ACCEPTED_FORMATS.map((format) => (
                              <button
                                key={format.value}
                                type="button"
                                onClick={() =>
                                  handleToggleFormat(requirement.id, format.value)
                                }
                                className={cn(
                                  'px-3 py-1.5 text-sm rounded-lg border transition-colors',
                                  requirement.acceptedFormats?.includes(format.value)
                                    ? 'bg-indigo-50 dark:bg-indigo-500/20 border-indigo-300 dark:border-indigo-500/50 text-indigo-700 dark:text-indigo-400'
                                    : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                                )}
                              >
                                {format.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add Button */}
          <button
            onClick={handleAdd}
            className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-indigo-400 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Aggiungi Documento
          </button>

          {/* Info */}
          <div className="mt-4 flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-500/10 rounded-lg">
            <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-700 dark:text-blue-400">
              I documenti obbligatori devono essere caricati prima che la richiesta di servizio possa essere completata.
              L'ordine dei documenti definisce come verranno visualizzati al cliente.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {requirements.length} documenti configurati
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Annulla
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Salva Documenti
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
