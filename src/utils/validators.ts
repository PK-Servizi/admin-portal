/**
 * Validation Functions
 * Common validation utilities for forms and data
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Required field validator
 */
export const required = (value: unknown, fieldName = 'This field'): ValidationResult => {
  if (value === null || value === undefined) {
    return { valid: false, error: `${fieldName} is required` };
  }
  
  if (typeof value === 'string' && value.trim() === '') {
    return { valid: false, error: `${fieldName} is required` };
  }
  
  if (Array.isArray(value) && value.length === 0) {
    return { valid: false, error: `${fieldName} is required` };
  }
  
  return { valid: true };
};

/**
 * Email validator
 */
export const email = (value: string): ValidationResult => {
  if (!value) return { valid: true };
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return { valid: false, error: 'Please enter a valid email address' };
  }
  
  return { valid: true };
};

/**
 * Phone number validator (Italian format)
 */
export const phone = (value: string): ValidationResult => {
  if (!value) return { valid: true };
  
  const phoneRegex = /^[\d\s\-+()]+$/;
  const digits = value.replace(/\D/g, '');
  
  if (!phoneRegex.test(value) || digits.length < 10) {
    return { valid: false, error: 'Please enter a valid phone number' };
  }
  
  return { valid: true };
};

/**
 * Fiscal code validator (Italian)
 */
export const fiscalCode = (value: string): ValidationResult => {
  if (!value) return { valid: true };
  
  const fiscalCodeRegex = /^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/;
  if (!fiscalCodeRegex.test(value.toUpperCase())) {
    return { valid: false, error: 'Please enter a valid fiscal code' };
  }
  
  return { valid: true };
};

/**
 * VAT number validator (Italian)
 */
export const vatNumber = (value: string): ValidationResult => {
  if (!value) return { valid: true };
  
  const vatRegex = /^\d{11}$/;
  if (!vatRegex.test(value)) {
    return { valid: false, error: 'Please enter a valid VAT number (11 digits)' };
  }
  
  return { valid: true };
};

/**
 * Min length validator
 */
export const minLength = (min: number) => (value: string): ValidationResult => {
  if (!value) return { valid: true };
  
  if (value.length < min) {
    return { valid: false, error: `Must be at least ${min} characters` };
  }
  
  return { valid: true };
};

/**
 * Max length validator
 */
export const maxLength = (max: number) => (value: string): ValidationResult => {
  if (!value) return { valid: true };
  
  if (value.length > max) {
    return { valid: false, error: `Must be at most ${max} characters` };
  }
  
  return { valid: true };
};

/**
 * Min value validator
 */
export const minValue = (min: number) => (value: number): ValidationResult => {
  if (value === null || value === undefined) return { valid: true };
  
  if (value < min) {
    return { valid: false, error: `Must be at least ${min}` };
  }
  
  return { valid: true };
};

/**
 * Max value validator
 */
export const maxValue = (max: number) => (value: number): ValidationResult => {
  if (value === null || value === undefined) return { valid: true };
  
  if (value > max) {
    return { valid: false, error: `Must be at most ${max}` };
  }
  
  return { valid: true };
};

/**
 * Pattern validator
 */
export const pattern = (regex: RegExp, message: string) => (value: string): ValidationResult => {
  if (!value) return { valid: true };
  
  if (!regex.test(value)) {
    return { valid: false, error: message };
  }
  
  return { valid: true };
};

/**
 * URL validator
 */
export const url = (value: string): ValidationResult => {
  if (!value) return { valid: true };
  
  try {
    new URL(value);
    return { valid: true };
  } catch {
    return { valid: false, error: 'Please enter a valid URL' };
  }
};

/**
 * Date validator
 */
export const date = (value: string | Date): ValidationResult => {
  if (!value) return { valid: true };
  
  const d = typeof value === 'string' ? new Date(value) : value;
  if (isNaN(d.getTime())) {
    return { valid: false, error: 'Please enter a valid date' };
  }
  
  return { valid: true };
};

/**
 * Min date validator
 */
export const minDate = (minDate: Date) => (value: string | Date): ValidationResult => {
  if (!value) return { valid: true };
  
  const d = typeof value === 'string' ? new Date(value) : value;
  if (d < minDate) {
    return { valid: false, error: `Date must be after ${minDate.toLocaleDateString()}` };
  }
  
  return { valid: true };
};

