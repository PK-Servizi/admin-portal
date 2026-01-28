/**
 * Schema Editor Component
 * JSON-based form schema editor for services
 */

import React, { useState, useCallback } from 'react';
import { useUpdateServiceFormSchemaMutation } from '@/services/api/services.api';
import { useAppDispatch } from '@/store/hooks';
import { markSchemaAsSaved, setSchemaValidationErrors } from '@/store/slices/servicesSlice';
import { cn } from '@/lib/utils';
import type { FormSchema } from '@/types';
import {
  X,
  Loader2,
  Save,
  FileCode,
  AlertCircle,
  CheckCircle2,
  Copy,
  RotateCcw,
  Info,
} from 'lucide-react';

interface SchemaEditorProps {
  serviceId: string;
  initialSchema: FormSchema | null;
  onClose: () => void;
}

const DEFAULT_SCHEMA: FormSchema = {
  version: '1.0',
  sections: [
    {
      id: 'section-1',
      title: 'Personal Information',
      description: 'Enter your personal details',
      order: 1,
      fields: [
        {
          id: 'field-1',
          name: 'firstName',
          type: 'text',
          label: 'First Name',
          placeholder: 'Enter your first name',
          validation: { required: true, minLength: 2, maxLength: 50 },
          width: 'half',
          order: 1,
        },
        {
          id: 'field-2',
          name: 'lastName',
          type: 'text',
          label: 'Last Name',
          placeholder: 'Enter your last name',
          validation: { required: true, minLength: 2, maxLength: 50 },
          width: 'half',
          order: 2,
        },
      ],
    },
  ],
  settings: {
    showProgressBar: true,
    allowSaveDraft: true,
    submitButtonText: 'Submit Request',
  },
};

export const SchemaEditor: React.FC<SchemaEditorProps> = ({
  serviceId,
  initialSchema,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const [schemaText, setSchemaText] = useState(
    JSON.stringify(initialSchema || DEFAULT_SCHEMA, null, 2)
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  const [updateSchema, { isLoading: isSaving }] = useUpdateServiceFormSchemaMutation();

  // Validate JSON
  const validateSchema = useCallback((text: string): { valid: boolean; errors: string[]; schema?: FormSchema } => {
    const validationErrors: string[] = [];

    try {
      const parsed = JSON.parse(text) as FormSchema;

      // Basic structure validation
      if (!parsed.version) {
        validationErrors.push('Missing "version" field');
      }
      if (!Array.isArray(parsed.sections)) {
        validationErrors.push('"sections" field must be an array');
      } else {
        parsed.sections.forEach((section, sIndex) => {
          if (!section.id) {
            validationErrors.push(`Section ${sIndex + 1}: missing "id" field`);
          }
          if (!section.title) {
            validationErrors.push(`Section ${sIndex + 1}: missing "title" field`);
          }
          if (!Array.isArray(section.fields)) {
            validationErrors.push(`Section ${sIndex + 1}: "fields" must be an array`);
          } else {
            section.fields.forEach((field, fIndex) => {
              if (!field.id) {
                validationErrors.push(`Section ${sIndex + 1}, Field ${fIndex + 1}: missing "id"`);
              }
              if (!field.name) {
                validationErrors.push(`Section ${sIndex + 1}, Field ${fIndex + 1}: missing "name"`);
              }
              if (!field.type) {
                validationErrors.push(`Section ${sIndex + 1}, Field ${fIndex + 1}: missing "type"`);
              }
              if (!field.label) {
                validationErrors.push(`Section ${sIndex + 1}, Field ${fIndex + 1}: missing "label"`);
              }
            });
          }
        });
      }

      return {
        valid: validationErrors.length === 0,
        errors: validationErrors,
        schema: validationErrors.length === 0 ? parsed : undefined,
      };
    } catch (e) {
      return {
        valid: false,
        errors: [`Invalid JSON: ${(e as Error).message}`],
      };
    }
  }, []);

  // Handle text change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setSchemaText(newText);
    setIsDirty(true);

    // Validate on change (debounced validation would be better for production)
    const validation = validateSchema(newText);
    setErrors(validation.errors);
    dispatch(setSchemaValidationErrors(validation.errors));
  };

  // Handle save
  const handleSave = async () => {
    const validation = validateSchema(schemaText);
    if (!validation.valid || !validation.schema) {
      setErrors(validation.errors);
      return;
    }

    try {
      await updateSchema({ id: serviceId, formSchema: validation.schema }).unwrap();
      dispatch(markSchemaAsSaved());
      setIsDirty(false);
      onClose();
    } catch (error) {
      console.error('Failed to save schema:', error);
      setErrors(['Error saving schema']);
    }
  };

  // Handle format
  const handleFormat = () => {
    try {
      const parsed = JSON.parse(schemaText);
      setSchemaText(JSON.stringify(parsed, null, 2));
    } catch (e) {
      // Can't format invalid JSON
    }
  };

  // Handle reset
  const handleReset = () => {
    if (window.confirm('Are you sure you want to restore the initial schema? Unsaved changes will be lost.')) {
      setSchemaText(JSON.stringify(initialSchema || DEFAULT_SCHEMA, null, 2));
      setErrors([]);
      setIsDirty(false);
    }
  };

  // Handle copy
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(schemaText);
    } catch (e) {
      console.error('Failed to copy:', e);
    }
  };

  // Load template
  const handleLoadTemplate = () => {
    if (isDirty && !window.confirm('Are you sure you want to load the template? Unsaved changes will be lost.')) {
      return;
    }
    setSchemaText(JSON.stringify(DEFAULT_SCHEMA, null, 2));
    setErrors([]);
    setIsDirty(true);
  };

  const hasErrors = errors.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full mx-4 h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg">
              <FileCode className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Form Schema
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Configure the form fields for this service
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isDirty && (
              <span className="text-sm text-amber-600 dark:text-amber-400">
                Unsaved changes
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

        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center gap-2">
            <button
              onClick={handleFormat}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <FileCode className="h-4 w-4" />
              Format
            </button>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Copy className="h-4 w-4" />
              Copy
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
            <button
              onClick={handleLoadTemplate}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Info className="h-4 w-4" />
              Load Template
            </button>
          </div>
          <div className="flex items-center gap-2">
            {hasErrors ? (
              <span className="flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="h-4 w-4" />
                {errors.length} errors
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-sm text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                Valid JSON
              </span>
            )}
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 flex overflow-hidden">
          {/* Code Editor */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <textarea
              value={schemaText}
              onChange={handleChange}
              spellCheck={false}
              className={cn(
                'flex-1 w-full p-4 font-mono text-sm bg-gray-900 text-gray-100 resize-none focus:outline-none',
                hasErrors && 'border-r-4 border-red-500'
              )}
              style={{
                tabSize: 2,
              }}
            />
          </div>

          {/* Errors Panel */}
          {hasErrors && (
            <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 overflow-y-auto">
              <div className="p-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-red-600 dark:text-red-400 mb-3">
                  <AlertCircle className="h-4 w-4" />
                  Validation Errors
                </h3>
                <ul className="space-y-2">
                  {errors.map((error, index) => (
                    <li
                      key={index}
                      className="text-sm text-gray-600 dark:text-gray-400 p-2 bg-red-50 dark:bg-red-500/10 rounded-lg"
                    >
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Use JSON format to define the form structure
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || hasErrors}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Schema
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
