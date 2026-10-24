import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Layout
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { AllIssuesPage } from './pages/AllIssuesPage';
import { MyIssuesPage } from './pages/MyIssuesPage';
import { ReportIssuePage } from './pages/ReportIssuePage';
import { IssueDetailsPage } from './pages/IssueDetailsPage';
import { EditIssuePage } from './pages/EditIssuePage';
import { UserManagementPage } from './pages/UserManagementPage';
import { TeamManagementPage } from './pages/TeamManagementPage';
import { CategoriesPrioritiesPage } from './pages/CategoriesPrioritiesPage';
import { ReportsAnalyticsPage } from './pages/ReportsAnalyticsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: string[] }> = ({
  children,
  roles,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Toaster richColors position="top-right" closeButton />
          <Routes>
            {/* Public route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Authenticated routes inside AppLayout */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<DashboardPage />} />
              <Route path="issues" element={<AllIssuesPage />} />
              <Route path="my-issues" element={<MyIssuesPage />} />
              <Route path="issues/new" element={<ReportIssuePage />} />
              <Route path="issues/:id" element={<IssueDetailsPage />} />
              <Route path="issues/:id/edit" element={<EditIssuePage />} />

              {/* Reports & Notifications */}
              <Route path="reports" element={<ReportsAnalyticsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="profile" element={<UserProfilePage />} />

              {/* Management (Admin / Manager) */}
              <Route
                path="users"
                element={
                  <ProtectedRoute roles={['ADMIN']}>
                    <UserManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="teams"
                element={
                  <ProtectedRoute roles={['ADMIN', 'MANAGER']}>
                    <TeamManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="categories"
                element={
                  <ProtectedRoute roles={['ADMIN']}>
                    <CategoriesPrioritiesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="settings"
                element={
                  <ProtectedRoute roles={['ADMIN']}>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* 404 Not Found */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
