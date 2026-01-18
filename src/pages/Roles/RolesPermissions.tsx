/**
 * Roles & Permissions Page
 * Manage user roles and their permissions
 */

import React, { useState } from 'react';
import {
  useGetAllRolesQuery,
  useGetAllPermissionsQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
} from '@/services/api/roles.api';
import type { UserRole, Permission } from '@/types';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Shield,
  Plus,
  Edit,
  Trash2,
  Search,
  Loader2,
  RefreshCw,
  X,
  Check,
  Users,
  Settings,
  FileText,
  CreditCard,
  Calendar,
  AlertTriangle,
} from 'lucide-react';

interface RoleFormData {
  name: string;
  description: string;
  permissions: string[];
}

const initialFormData: RoleFormData = {
  name: '',
  description: '',
  permissions: [],
};

// Permission categories for grouping
const PERMISSION_CATEGORIES = [
  { key: 'users', label: 'Users', icon: Users },
  { key: 'service', label: 'Service Requests', icon: FileText },
  { key: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
  { key: 'appointments', label: 'Appointments', icon: Calendar },
  { key: 'settings', label: 'Settings', icon: Settings },
];

export const RolesPermissions: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [formData, setFormData] = useState<RoleFormData>(initialFormData);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // API hooks
  const { data: rolesData, isLoading: rolesLoading, refetch } = useGetAllRolesQuery();
  const { data: permissionsData, isLoading: permissionsLoading } = useGetAllPermissionsQuery();
  const [createRole, { isLoading: isCreating }] = useCreateRoleMutation();
  const [updateRole, { isLoading: isUpdating }] = useUpdateRoleMutation();
  const [deleteRole, { isLoading: isDeleting }] = useDeleteRoleMutation();

  const roles: UserRole[] = rolesData?.data || [];
  const permissions: Permission[] = permissionsData?.data || [];

  // Filter roles
  const filteredRoles = roles.filter((role) =>
    role.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group permissions by category
  const groupedPermissions = PERMISSION_CATEGORIES.map((category) => ({
    ...category,
    permissions: permissions.filter((p) =>
      p.name?.toLowerCase().includes(category.key) ||
      p.resource?.toLowerCase().includes(category.key)
    ),
  }));

  // Handle create/edit
  const openCreateModal = () => {
    setFormData(initialFormData);
    setIsEditing(false);
    setEditingRoleId(null);
    setShowModal(true);
  };

  const openEditModal = (role: UserRole) => {
    setFormData({
      name: role.name || '',
      description: role.description || '',
      permissions: role.permissions?.map((p) => typeof p === 'string' ? p : p.id) || [],
    });
    setIsEditing(true);
    setEditingRoleId(role.id);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditing && editingRoleId) {
        await updateRole({
          id: editingRoleId,
          data: formData,
        }).unwrap();
      } else {
        await createRole(formData).unwrap();
      }
      setShowModal(false);
      setFormData(initialFormData);
    } catch (error) {
      console.error('Failed to save role:', error);
    }
  };

  // Handle delete
  const handleDelete = async (roleId: string) => {
    try {
      await deleteRole(roleId).unwrap();
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete role:', error);
    }
  };

  // Toggle permission
  const togglePermission = (permissionId: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter((id) => id !== permissionId)
        : [...prev.permissions, permissionId],
    }));
  };

  // Toggle all permissions in a category
  const toggleCategory = (categoryPermissions: Permission[]) => {
    const categoryIds = categoryPermissions.map((p) => p.id);
    const allSelected = categoryIds.every((id) => formData.permissions.includes(id));

    if (allSelected) {
      setFormData((prev) => ({
        ...prev,
        permissions: prev.permissions.filter((id) => !categoryIds.includes(id)),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        permissions: [...new Set([...prev.permissions, ...categoryIds])],
      }));
    }
  };

  // Get role color based on name
  const getRoleColor = (roleName: string) => {
    const name = roleName?.toLowerCase();
    if (name?.includes('admin') || name?.includes('super')) {
      return 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border-rose-200 dark:border-rose-500/30';
    }
    if (name?.includes('operator') || name?.includes('manager')) {
      return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/30';
    }
    if (name?.includes('user') || name?.includes('customer')) {
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30';
    }
    return 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400 border-slate-200 dark:border-slate-500/30';
  };

  const isLoading = rolesLoading || permissionsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          </div>
          <p className="text-slate-500 dark:text-slate-400">Loading roles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-up">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Roles & Permissions
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Manage user roles and access permissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="icon"
            className="border-slate-200 dark:border-slate-700"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            onClick={openCreateModal}
            className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white shadow-lg shadow-indigo-500/25"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Role
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md animate-fade-up" style={{ animationDelay: '50ms' }}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          type="text"
          placeholder="Search roles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
        />
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredRoles.length === 0 ? (
          <Card className="col-span-full border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm shadow-soft animate-fade-up" style={{ animationDelay: '100ms' }}>
            <CardContent className="p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                No roles found
              </h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">
                Create your first role to get started
              </p>
              <Button
                onClick={openCreateModal}
                className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white shadow-lg shadow-indigo-500/25"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Role
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredRoles.map((role, index) => (
            <Card
              key={role.id}
              className="border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm shadow-soft hover:shadow-lg transition-all duration-300 animate-fade-up"
              style={{ animationDelay: `${(index + 2) * 50}ms` }}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'p-2.5 rounded-xl border',
                        getRoleColor(role.name)
                      )}
                    >
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">{role.name}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {role.permissions?.length || 0} permissions
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(role)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    {!['admin', 'super_admin', 'superadmin'].includes(role.name?.toLowerCase() || '') && (
                      <button
                        onClick={() => setShowDeleteConfirm(role.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
                  {role.description || 'No description'}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {role.permissions?.slice(0, 5).map((permission) => (
                    <span
                      key={typeof permission === 'string' ? permission : permission.id}
                      className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                    >
                    {typeof permission === 'string' ? permission : permission.name}
                  </span>
                ))}
                {role.permissions?.length > 5 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400">
                    +{role.permissions.length - 5} more
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
          ))
        )}
      </div>

      {/* Create/Edit Role Modal */}
      {showModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setShowModal(false)}
          />
          <div className="fixed inset-4 md:inset-y-8 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:max-w-2xl md:w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl shadow-2xl z-50 flex flex-col border border-slate-200 dark:border-slate-700">
            {/* Gradient accent line */}
            <div className="h-1 w-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-t-xl" />
            
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {isEditing ? 'Edit Role' : 'Create New Role'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="roleName" className="text-slate-700 dark:text-slate-300 mb-1.5">
                    Role Name
                  </Label>
                  <Input
                    id="roleName"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-500/20"
                    placeholder="e.g., Support Agent"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="roleDesc" className="text-slate-700 dark:text-slate-300 mb-1.5">
                    Description
                  </Label>
                  <textarea
                    id="roleDesc"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none text-slate-900 dark:text-white placeholder:text-slate-400"
                    placeholder="Brief description of this role..."
                  />
                </div>
              </div>

              {/* Permissions */}
              <div>
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                  Permissions
                </h4>
                <div className="space-y-4">
                  {groupedPermissions.map((category) => {
                    if (category.permissions.length === 0) return null;
                    const Icon = category.icon;
                    const categoryIds = category.permissions.map((p) => p.id);
                    const allSelected = categoryIds.every((id) =>
                      formData.permissions.includes(id)
                    );
                    const someSelected =
                      !allSelected &&
                      categoryIds.some((id) => formData.permissions.includes(id));

                    return (
                      <div
                        key={category.key}
                        className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={() => toggleCategory(category.permissions)}
                          className={cn(
                            'w-full flex items-center justify-between px-4 py-3 transition-colors',
                            allSelected
                              ? 'bg-indigo-50 dark:bg-indigo-500/10'
                              : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700'
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                              {category.label}
                            </span>
                          </div>
                          <div
                            className={cn(
                              'w-5 h-5 rounded border-2 flex items-center justify-center transition-colors',
                              allSelected
                                ? 'bg-indigo-600 border-indigo-600'
                                : someSelected
                                ? 'bg-indigo-600/50 border-indigo-600'
                                : 'border-slate-300 dark:border-slate-600'
                            )}
                          >
                            {(allSelected || someSelected) && (
                              <Check className="h-3 w-3 text-white" />
                            )}
                          </div>
                        </button>
                        <div className="grid grid-cols-2 gap-2 p-3 bg-white dark:bg-slate-900">
                          {category.permissions.map((permission) => (
                            <label
                              key={permission.id}
                              className={cn(
                                'flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors',
                                formData.permissions.includes(permission.id)
                                  ? 'bg-indigo-50 dark:bg-indigo-500/10'
                                  : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                              )}
                            >
                              <input
                                type="checkbox"
                                checked={formData.permissions.includes(permission.id)}
                                onChange={() => togglePermission(permission.id)}
                                className="w-4 h-4 text-indigo-600 rounded border-slate-300 dark:border-slate-600 focus:ring-indigo-500"
                              />
                              <span className="text-sm text-slate-700 dark:text-slate-300">
                                {permission.name || permission.action}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {/* Other permissions not in categories */}
                  {permissions.filter(
                    (p) =>
                      !groupedPermissions.some((cat) =>
                        cat.permissions.some((cp) => cp.id === p.id)
                      )
                  ).length > 0 && (
                    <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                      <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800">
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          Other Permissions
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 p-3 bg-white dark:bg-slate-900">
                        {permissions
                          .filter(
                            (p) =>
                              !groupedPermissions.some((cat) =>
                                cat.permissions.some((cp) => cp.id === p.id)
                              )
                          )
                          .map((permission) => (
                            <label
                              key={permission.id}
                              className={cn(
                                'flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors',
                                formData.permissions.includes(permission.id)
                                  ? 'bg-indigo-50 dark:bg-indigo-500/10'
                                  : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                              )}
                            >
                              <input
                                type="checkbox"
                                checked={formData.permissions.includes(permission.id)}
                                onChange={() => togglePermission(permission.id)}
                                className="w-4 h-4 text-indigo-600 rounded border-slate-300 dark:border-slate-600 focus:ring-indigo-500"
                              />
                              <span className="text-sm text-slate-700 dark:text-slate-300">
                                {permission.name || permission.action}
                              </span>
                            </label>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </form>

            <div className="flex justify-end gap-3 p-6 border-t border-slate-200 dark:border-slate-700">
              <Button
                type="button"
                onClick={() => setShowModal(false)}
                variant="outline"
                className="border-slate-200 dark:border-slate-700"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isCreating || isUpdating || !formData.name.trim()}
                className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white shadow-lg shadow-indigo-500/25"
              >
                {(isCreating || isUpdating) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {isEditing ? 'Save Changes' : 'Create Role'}
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={() => setShowDeleteConfirm(null)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl shadow-2xl z-50 border border-slate-200 dark:border-slate-700 overflow-hidden">
            {/* Rose gradient accent line */}
            <div className="h-1 w-full bg-gradient-to-r from-rose-500 to-rose-400" />
            
            <div className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-2.5 bg-rose-100 dark:bg-rose-500/20 rounded-xl">
                  <AlertTriangle className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Delete Role</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Are you sure you want to delete this role? Users with this role will lose their
                    permissions. This action cannot be undone.
                  </p>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  onClick={() => setShowDeleteConfirm(null)}
                  variant="outline"
                  className="border-slate-200 dark:border-slate-700"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  disabled={isDeleting}
                  className="bg-rose-600 hover:bg-rose-700 text-white"
                >
                  {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Delete Role
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RolesPermissions;
