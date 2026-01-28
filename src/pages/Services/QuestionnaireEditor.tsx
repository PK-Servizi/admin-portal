/**
 * Questionnaire Editor Component
 * JSON-based questionnaire editor for services
 * Questionnaire fields are submitted by customers after payment
 */

import React, { useState, useCallback } from 'react';
import { useUpdateServiceFormSchemaMutation } from '@/services/api/services.api';
import { cn } from '@/lib/utils';
import type { FormSchema } from '@/types';
import {
  X,
  Loader2,
  Save,
  ClipboardList,
  AlertCircle,
  CheckCircle2,
  Copy,
  RotateCcw,
  Info,
  HelpCircle,
} from 'lucide-react';

interface QuestionnaireEditorProps {
  serviceId: string;
  serviceName: string;
  initialSchema: FormSchema | null;
  onClose: () => void;
  onSave?: () => void;
}

const DEFAULT_QUESTIONNAIRE: FormSchema = {
  version: '1.0',
  sections: [
    {
      id: 'section-personal',
      title: 'Personal Information',
      description: 'Please provide your personal details',
      order: 1,
      fields: [
        {
          id: 'field-fullname',
          name: 'fullName',
          type: 'text',
          label: 'Full Name',
          placeholder: 'Enter your full name',
          validation: { required: true, minLength: 2, maxLength: 100 },
          width: 'full',
          order: 1,
        },
        {
          id: 'field-dob',
          name: 'dateOfBirth',
          type: 'date',
          label: 'Date of Birth',
          validation: { required: true },
          width: 'half',
          order: 2,
        },
        {
          id: 'field-fiscalcode',
          name: 'fiscalCode',
          type: 'text',
          label: 'Fiscal Code',
          placeholder: 'Enter your fiscal code',
          validation: { required: true, pattern: '^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$' },
          width: 'half',
          order: 3,
        },
      ],
    },
    {
      id: 'section-contact',
      title: 'Contact Details',
      description: 'How can we reach you?',
      order: 2,
      fields: [
        {
          id: 'field-email',
          name: 'email',
          type: 'email',
          label: 'Email Address',
          placeholder: 'your@email.com',
          validation: { required: true },
          width: 'half',
          order: 1,
        },
        {
          id: 'field-phone',
          name: 'phone',
          type: 'text',
          label: 'Phone Number',
          placeholder: '+39 xxx xxx xxxx',
          validation: { required: true },
          width: 'half',
          order: 2,
        },
      ],
    },
  ],
  settings: {
    showProgressBar: true,
    allowSaveDraft: true,
    submitButtonText: 'Submit Questionnaire',
  },
};

const FIELD_TYPE_EXAMPLES = `
Field Types Available:
- text: Single line text input
- textarea: Multi-line text area
- email: Email address input
- tel: Phone number input
- number: Numeric input
- date: Date picker
- select: Dropdown selection (requires 'options' array)
- radio: Radio button group (requires 'options' array)
- checkbox: Checkbox group (requires 'options' array)
- file: File upload

Validation Options:
- required: boolean
- minLength: number
- maxLength: number
- min: number (for numbers)
- max: number (for numbers)
- pattern: regex string

Width Options:
- full: Full width
- half: Half width (two fields per row)
- third: One-third width (three fields per row)
`;

export const QuestionnaireEditor: React.FC<QuestionnaireEditorProps> = ({
  serviceId,
  serviceName,
  initialSchema,
  onClose,
  onSave,
}) => {
  const [schemaText, setSchemaText] = useState(
    JSON.stringify(initialSchema || DEFAULT_QUESTIONNAIRE, null, 2)
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

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

    // Validate on change
    const validation = validateSchema(newText);
    setErrors(validation.errors);
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
      setIsDirty(false);
      onSave?.();
      onClose();
    } catch (error) {
      console.error('Failed to save questionnaire:', error);
      setErrors(['Error saving questionnaire. Please try again.']);
    }
  };

  // Handle format
  const handleFormat = () => {
    try {
      const parsed = JSON.parse(schemaText);
      setSchemaText(JSON.stringify(parsed, null, 2));
    } catch {
      // Can't format invalid JSON
    }
  };

  // Handle reset
  const handleReset = () => {
    if (window.confirm('Are you sure you want to restore the initial questionnaire? Unsaved changes will be lost.')) {
      setSchemaText(JSON.stringify(initialSchema || DEFAULT_QUESTIONNAIRE, null, 2));
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
    setSchemaText(JSON.stringify(DEFAULT_QUESTIONNAIRE, null, 2));
    setErrors([]);
    setIsDirty(true);
  };

  const hasErrors = errors.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-5xl w-full mx-4 h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-500/20 rounded-lg">
              <ClipboardList className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Questionnaire Editor
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Configure questionnaire fields for <span className="font-medium">{serviceName}</span>
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

        {/* Info Banner */}
        <div className="px-6 py-3 bg-purple-50 dark:bg-purple-900/20 border-b border-purple-100 dark:border-purple-800">
          <p className="text-sm text-purple-700 dark:text-purple-300">
            <strong>Note:</strong> This questionnaire will be shown to customers after they complete payment. 
            The answers will be stored with their service request.
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <div className="flex items-center gap-2">
            <button
              onClick={handleFormat}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ClipboardList className="h-4 w-4" />
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
            <button
              onClick={() => setShowHelp(!showHelp)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors",
                showHelp 
                  ? "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              )}
            >
              <HelpCircle className="h-4 w-4" />
              Help
            </button>
          </div>
          <div className="flex items-center gap-2">
            {hasErrors ? (
              <span className="flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="h-4 w-4" />
                {errors.length} error{errors.length > 1 ? 's' : ''}
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
          <div className={cn("flex-1 flex flex-col overflow-hidden", showHelp && "w-2/3")}>
            <textarea
              value={schemaText}
              onChange={handleChange}
              spellCheck={false}
              className={cn(
                "flex-1 w-full p-4 font-mono text-sm resize-none",
                "bg-gray-900 text-gray-100",
                "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-inset",
                hasErrors && "ring-2 ring-red-500 ring-inset"
              )}
              placeholder="Enter questionnaire schema JSON..."
            />
          </div>

          {/* Help Panel */}
          {showHelp && (
            <div className="w-1/3 border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 overflow-y-auto">
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                  Field Types & Options
                </h3>
                <pre className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                  {FIELD_TYPE_EXAMPLES}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Errors */}
        {hasErrors && (
          <div className="px-6 py-3 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800 max-h-32 overflow-y-auto">
            <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-2">
              Validation Errors:
            </h4>
            <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
              {errors.map((error, index) => (
                <li key={index} className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  {error}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || hasErrors}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors",
              hasErrors
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700"
            )}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Questionnaire
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionnaireEditor;
