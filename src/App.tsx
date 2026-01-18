/**
 * Main App Component
 * Sets up routing and global providers with lazy loading for optimized bundle size
 */

import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthInit } from './hooks';
import { useAppSelector, useAppDispatch } from './store/hooks';
import { selectIsAuthenticated, selectAuthLoading } from './store/slices';
import { setAuthLoading } from './store/slices/authSlice';

// Layout - kept eager as it's always needed
import { AdminLayout } from './components/Layout';

// Auth Components - kept eager for fast initial load
import Login from './components/Auth/Login';

// Lazy loaded pages for code splitting
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const UsersList = lazy(() => import('./pages/Users').then(m => ({ default: m.UsersList })));
const UserDetail = lazy(() => import('./pages/Users').then(m => ({ default: m.UserDetail })));
const UserForm = lazy(() => import('./pages/Users').then(m => ({ default: m.UserForm })));
const ServiceRequestsList = lazy(() => import('./pages/ServiceRequests').then(m => ({ default: m.ServiceRequestsListPage })));
const ServiceRequestDetail = lazy(() => import('./pages/ServiceRequests').then(m => ({ default: m.ServiceRequestDetail })));
const AppointmentsPage = lazy(() => import('./pages/Appointments').then(m => ({ default: m.AppointmentsPage })));
const DocumentsReview = lazy(() => import('./pages/Documents').then(m => ({ default: m.DocumentsReview })));
const PaymentsList = lazy(() => import('./pages/Payments').then(m => ({ default: m.PaymentsList })));
const SubscriptionsList = lazy(() => import('./pages/Subscriptions').then(m => ({ default: m.SubscriptionsList })));
const RolesPermissions = lazy(() => import('./pages/Roles').then(m => ({ default: m.RolesPermissions })));
const ReportsDashboard = lazy(() => import('./pages/Reports').then(m => ({ default: m.ReportsDashboard })));
const AuditLogs = lazy(() => import('./pages/AuditLogs').then(m => ({ default: m.AuditLogs })));
const SettingsPage = lazy(() => import('./pages/Settings').then(m => ({ default: m.SettingsPage })));
const CMSPlaceholder = lazy(() => import('./pages/CMS').then(m => ({ default: m.CMSPlaceholder })));
const CoursesPlaceholder = lazy(() => import('./pages/Courses').then(m => ({ default: m.CoursesPlaceholder })));

// Legacy components (lazy loaded)
const NotificationsList = lazy(() => import('./components/Notifications/NotificationsList'));

/**
 * Loading Spinner Component
 */
const LoadingSpinner: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-600 dark:text-gray-400">Loading...</p>
    </div>
  </div>
);

/**
 * Page Loading Fallback - lighter weight for route transitions
 */
const PageLoader: React.FC = () => (
  <div className="flex items-center justify-center h-full min-h-[400px]">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-slate-500 dark:text-slate-400">Loading page...</p>
    </div>
  </div>
);

/**
 * Error Boundary Component for catching lazy loading errors
 */
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Page Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <div className="text-center p-8 max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Something went wrong</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              {this.state.error?.message || 'Failed to load this page'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Protected Route Component
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectAuthLoading);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

/**
 * Main App Component
 */
function App() {
  const dispatch = useAppDispatch();
  const { isLoading } = useAuthInit();

  useEffect(() => {
    dispatch(setAuthLoading(isLoading));
  }, [isLoading, dispatch]);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />

      {/* Protected routes with AdminLayout */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AdminLayout>
              <ErrorBoundary>
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    {/* Dashboard */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Dashboard />} />

                    {/* Users Management */}
                    <Route path="/users" element={<UsersList />} />
                    <Route path="/users/new" element={<UserForm />} />
                    <Route path="/users/:id" element={<UserDetail />} />
                    <Route path="/users/:id/edit" element={<UserForm />} />

                    {/* Service Requests */}
                    <Route path="/service-requests" element={<ServiceRequestsList />} />
                    <Route path="/service-requests/:id" element={<ServiceRequestDetail />} />

                  {/* Appointments */}
                  <Route path="/appointments" element={<AppointmentsPage />} />

                  {/* Subscriptions */}
                  <Route path="/subscriptions" element={<SubscriptionsList />} />

                  {/* Payments */}
                  <Route path="/payments" element={<PaymentsList />} />

                  {/* Documents Review */}
                  <Route path="/documents" element={<DocumentsReview />} />

                  {/* Notifications */}
                  <Route path="/notifications" element={<NotificationsList />} />

                  {/* CMS */}
                  <Route path="/cms" element={<CMSPlaceholder />} />

                  {/* Courses */}
                  <Route path="/courses" element={<CoursesPlaceholder />} />

                  {/* Roles & Permissions */}
                  <Route path="/roles" element={<RolesPermissions />} />

                  {/* Reports */}
                  <Route path="/reports" element={<ReportsDashboard />} />

                  {/* Audit Logs */}
                  <Route path="/audit" element={<AuditLogs />} />

                  {/* Settings */}
                  <Route path="/settings" element={<SettingsPage />} />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                </Suspense>
              </ErrorBoundary>
            </AdminLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;
