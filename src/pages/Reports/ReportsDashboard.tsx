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
import {
  useGetRevenueReportsQuery,
  useGetServiceRequestMetricsQuery,
  useGetUserStatisticsQuery,
  useGetSubscriptionMetricsQuery,
  useExportReportDataMutation,
} from '@/services/api/reports.api';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
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
  const { data: revenueResponse } = useGetRevenueReportsQuery();
  const { data: requestMetricsResponse } = useGetServiceRequestMetricsQuery();
  const { data: userStatsResponse } = useGetUserStatisticsQuery();
  const { data: subscriptionResponse } = useGetSubscriptionMetricsQuery();
  const [exportReport, { isLoading: isExporting }] = useExportReportDataMutation();

  const stats: Partial<DashboardStats> = statsData?.data || {};
  const workload: WorkloadDistribution[] = workloadData?.data || [];
  const revenueMetrics = revenueResponse?.data;
  const requestMetrics = requestMetricsResponse?.data;
  const userStats = userStatsResponse?.data;
  const subscriptionMetrics = subscriptionResponse?.data;

  // Chart colors palette
  const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#8b5cf6', '#f43f5e', '#64748b', '#06b6d4', '#ec4899'];

  // Revenue trend chart data from API
  // Backend returns today/thisMonth/thisYear, not trendData array
  const revenueData = revenueMetrics?.trendData
    ? revenueMetrics.trendData.map((d: any) => ({
        date: format(new Date(d.date), 'MMM dd'),
        revenue: d.amount,
      }))
    : revenueMetrics
      ? [
          { date: 'Today', revenue: revenueMetrics.today || 0 },
          { date: 'This Month', revenue: revenueMetrics.thisMonth || 0 },
          { date: 'This Year', revenue: revenueMetrics.thisYear || 0 },
        ]
      : [];

  // User growth chart data from API
  // Backend returns total/active/inactive/byRole, not registrationTrend
  const userGrowthData = userStats?.registrationTrend
    ? userStats.registrationTrend.map((d: any) => ({
        month: format(new Date(d.date), 'MMM'),
        newUsers: d.count,
        activeUsers: userStats?.active || 0,
        churned: userStats?.inactive || 0,
      }))
    : userStats
      ? [{ month: 'Current', newUsers: userStats.total || 0, activeUsers: userStats.active || 0, churned: userStats.inactive || 0 }]
      : [];

  // Requests by type from API
  // Backend returns byType array [{type, count}], not byServiceType object
  const requestsByType = (requestMetrics?.byServiceType
    ? Object.entries(requestMetrics.byServiceType).map(([name, value]: [string, any], i: number) => ({
        name,
        value,
        color: CHART_COLORS[i % CHART_COLORS.length],
      }))
    : (requestMetrics?.byType || []).map((item: any, i: number) => ({
        name: item.type || 'Unknown',
        value: item.count || 0,
        color: CHART_COLORS[i % CHART_COLORS.length],
      })));

  // Backend returns byStatus array [{status, count}], not byStatus object
  const requestsByStatus = (requestMetrics?.byStatus && !Array.isArray(requestMetrics.byStatus)
    ? Object.entries(requestMetrics.byStatus).map(([name, value]: [string, any], i: number) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, ' '),
        value,
        color: CHART_COLORS[i % CHART_COLORS.length],
      }))
    : (Array.isArray(requestMetrics?.byStatus) ? requestMetrics.byStatus : []).map((item: any, i: number) => ({
        name: (item.status || 'Unknown').charAt(0).toUpperCase() + (item.status || '').slice(1).replace(/_/g, ' '),
        value: item.count || 0,
        color: CHART_COLORS[i % CHART_COLORS.length],
      })));

  // Export report
  const handleExport = (fmt: 'csv' | 'pdf') => {
    exportReport({ reportType: activeTab, format: fmt });
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
            <Button className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white shadow-lg shadow-indigo-500/25" disabled={isExporting}>
              {isExporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
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
                value: revenueMetrics ? `€${(revenueMetrics.total ?? revenueMetrics.thisYear ?? 0).toLocaleString()}` : '€0',
                icon: DollarSign,
                color: 'emerald',
              },
              {
                label: 'Active Users',
                value: String(userStats?.active ?? stats.totalUsers ?? 0),
                icon: Users,
                color: 'indigo',
              },
              {
                label: 'Service Requests',
                value: String(requestMetrics?.total ?? stats.totalServiceRequests ?? 0),
                icon: FileText,
                color: 'violet',
              },
              {
                label: 'Active Subscriptions',
                value: String(subscriptionMetrics?.activeSubscriptions ?? subscriptionMetrics?.activeCount ?? 0),
                icon: CreditCard,
                color: 'amber',
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
                      {requestsByType.map((entry: any, index: number) => (
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
                  {/* name from workload or operatorName from backend */}
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
                  <Bar dataKey="requestCount" name="Requests" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
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
                      dataKey="revenue"
                      name="Revenue"
                      fill="#6366f1"
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
                  <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">€{(revenueMetrics?.total ?? revenueMetrics?.thisYear ?? 0).toLocaleString()}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                    This year: €{(revenueMetrics?.thisYear || 0).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm shadow-soft animate-fade-up" style={{ animationDelay: '100ms' }}>
                <CardContent className="p-5">
                  <p className="text-sm text-slate-500 dark:text-slate-400">This Month</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">€{(revenueMetrics?.thisMonth || 0).toLocaleString()}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                    This week: €{(revenueMetrics?.thisWeek || 0).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm shadow-soft animate-fade-up" style={{ animationDelay: '150ms' }}>
                <CardContent className="p-5">
                  <p className="text-sm text-slate-500 dark:text-slate-400">MRR</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">€{(subscriptionMetrics?.monthlyRecurringRevenue || 0).toLocaleString()}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                    {subscriptionMetrics?.activeSubscriptions ?? subscriptionMetrics?.activeCount ?? 0} active subscriptions
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
                      {requestsByStatus.map((entry: any, index: number) => (
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
                <div className="space-y-6">
                  <div className="text-center p-6">
                    <p className="text-4xl font-bold text-slate-900 dark:text-white">
                      {requestMetrics?.averageProcessingTime?.toFixed(1) || '—'} days
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                      Average across all service types
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Completion rate: {((requestMetrics?.completionRate || 0) * 100).toFixed(1)}%
                    </p>
                  </div>
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
