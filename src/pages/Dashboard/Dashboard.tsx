/**
 * Dashboard Page
 * Main admin dashboard with stats, charts, and activity feed
 * Redesigned with modern aesthetic - gradients, shadows, animations
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  useGetDashboardStatsQuery,
  useGetPendingCountQuery,
  useGetWorkloadDistributionQuery,
} from '@/services/api/admin.api';
import { cn } from '@/lib/utils';
import {
  Users,
  ClipboardList,
  Clock,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  DollarSign,
  Calendar,
  FileText,
  AlertCircle,
  Loader2,
  Sparkles,
  Activity,
  ArrowUpRight,
  BarChart3,
  Bell,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

// Mock data for charts (will be replaced with real API data)
const revenueData = [
  { month: 'Jan', revenue: 4000 },
  { month: 'Feb', revenue: 3000 },
  { month: 'Mar', revenue: 5000 },
  { month: 'Apr', revenue: 4500 },
  { month: 'May', revenue: 6000 },
  { month: 'Jun', revenue: 5500 },
  { month: 'Jul', revenue: 7000 },
];

// Updated with indigo palette colors
const requestsByStatus = [
  { name: 'Pending', value: 35, color: '#f59e0b' },
  { name: 'In Progress', value: 25, color: '#6366f1' },
  { name: 'Completed', value: 30, color: '#10b981' },
  { name: 'Cancelled', value: 10, color: '#ef4444' },
];

const requestsOverTime = [
  { day: 'Mon', requests: 12 },
  { day: 'Tue', requests: 19 },
  { day: 'Wed', requests: 15 },
  { day: 'Thu', requests: 22 },
  { day: 'Fri', requests: 18 },
  { day: 'Sat', requests: 8 },
  { day: 'Sun', requests: 5 },
];

// Chart colors matching our design system
const CHART_COLORS = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  gradient: {
    from: '#6366f1',
    to: '#8b5cf6',
  },
};

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  variant?: 'indigo' | 'violet' | 'emerald' | 'amber' | 'rose';
  link?: string;
  delay?: number;
}

const variantStyles = {
  indigo: {
    iconBg: 'bg-indigo-100 dark:bg-indigo-500/20',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
    shadow: 'hover:shadow-indigo/20',
    glow: 'group-hover:shadow-indigo',
  },
  violet: {
    iconBg: 'bg-violet-100 dark:bg-violet-500/20',
    iconColor: 'text-violet-600 dark:text-violet-400',
    shadow: 'hover:shadow-violet/20',
    glow: 'group-hover:shadow-violet',
  },
  emerald: {
    iconBg: 'bg-emerald-100 dark:bg-emerald-500/20',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    shadow: 'hover:shadow-emerald/20',
    glow: 'group-hover:shadow-emerald',
  },
  amber: {
    iconBg: 'bg-amber-100 dark:bg-amber-500/20',
    iconColor: 'text-amber-600 dark:text-amber-400',
    shadow: 'hover:shadow-amber/20',
    glow: 'group-hover:shadow-amber',
  },
  rose: {
    iconBg: 'bg-rose-100 dark:bg-rose-500/20',
    iconColor: 'text-rose-600 dark:text-rose-400',
    shadow: 'hover:shadow-rose/20',
    glow: 'group-hover:shadow-rose',
  },
};

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  changeLabel,
  icon,
  variant = 'indigo',
  link,
  delay = 0,
}) => {
  const styles = variantStyles[variant];
  
  const content = (
    <Card 
      className={cn(
        'group relative overflow-hidden border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm',
        'shadow-soft hover:shadow-lg transition-all duration-300',
        'animate-fade-up',
        styles.shadow
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardContent className="p-6 relative">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2 tracking-tight">
              {value}
            </p>
            {change !== undefined && (
              <div className="flex items-center mt-3 gap-1.5">
                <div className={cn(
                  'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold',
                  change >= 0 
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' 
                    : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'
                )}>
                  {change >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {change >= 0 ? '+' : ''}{change}%
                </div>
                {changeLabel && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {changeLabel}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className={cn(
            'p-3 rounded-xl transition-all duration-300',
            styles.iconBg,
            styles.iconColor,
            'group-hover:scale-110'
          )}>
            {icon}
          </div>
        </div>
        
        {link && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700">
            <span className="text-sm font-medium text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
              View details
              <ArrowRight className="h-4 w-4" />
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (link) {
    return <Link to={link} className="block">{content}</Link>;
  }

  return content;
};

interface QuickActionCardProps {
  title: string;
  description: string;
  count: number;
  icon: React.ReactNode;
  variant?: 'orange' | 'red' | 'blue' | 'indigo';
  link: string;
  delay?: number;
}

const quickActionVariants = {
  orange: {
    iconBg: 'bg-gradient-to-br from-amber-400 to-orange-500',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
    hover: 'hover:border-amber-300 dark:hover:border-amber-600',
  },
  red: {
    iconBg: 'bg-gradient-to-br from-rose-400 to-red-500',
    badge: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400',
    hover: 'hover:border-rose-300 dark:hover:border-rose-600',
  },
  blue: {
    iconBg: 'bg-gradient-to-br from-blue-400 to-blue-600',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
    hover: 'hover:border-blue-300 dark:hover:border-blue-600',
  },
  indigo: {
    iconBg: 'bg-gradient-to-br from-indigo-400 to-indigo-600',
    badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400',
    hover: 'hover:border-indigo-300 dark:hover:border-indigo-600',
  },
};

const QuickActionCard: React.FC<QuickActionCardProps> = ({
  title,
  description,
  count,
  icon,
  variant = 'indigo',
  link,
  delay = 0,
}) => {
  const styles = quickActionVariants[variant];
  
  return (
    <Link
      to={link}
      className={cn(
        'group flex items-center gap-4 p-4',
        'bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm',
        'rounded-xl border border-slate-200/60 dark:border-slate-700/60',
        'shadow-soft hover:shadow-lg transition-all duration-300',
        'animate-fade-up',
        styles.hover
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={cn(
        'p-3 rounded-xl text-white shadow-lg',
        styles.iconBg
      )}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
          <Badge className={cn('font-bold', styles.badge)}>
            {count}
          </Badge>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400 truncate mt-0.5">{description}</p>
      </div>
      <ArrowUpRight className="h-5 w-5 text-slate-400 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
    </Link>
  );
};

interface ActivityItem {
  id: string;
  type: 'request' | 'user' | 'payment' | 'document';
  title: string;
  description: string;
  time: string;
}

const recentActivity: ActivityItem[] = [
  {
    id: '1',
    type: 'request',
    title: 'New Service Request',
    description: 'John Doe submitted a new visa application',
    time: '2 minutes ago',
  },
  {
    id: '2',
    type: 'payment',
    title: 'Payment Received',
    description: 'Payment of €150 received from Maria Rossi',
    time: '15 minutes ago',
  },
  {
    id: '3',
    type: 'document',
    title: 'Document Uploaded',
    description: 'ID verification document uploaded by Carlo Bianchi',
    time: '1 hour ago',
  },
  {
    id: '4',
    type: 'user',
    title: 'New User Registration',
    description: 'Anna Verdi created a new account',
    time: '2 hours ago',
  },
  {
    id: '5',
    type: 'request',
    title: 'Request Completed',
    description: 'Tax assistance request marked as completed',
    time: '3 hours ago',
  },
];

const getActivityIcon = (type: ActivityItem['type']) => {
  switch (type) {
    case 'request':
      return <ClipboardList className="h-4 w-4" />;
    case 'user':
      return <Users className="h-4 w-4" />;
    case 'payment':
      return <DollarSign className="h-4 w-4" />;
    case 'document':
      return <FileText className="h-4 w-4" />;
    default:
      return <AlertCircle className="h-4 w-4" />;
  }
};

const getActivityColor = (type: ActivityItem['type']) => {
  switch (type) {
    case 'request':
      return 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400';
    case 'user':
      return 'bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400';
    case 'payment':
      return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400';
    case 'document':
      return 'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400';
    default:
      return 'bg-slate-100 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400';
  }
};

export const Dashboard: React.FC = () => {
  const { data: statsData, isLoading: statsLoading } = useGetDashboardStatsQuery();
  const { data: pendingData, isLoading: pendingLoading } = useGetPendingCountQuery();
  const { data: workloadData, isLoading: workloadLoading } = useGetWorkloadDistributionQuery();

  const stats = statsData?.data;
  const pending = pendingData?.data;
  const workload = workloadData?.data || [];

  const isLoading = statsLoading || pendingLoading || workloadLoading;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
          <Loader2 className="h-12 w-12 animate-spin text-primary relative" />
        </div>
        <p className="text-slate-500 dark:text-slate-400 animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-500/25">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
              <p className="text-slate-500 dark:text-slate-400">
                Welcome back! Here&apos;s what&apos;s happening today.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-soft border border-slate-200/60 dark:border-slate-700/60 animate-fade-in">
          <Activity className="h-4 w-4 text-emerald-500" />
          <span className="text-sm text-slate-500 dark:text-slate-400">Last updated:</span>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats?.totalUsers?.toLocaleString() || '0'}
          change={12}
          changeLabel="vs last month"
          icon={<Users className="h-6 w-6" />}
          variant="indigo"
          link="/users"
          delay={0}
        />
        <StatCard
          title="Service Requests"
          value={stats?.totalServiceRequests?.toLocaleString() || '0'}
          change={8}
          changeLabel="vs last month"
          icon={<ClipboardList className="h-6 w-6" />}
          variant="violet"
          link="/service-requests"
          delay={50}
        />
        <StatCard
          title="Pending Requests"
          value={stats?.pendingRequests || pending?.pending || 0}
          icon={<Clock className="h-6 w-6" />}
          variant="amber"
          link="/service-requests?status=pending"
          delay={100}
        />
        <StatCard
          title="Completed Today"
          value={stats?.completedToday || 0}
          change={15}
          changeLabel="vs yesterday"
          icon={<CheckCircle className="h-6 w-6" />}
          variant="emerald"
          delay={150}
        />
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title="Today's Revenue"
          value={`€${stats?.revenue?.today?.toLocaleString() || '0'}`}
          icon={<DollarSign className="h-6 w-6" />}
          variant="emerald"
          link="/payments"
          delay={200}
        />
        <StatCard
          title="This Month"
          value={`€${stats?.revenue?.thisMonth?.toLocaleString() || '0'}`}
          change={22}
          changeLabel="vs last month"
          icon={<TrendingUp className="h-6 w-6" />}
          variant="indigo"
          delay={250}
        />
        <StatCard
          title="This Year"
          value={`€${stats?.revenue?.thisYear?.toLocaleString() || '0'}`}
          icon={<Calendar className="h-6 w-6" />}
          variant="violet"
          delay={300}
        />
      </div>

      {/* Quick Actions */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Quick Actions
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <QuickActionCard
            title="Pending Requests"
            description="Requests awaiting action"
            count={pending?.pending || 0}
            icon={<Clock className="h-5 w-5 text-white" />}
            variant="orange"
            link="/service-requests?status=pending"
            delay={0}
          />
          <QuickActionCard
            title="Missing Documents"
            description="Requests needing documents"
            count={pending?.missingDocuments || 0}
            icon={<FileText className="h-5 w-5 text-white" />}
            variant="red"
            link="/documents"
            delay={50}
          />
          <QuickActionCard
            title="Today's Appointments"
            description="Scheduled for today"
            count={5}
            icon={<Calendar className="h-5 w-5 text-white" />}
            variant="blue"
            link="/appointments"
            delay={100}
          />
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-soft animate-fade-up" style={{ animationDelay: '350ms' }}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/20">
                <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              Revenue Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                  }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke={CHART_COLORS.primary}
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

        {/* Requests by Status Chart */}
        <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-soft animate-fade-up" style={{ animationDelay: '400ms' }}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
              <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-500/20">
                <ClipboardList className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              </div>
              Requests by Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-between gap-4">
              <div className="flex-1 h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={requestsByStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {requestsByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: 'none',
                        borderRadius: '12px',
                        color: '#fff',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-3">
                {requestsByStatus.map((item) => (
                  <div key={item.name} className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full shadow-sm"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                      {item.name}
                    </span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white ml-auto">
                      {item.value}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Requests Over Time */}
        <Card className="lg:col-span-2 border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-soft animate-fade-up" style={{ animationDelay: '450ms' }}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
              <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-500/20">
                <BarChart3 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              Requests This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={requestsOverTime}>
                  <defs>
                    <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CHART_COLORS.secondary} stopOpacity={1} />
                      <stop offset="100%" stopColor={CHART_COLORS.primary} stopOpacity={1} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#fff',
                      boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                    }}
                    cursor={{ fill: 'rgba(99, 102, 241, 0.1)' }}
                  />
                  <Bar 
                    dataKey="requests" 
                    fill="url(#colorBar)" 
                    radius={[8, 8, 0, 0]}
                    maxBarSize={50}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-soft animate-fade-up" style={{ animationDelay: '500ms' }}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-500/20">
                  <Bell className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                </div>
                Recent Activity
              </CardTitle>
              <Button variant="ghost" size="sm" asChild className="text-primary hover:text-primary/80">
                <Link to="/audit">
              View all
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div 
                  key={activity.id} 
                  className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group"
                >
                  <div className={cn(
                    'p-2 rounded-xl transition-transform group-hover:scale-110',
                    getActivityColor(activity.type)
                  )}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {activity.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {activity.description}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Operator Workload */}
      {workload.length > 0 && (
        <Card className="border-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-soft animate-fade-up" style={{ animationDelay: '550ms' }}>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-white">
              <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-500/20">
                <Users className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              Operator Workload Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {workload.map((operator, index) => (
                <div
                  key={operator.operatorId}
                  className="group p-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700/50 dark:to-slate-800/50 rounded-xl hover:shadow-lg transition-all duration-300 animate-fade-up"
                  style={{ animationDelay: `${600 + index * 50}ms` }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-10 w-10 border-2 border-white dark:border-slate-700 shadow-md">
                      <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-500 text-white text-sm font-semibold">
                        {operator.operatorName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'OP'}
                      </AvatarFallback>
                    </Avatar>
                    <p className="font-semibold text-slate-900 dark:text-white truncate">
                      {operator.operatorName}
                    </p>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                        {operator.requestCount}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        Active requests
                      </p>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-primary">
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
