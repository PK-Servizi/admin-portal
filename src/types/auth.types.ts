/**
 * Authentication Types
 */

export interface User {
  id: string;
  email: string;
  // Backend uses fullName, but we support both for flexibility
  fullName?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  phoneNumber?: string; // Alias for compatibility
  fiscalCode?: string;
  birthDate?: string;
  dateOfBirth?: string; // Alias for compatibility
  birthPlace?: string;
  placeOfBirth?: string; // Alias for compatibility
  address?: string;
  city?: string;
  postalCode?: string;
  province?: string;
  country?: string;
  isActive: boolean;
  isEmailVerified?: boolean;
  avatarUrl?: string;
  role: UserRole;
  permissions?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface UserRole {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
}

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  fiscalCode?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

// Backend returns accessToken and refreshToken at root level, not nested in tokens object
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}
