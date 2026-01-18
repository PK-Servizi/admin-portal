/**
 * Reports Dashboard Page
 * Generate and view analytics reports
 */

import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useGetDashboardStatsQuery, useGetWorkloadDistributionQuery, type DashboardStats, type WorkloadDistribution } from '@/services/api/admin.api';
import { cn } from '@/lib/utils';
import { format, subDays, subMonths } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Download,
  Loader2,
  RefreshCw,
  Users,
  FileText,
  CreditCard,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  TrendingUp,
  PieChartIcon,
  Activity,
} from 'lucide-react';

const TIME_RANGES = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'thisMonth', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' },
  { value: 'thisYear', label: 'This Year' },
];

export const ReportsDashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const [activeTab, setActiveTab] = useState<'overview' | 'revenue' | 'users' | 'requests'>('overview');

  // API hooks
  const { data: statsData, isLoading, refetch, isFetching } = useGetDashboardStatsQuery();
  const { data: workloadData } = useGetWorkloadDistributionQuery();

  const stats: Partial<DashboardStats> = statsData?.data || {};
  const workload: WorkloadDistribution[] = workloadData?.data || [];

  // Mock data for charts (in real app, this would come from API)
  const revenueData = Array.from({ length: 30 }, (_, i) => ({
    date: format(subDays(new Date(), 29 - i), 'MMM dd'),
    revenue: Math.floor(Math.random() * 5000) + 1000,
    subscriptions: Math.floor(Math.random() * 1000) + 200,
    oneTime: Math.floor(Math.random() * 2000) + 500,
  }));

  const userGrowthData = Array.from({ length: 12 }, (_, i) => ({
    month: format(subMonths(new Date(), 11 - i), 'MMM'),
    newUsers: Math.floor(Math.random() * 100) + 20,
    activeUsers: Math.floor(Math.random() * 500) + 200,
    churned: Math.floor(Math.random() * 20) + 5,
  }));

  const requestsByType = [
    { name: 'Residence Permit', value: 35, color: '#6366f1' },
    { name: 'Work Visa', value: 25, color: '#10b981' },
    { name: 'Family Reunion', value: 20, color: '#f59e0b' },
    { name: 'Business License', value: 12, color: '#8b5cf6' },
    { name: 'Other', value: 8, color: '#64748b' },
  ];

  const requestsByStatus = [
    { name: 'Pending', value: stats.pendingRequests || 0, color: '#f59e0b' },
    { name: 'In Progress', value: 0, color: '#6366f1' },
    { name: 'Completed', value: stats.completedToday || 0, color: '#10b981' },
    { name: 'Total', value: stats.totalServiceRequests || 0, color: '#64748b' },
  ];

  // Calculate percentage change (mock)
  const getPercentChange = () => {
    const change = (Math.random() - 0.3) * 30;
    return {
      percentChange: Math.abs(change).toFixed(1),
      positive: change > 0,
    };
  };

  // Export report
  const handleExport = (format: 'csv' | 'pdf') => {
    // In real app, this would generate and download the report
    console.log(`Exporting report as ${format}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          </div>
          <p className="text-slate-500 dark:text-slate-400">Loading reports...</p>
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
            Reports & Analytics
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            View business insights and generate reports
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
          >
            {TIME_RANGES.map((range) => (
              <option key={range.value} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="icon"
            className="border-slate-200 dark:border-slate-700"
            title="Refresh"
          >
            <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
          </Button>
          <div className="relative group">
            <Button className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white shadow-lg shadow-indigo-500/25">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button
                onClick={() => handleExport('csv')}
                className="w-full px-4 py-2 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-t-lg text-sm"
              >
                Export as CSV
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="w-full px-4 py-2 text-left text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-b-lg text-sm"
              >
                Export as PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700 animate-fade-up" style={{ animationDelay: '50ms' }}>
        <div className="flex space-x-8">
          {([
            { key: 'overview', label: 'Overview', icon: BarChart3 },
            { key: 'revenue', label: 'Revenue', icon: TrendingUp },
            { key: 'users', label: 'Users', icon: Users },
            { key: 'requests', label: 'Requests', icon: FileText },
          ] as const).map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'pb-4 px-1 text-sm font-medium border-b-2 transition-colors flex items-center gap-2',
                  activeTab === tab.key
                    ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                label: 'Total Revenue',
                value: '€45,230',
                icon: DollarSign,
                color: 'emerald',
                ...getPercentChange(),
              },
              {
                label: 'Active Users',
                value: String(stats.totalUsers ?? 0),
                icon: Users,
                color: 'indigo',
                ...getPercentChange(),
              },
              {
                label: 'Service Requests',
                value: String(stats.totalServiceRequests ?? 0),
                icon: FileText,
                color: 'violet',
                ...getPercentChange(),
              },
              {
                label: 'Pending Requests',
                value: String(stats.pendingRequests ?? 0),
                icon: CreditCard,
                color: 'amber',
                ...getPercentChange(),
              },
            ].map((kpi, index) => {
              const Icon = kpi.icon;
              return (
                <Card
                  key={index}
                  className="border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm shadow-soft animate-fade-up"
                  style={{ animationDelay: `${(index + 2) * 50}ms` }}
                >
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={cn(
                          'p-2.5 rounded-xl',
                          kpi.color === 'emerald' && 'bg-emerald-100 dark:bg-emerald-500/20',
                          kpi.color === 'indigo' && 'bg-indigo-100 dark:bg-indigo-500/20',
                          kpi.color === 'violet' && 'bg-violet-100 dark:bg-violet-500/20',
                          kpi.color === 'amber' && 'bg-amber-100 dark:bg-amber-500/20'
                        )}
                      >
                        <Icon
                          className={cn(
                            'h-5 w-5',
                            kpi.color === 'emerald' && 'text-emerald-600 dark:text-emerald-400',
                            kpi.color === 'indigo' && 'text-indigo-600 dark:text-indigo-400',
                            kpi.color === 'violet' && 'text-violet-600 dark:text-violet-400',
                            kpi.color === 'amber' && 'text-amber-600 dark:text-amber-400'
                          )}
                        />
                      </div>
                      <div
                        className={cn(
                          'flex items-center gap-1 text-sm font-medium px-2 py-0.5 rounded-full',
                          kpi.positive 
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' 
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'
                        )}
                      >
                        {kpi.positive ? (
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        ) : (
                          <ArrowDownRight className="h-3.5 w-3.5" />
                        )}
                        {kpi.percentChange}%
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{kpi.value}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{kpi.label}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend */}
            <Card className="border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm shadow-soft animate-fade-up" style={{ animationDelay: '300ms' }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-indigo-500" />
                  Revenue Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#64748b" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderColor: '#e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#6366f1"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Requests by Type */}
            <Card className="border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm shadow-soft animate-fade-up" style={{ animationDelay: '350ms' }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-violet-500" />
                  Requests by Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={requestsByType}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
                      labelLine={false}
                    >
                      {requestsByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderColor: '#e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Operator Workload */}
          <Card className="border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm shadow-soft animate-fade-up" style={{ animationDelay: '400ms' }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-indigo-500" />
                Operator Workload Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={workload}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#64748b" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderColor: '#e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="pending" name="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="inProgress" name="In Progress" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}

      {/* Revenue Tab */}
      {activeTab === 'revenue' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Breakdown */}
            <Card className="lg:col-span-2 border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm shadow-soft animate-fade-up">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-indigo-500" />
                  Revenue Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#64748b" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderColor: '#e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="subscriptions"
                      name="Subscriptions"
                      stackId="a"
                      fill="#6366f1"
                      radius={[0, 0, 0, 0]}
                    />
                    <Bar
                      dataKey="oneTime"
                      name="One-Time"
                      stackId="a"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Revenue Stats */}
            <div className="space-y-4">
              <Card className="border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm shadow-soft animate-fade-up" style={{ animationDelay: '50ms' }}>
                <CardContent className="p-5">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Total Revenue</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">€45,230</p>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    +12.5% from last period
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm shadow-soft animate-fade-up" style={{ animationDelay: '100ms' }}>
                <CardContent className="p-5">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Average Transaction</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">€89</p>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    +5.2% from last period
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm shadow-soft animate-fade-up" style={{ animationDelay: '150ms' }}>
                <CardContent className="p-5">
                  <p className="text-sm text-slate-500 dark:text-slate-400">MRR</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">€12,450</p>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
                    <ArrowUpRight className="h-3.5 w-3.5" />
                    +8.1% from last month
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <Card className="border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm shadow-soft animate-fade-up">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-500" />
                User Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#64748b" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      borderColor: '#e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="newUsers"
                    name="New Users"
                    stroke="#6366f1"
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#6366f1' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="activeUsers"
                    name="Active Users"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#10b981' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="churned"
                    name="Churned"
                    stroke="#f43f5e"
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#f43f5e' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Requests by Status */}
            <Card className="border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm shadow-soft animate-fade-up">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5 text-violet-500" />
                  Requests by Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={requestsByStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {requestsByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderColor: '#e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Processing Time */}
            <Card className="border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm shadow-soft animate-fade-up" style={{ animationDelay: '50ms' }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-indigo-500" />
                  Average Processing Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { type: 'Residence Permit', days: 5.2, target: 7 },
                    { type: 'Work Visa', days: 8.5, target: 10 },
                    { type: 'Family Reunion', days: 12.3, target: 14 },
                    { type: 'Business License', days: 3.1, target: 5 },
                  ].map((item, index) => (
                    <div key={item.type} className="animate-fade-up" style={{ animationDelay: `${(index + 1) * 50}ms` }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-slate-700 dark:text-slate-300">{item.type}</span>
                        <span className="text-sm font-medium text-slate-900 dark:text-white">
                          {item.days} days
                        </span>
                      </div>
                      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all duration-500',
                            item.days <= item.target 
                              ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' 
                              : 'bg-gradient-to-r from-rose-500 to-rose-400'
                          )}
                          style={{ width: `${Math.min((item.days / item.target) * 100, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Target: {item.target} days
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsDashboard;
