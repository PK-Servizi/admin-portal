/**
 * Back Office User Detail Page
 * View BO user info, assigned services, customers, and invoices
 */

import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  useGetBackOfficeUserQuery,
  useGetBackOfficeUserServicesQuery,
  useGetBackOfficeCustomersQuery,
  useGetInvoicesQuery,
} from '@/services/api/backoffice-admin.api';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  Briefcase,
  Users,
  Mail,
  Phone,
  Calendar,
  Edit,
  Loader2,
  AlertCircle,
  CreditCard,
} from 'lucide-react';

export const BackOfficeUserDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'services' | 'customers' | 'invoices'>('services');

  const { data: userData, isLoading } = useGetBackOfficeUserQuery(id!);
  const { data: servicesData } = useGetBackOfficeUserServicesQuery(id!);
  const { data: customersData } = useGetBackOfficeCustomersQuery({ userId: id!, take: 20 });
  const { data: invoicesData } = useGetInvoicesQuery({ backOfficeUserId: id!, take: 20 });

  const user = userData?.data;
  const services = servicesData?.data || [];
  const customers = customersData?.data || [];
  const invoices = invoicesData?.data || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">User not found</h2>
        <Link
          to="/backoffice"
          className="mt-4 text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
        >
          Back to Back Office Users
        </Link>
      </div>
    );
  }

  const tabs = [
    { key: 'services' as const, label: 'Assigned Services', count: services.length, icon: Briefcase },
    { key: 'customers' as const, label: 'Customers', count: customersData?.pagination?.total || 0, icon: Users },
    { key: 'invoices' as const, label: 'Invoices', count: invoicesData?.pagination?.total || 0, icon: CreditCard },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/backoffice')}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim()}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Back Office User
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={`/backoffice/${id}/invoices/new`}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <CreditCard className="h-4 w-4" />
            Create Invoice
          </Link>
          <Link
            to={`/users/${id}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Link>
        </div>
      </div>

      {/* User Info Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Phone</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user.phone || user.phoneNumber || 'N/A'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Created</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {new Date(user.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Status</p>
            <span
              className={cn(
                'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1',
                user.isActive
                  ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                  : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
              )}
            >
              {user.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'flex items-center gap-2 pb-3 border-b-2 text-sm font-medium transition-colors',
                activeTab === tab.key
                  ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
              <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full">
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        {activeTab === 'services' && (
          <div className="p-6">
            {services.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                No services assigned yet
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {services.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <Briefcase className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    <span className="text-sm text-gray-900 dark:text-white truncate">
                      {s.service?.name || s.name || s.serviceId?.slice(0, 8) || s.id?.slice(0, 8)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="overflow-x-auto">
            {customers.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8 px-6">
                No customers created yet
              </p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Name</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Fiscal Code</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Email</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Type</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-3 text-sm text-gray-900 dark:text-white">
                        {c.firstName} {c.lastName}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-300 font-mono">
                        {c.fiscalCode}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {c.email || 'N/A'}
                      </td>
                      <td className="px-6 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 capitalize">
                          {c.customerType}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'invoices' && (
          <div className="overflow-x-auto">
            {invoices.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8 px-6">
                No invoices created yet
              </p>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">ID</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Amount</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Description</th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-3 text-sm text-gray-900 dark:text-white font-mono">
                        #{inv.id.slice(0, 8)}
                      </td>
                      <td className="px-6 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        €{Number(inv.amount).toFixed(2)}
                      </td>
                      <td className="px-6 py-3">
                        <span
                          className={cn(
                            'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                            inv.status === 'paid'
                              ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                              : inv.status === 'cancelled'
                              ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400'
                          )}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate">
                        {inv.description || '-'}
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(inv.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BackOfficeUserDetail;
