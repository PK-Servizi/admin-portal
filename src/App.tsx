/**
 * Main App Component
 * Sets up routing and global providers
 */

import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthInit } from './hooks';
import { useAppSelector, useAppDispatch } from './store/hooks';
import { selectIsAuthenticated, selectAuthLoading } from './store/slices';
import { setAuthLoading } from './store/slices/authSlice';

// Components
import Login from './components/Auth/Login';
import ServiceRequestsList from './components/ServiceRequests/ServiceRequestsList';
import NotificationsList from './components/Notifications/NotificationsList';
import SubscriptionPlans from './components/Subscriptions/SubscriptionPlans';

/**
 * Protected Route Component
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectAuthLoading);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

/**
 * App Layout Component
 */
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="app-layout">
      <header className="app-header">
        <nav>
          <a href="/dashboard">Dashboard</a>
          <a href="/service-requests">Service Requests</a>
          <a href="/appointments">Appointments</a>
          <a href="/notifications">Notifications</a>
          <a href="/subscription">Subscription</a>
        </nav>
      </header>
      <main className="app-main">{children}</main>
    </div>
  );
};

/**
 * Main App Component
 */
function App() {
  const dispatch = useAppDispatch();
  const { user, isLoading } = useAuthInit();

  useEffect(() => {
    // Set loading state based on auth init
    dispatch(setAuthLoading(isLoading));
  }, [isLoading, dispatch]);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      
      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout>
              <div>
                <h1>Dashboard</h1>
                <p>Welcome {user?.firstName}!</p>
              </div>
            </AppLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/service-requests"
        element={
          <ProtectedRoute>
            <AppLayout>
              <ServiceRequestsList />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <AppLayout>
              <NotificationsList />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      
      <Route
        path="/subscription"
        element={
          <ProtectedRoute>
            <AppLayout>
              <SubscriptionPlans />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
