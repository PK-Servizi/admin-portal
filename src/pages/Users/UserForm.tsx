/**
 * User Create/Edit Form Page
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useCreateUserMutation,
} from '@/services/api/users-admin.api';
import { useGetAllRolesQuery, useAssignRoleToUserMutation } from '@/services/api/roles.api';
import { useGetAdminServicesQuery } from '@/services/api/services.api';
import {
  useCreateBackOfficeUserMutation,
  useUpdateBackOfficeServicesMutation,
  useGetBackOfficeUserServicesQuery,
} from '@/services/api/backoffice-admin.api';
import { cn } from '@/lib/utils';
import { ROLES } from '@/constants';
import {
  ArrowLeft,
  Save,
  Loader2,
  User,
  Mail,
  Phone,
  Lock,
  Shield,
  Eye,
  EyeOff,
  Briefcase,
  CheckSquare,
  Square,
} from 'lucide-react';

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
  roleId: string;
}

const initialFormData: UserFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  password: '',
  confirmPassword: '',
  roleId: '',
};

export const UserForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id && id !== 'new');

  const [formData, setFormData] = useState<UserFormData>(initialFormData);
  const [errors, setErrors] = useState<Partial<UserFormData>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [serviceError, setServiceError] = useState('');

  // API hooks
  const { data: userData, isLoading: isLoadingUser } = useGetUserByIdQuery(id!, {
    skip: !isEditing,
  });
  const { data: rolesData } = useGetAllRolesQuery();
  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();
  const [assignRoleToUser] = useAssignRoleToUserMutation();

  // Backoffice-specific hooks
  const [createBackOfficeUser, { isLoading: isCreatingBO }] = useCreateBackOfficeUserMutation();
  const [updateBackOfficeServices, { isLoading: isUpdatingServices }] = useUpdateBackOfficeServicesMutation();

  const roles = rolesData?.data || [];

  // Determine if selected role is backoffice
  const selectedRole = roles.find((r) => r.id === formData.roleId);
  const isBackofficeRole = selectedRole?.name?.toLowerCase() === ROLES.BACKOFFICE;

  // Fetch services list only when backoffice role is selected
  const { data: servicesData, isLoading: isLoadingServices } = useGetAdminServicesQuery(
    { take: 200, isActive: true },
    { skip: !isBackofficeRole }
  );

  // Fetch existing BO user service assignments when editing
  const { data: boServicesData } = useGetBackOfficeUserServicesQuery(id!, {
    skip: !isEditing || !isBackofficeRole,
  });

  const services = servicesData?.data || [];
  const isSubmitting = isCreating || isUpdating || isCreatingBO || isUpdatingServices;

  // Populate form with user data when editing
  useEffect(() => {
    if (userData?.data && isEditing) {
      const user = userData.data;
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        password: '',
        confirmPassword: '',
        roleId: user.role?.id || '',
      });
    }
  }, [userData, isEditing]);

  // Populate selected services when editing a BO user
  useEffect(() => {
    if (boServicesData?.data && isBackofficeRole) {
      setSelectedServiceIds(boServicesData.data.map((s) => s.serviceId));
    }
  }, [boServicesData, isBackofficeRole]);

  const validateForm = (): boolean => {
    const newErrors: Partial<UserFormData> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!isEditing) {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    } else if (formData.password && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.roleId) {
      newErrors.roleId = 'Role is required';
    }

    // Validate service assignment for backoffice users
    if (isBackofficeRole && selectedServiceIds.length === 0) {
      setServiceError('At least one service must be assigned to a back office user');
    } else {
      setServiceError('');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && !(isBackofficeRole && selectedServiceIds.length === 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (isEditing) {
        const updateData: Record<string, string> = {
          fullName: `${formData.firstName} ${formData.lastName}`.trim(),
          email: formData.email,
          phone: formData.phoneNumber,
        };
        
        if (formData.password) {
          updateData.password = formData.password;
        }

        await updateUser({ id: id!, data: updateData }).unwrap();

        // Update role if changed
        if (formData.roleId && formData.roleId !== userData?.data?.role?.id) {
          await assignRoleToUser({ userId: id!, data: { roleId: formData.roleId } }).unwrap();
        }

        // Update BO service assignments if backoffice role
        if (isBackofficeRole) {
          await updateBackOfficeServices({
            userId: id!,
            data: { serviceIds: selectedServiceIds },
          }).unwrap();
        }
      } else if (isBackofficeRole) {
        // Use dedicated BO user creation endpoint
        await createBackOfficeUser({
          email: formData.email,
          password: formData.password,
          fullName: `${formData.firstName} ${formData.lastName}`.trim(),
          phone: formData.phoneNumber || undefined,
          serviceIds: selectedServiceIds,
        }).unwrap();
      } else {
        const result = await createUser({
          email: formData.email,
          password: formData.password,
          fullName: `${formData.firstName} ${formData.lastName}`.trim(),
          phone: formData.phoneNumber || undefined,
          roleId: formData.roleId || undefined,
        }).unwrap();

        // Assign role if createUser didn't handle it
        if (formData.roleId && result.data?.id) {
          await assignRoleToUser({ userId: result.data.id, data: { roleId: formData.roleId } }).unwrap();
        }
      }

      navigate('/users');
    } catch (error: unknown) {
      console.error('Failed to save user:', error);
      const apiError = error as { data?: { message?: string } };
      if (apiError.data?.message) {
        setErrors({ email: apiError.data.message });
      }
    }
  };

  const handleChange = (field: keyof UserFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    // Clear service error when role changes away from backoffice
    if (field === 'roleId') {
      setServiceError('');
      if (!isBackofficeRole) {
        setSelectedServiceIds([]);
      }
    }
  };

  const toggleService = (serviceId: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
    if (serviceError) setServiceError('');
  };

  const toggleAllServices = () => {
    if (selectedServiceIds.length === services.length) {
      setSelectedServiceIds([]);
    } else {
      setSelectedServiceIds(services.map((s) => s.id));
    }
    if (serviceError) setServiceError('');
  };

  if (isEditing && isLoadingUser) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/users')}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isEditing ? 'Edit User' : 'Create New User'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {isEditing ? 'Update user information' : 'Add a new user to the system'}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
          {/* Personal Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-gray-400" />
              Personal Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  className={cn(
                    'w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors',
                    errors.firstName
                      ? 'border-red-500'
                      : 'border-gray-200 dark:border-gray-700'
                  )}
                  placeholder="John"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  className={cn(
                    'w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors',
                    errors.lastName
                      ? 'border-red-500'
                      : 'border-gray-200 dark:border-gray-700'
                  )}
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Mail className="h-5 w-5 text-gray-400" />
              Contact Information
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={cn(
                    'w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors',
                    errors.email
                      ? 'border-red-500'
                      : 'border-gray-200 dark:border-gray-700'
                  )}
                  placeholder="john.doe@example.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleChange('phoneNumber', e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="+39 123 456 7890"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Role */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-gray-400" />
              Role & Permissions
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.roleId}
                onChange={(e) => handleChange('roleId', e.target.value)}
                className={cn(
                  'w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors',
                  errors.roleId
                    ? 'border-red-500'
                    : 'border-gray-200 dark:border-gray-700'
                )}
              >
                <option value="">Select a role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
              {errors.roleId && (
                <p className="mt-1 text-sm text-red-500">{errors.roleId}</p>
              )}
            </div>
          </div>

          {/* Service Assignment (only for Backoffice role) */}
          {isBackofficeRole && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-gray-400" />
                Service Assignment
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Select the services this back office user is authorized to manage
              </p>
              {isLoadingServices ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading services...
                </div>
              ) : services.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No active services found. Create services first.
                </p>
              ) : (
                <div className="space-y-2">
                  {/* Select All */}
                  <button
                    type="button"
                    onClick={toggleAllServices}
                    className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-2"
                  >
                    {selectedServiceIds.length === services.length ? (
                      <CheckSquare className="h-4 w-4" />
                    ) : (
                      <Square className="h-4 w-4" />
                    )}
                    {selectedServiceIds.length === services.length ? 'Deselect All' : 'Select All'}
                    <span className="text-gray-400 ml-1">
                      ({selectedServiceIds.length}/{services.length})
                    </span>
                  </button>
                  {/* Service list */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                    {services.map((service) => {
                      const isSelected = selectedServiceIds.includes(service.id);
                      return (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => toggleService(service.id)}
                          className={cn(
                            'flex items-center gap-3 p-3 rounded-lg border text-left transition-colors',
                            isSelected
                              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-600'
                              : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                          )}
                        >
                          {isSelected ? (
                            <CheckSquare className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                          ) : (
                            <Square className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          )}
                          <div className="min-w-0">
                            <p className={cn(
                              'text-sm font-medium truncate',
                              isSelected
                                ? 'text-blue-700 dark:text-blue-300'
                                : 'text-gray-700 dark:text-gray-200'
                            )}>
                              {service.name}
                            </p>
                            {service.basePrice != null && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                €{Number(service.basePrice).toFixed(2)}
                              </p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              {serviceError && (
                <p className="mt-2 text-sm text-red-500">{serviceError}</p>
              )}
            </div>
          )}

          {/* Password */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Lock className="h-5 w-5 text-gray-400" />
              {isEditing ? 'Change Password' : 'Password'}
            </h2>
            {isEditing && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Leave blank to keep the current password
              </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Password {!isEditing && <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    className={cn(
                      'w-full px-3 py-2 pr-10 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors',
                      errors.password
                        ? 'border-red-500'
                        : 'border-gray-200 dark:border-gray-700'
                    )}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Confirm Password {!isEditing && <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange('confirmPassword', e.target.value)}
                    className={cn(
                      'w-full px-3 py-2 pr-10 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors',
                      errors.confirmPassword
                        ? 'border-red-500'
                        : 'border-gray-200 dark:border-gray-700'
                    )}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/users')}
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
            ) : (
              <Save className="h-4 w-4" />
            )}
            {isEditing ? 'Save Changes' : 'Create User'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