/**
 * Max date validator
 */
export const maxDate = (maxDate: Date) => (value: string | Date): ValidationResult => {
  if (!value) return { valid: true };
  
  const d = typeof value === 'string' ? new Date(value) : value;
  if (d > maxDate) {
    return { valid: false, error: `Date must be before ${maxDate.toLocaleDateString()}` };
  }
  
  return { valid: true };
};

/**
 * Password strength validator
 */
export const password = (value: string): ValidationResult => {
  if (!value) return { valid: true };
  
  const errors: string[] = [];
  
  if (value.length < 8) {
    errors.push('at least 8 characters');
  }
  
  if (!/[A-Z]/.test(value)) {
    errors.push('one uppercase letter');
  }
  
  if (!/[a-z]/.test(value)) {
    errors.push('one lowercase letter');
  }
  
  if (!/\d/.test(value)) {
    errors.push('one number');
  }
  
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value)) {
    errors.push('one special character');
  }
  
  if (errors.length > 0) {
    return {
      valid: false,
      error: `Password must contain ${errors.join(', ')}`,
    };
  }
  
  return { valid: true };
};

/**
 * Match validator (for password confirmation)
 */
export const match = (fieldName: string, matchValue: unknown) => (value: unknown): ValidationResult => {
  if (!value) return { valid: true };
  
  if (value !== matchValue) {
    return { valid: false, error: `Does not match ${fieldName}` };
  }
  
  return { valid: true };
};

/**
 * Numeric validator
 */
export const numeric = (value: string): ValidationResult => {
  if (!value) return { valid: true };
  
  if (!/^\d+$/.test(value)) {
    return { valid: false, error: 'Must contain only numbers' };
  }
  
  return { valid: true };
};

/**
 * Alpha validator
 */
export const alpha = (value: string): ValidationResult => {
  if (!value) return { valid: true };
  
  if (!/^[a-zA-Z]+$/.test(value)) {
    return { valid: false, error: 'Must contain only letters' };
  }
  
  return { valid: true };
};

/**
 * Alphanumeric validator
 */
export const alphanumeric = (value: string): ValidationResult => {
  if (!value) return { valid: true };
  
  if (!/^[a-zA-Z0-9]+$/.test(value)) {
    return { valid: false, error: 'Must contain only letters and numbers' };
  }
  
  return { valid: true };
};

/**
 * File size validator
 */
export const fileSize = (maxSizeInMB: number) => (file: File): ValidationResult => {
  if (!file) return { valid: true };
  
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  if (file.size > maxSizeInBytes) {
    return { valid: false, error: `File size must be less than ${maxSizeInMB}MB` };
  }
  
  return { valid: true };
};

/**
 * File type validator
 */
export const fileType = (allowedTypes: string[]) => (file: File): ValidationResult => {
  if (!file) return { valid: true };
  
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  if (!fileExtension || !allowedTypes.includes(fileExtension)) {
    return { valid: false, error: `File type must be one of: ${allowedTypes.join(', ')}` };
  }
  
  return { valid: true };
};

/**
 * Compose multiple validators
 */
export const compose = (...validators: ((value: unknown) => ValidationResult)[]) => (
  value: unknown
): ValidationResult => {
  for (const validator of validators) {
    const result = validator(value);
    if (!result.valid) {
      return result;
    }
  }
  return { valid: true };
};

/**
 * Validate object against schema
 */
export const validateSchema = <T extends Record<string, unknown>>(
  data: T,
  schema: Record<keyof T, (value: unknown) => ValidationResult>
): { valid: boolean; errors: Partial<Record<keyof T, string>> } => {
  const errors: Partial<Record<keyof T, string>> = {};
  let valid = true;
  
  for (const key in schema) {
    const result = schema[key](data[key]);
    if (!result.valid) {
      errors[key] = result.error;
      valid = false;
    }
  }
  
  return { valid, errors };
};

/**
 * Async validator wrapper
 */
export const asyncValidator = async <T,>(
  value: T,
  validator: (value: T) => Promise<ValidationResult>
): Promise<ValidationResult> => {
  try {
    return await validator(value);
  } catch (error) {
    return { valid: false, error: 'Validation failed' };
  }
};
