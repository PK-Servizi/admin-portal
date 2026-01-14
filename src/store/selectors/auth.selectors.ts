/**
 * Auth Selectors
 * Memoized selectors for auth state
 */

import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../index';

// Base selectors
const selectAuthState = (state: RootState) => state.auth;

// Memoized selectors
export const selectUser = createSelector(
  [selectAuthState],
  (auth) => auth.user
);

export const selectIsAuthenticated = createSelector(
  [selectAuthState],
  (auth) => auth.isAuthenticated
);

export const selectIsLoading = createSelector(
  [selectAuthState],
  (auth) => auth.isLoading
);

export const selectAccessToken = createSelector(
  [selectAuthState],
  (auth) => auth.accessToken
);

export const selectRefreshToken = createSelector(
  [selectAuthState],
  (auth) => auth.refreshToken
);

export const selectUserRole = createSelector(
  [selectUser],
  (user) => user?.role
);

export const selectUserPermissions = createSelector(
  [selectUser],
  (user) => user?.role?.permissions || []
);

export const selectHasPermission = (permission: string) =>
  createSelector([selectUserPermissions], (permissions) =>
    permissions.some((p) => p.name === permission)
  );

export const selectHasAnyPermission = (requiredPermissions: string[]) =>
  createSelector([selectUserPermissions], (permissions) =>
    requiredPermissions.some((required) =>
      permissions.some((p) => p.name === required)
    )
  );

export const selectHasAllPermissions = (requiredPermissions: string[]) =>
  createSelector([selectUserPermissions], (permissions) =>
    requiredPermissions.every((required) =>
      permissions.some((p) => p.name === required)
    )
  );

export const selectUserFullName = createSelector(
  [selectUser],
  (user) => (user ? `${user.firstName} ${user.lastName}` : '')
);

export const selectUserInitials = createSelector(
  [selectUser],
  (user) => {
    if (!user) return '';
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  }
);

export const selectIsAdmin = createSelector(
  [selectUserRole],
  (role) => role?.name === 'admin' || role?.name === 'super_admin'
);

export const selectIsSuperAdmin = createSelector(
  [selectUserRole],
  (role) => role?.name === 'super_admin'
);

export const selectCanAccessAdminPanel = createSelector(
  [selectUserPermissions],
  (permissions) =>
    permissions.some((p) =>
      [
        'users:view',
        'service_requests:view',
        'subscriptions:view',
        'settings:view',
      ].includes(p.name)
    )
);
