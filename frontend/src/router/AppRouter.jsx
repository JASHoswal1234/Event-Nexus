import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Layout Components
import Navbar from '../components/layout/Navbar';
import AdminSidebar from '../components/layout/AdminSidebar';
import PageContainer from '../components/layout/PageContainer';

// Page Components
import LandingPage from '../pages/Landing/LandingPage';
import LoginPage from '../pages/Auth/LoginPage';
import RegisterPage from '../pages/Auth/RegisterPage';
import AdminDashboardPage from '../pages/Admin/AdminDashboardPage';
import AdminEventsPage from '../pages/Admin/AdminEventsPage';
import CreateEventPage from '../pages/Admin/CreateEventPage';
import AdminCreateEventPage from '../pages/Admin/AdminCreateEventPage';
import AdminEventDetailsPage from '../pages/Admin/AdminEventDetailsPage';
import AdminUsersPage from '../pages/Admin/AdminUsersPage';
import AdminTeamsPage from '../pages/Admin/AdminTeamsPage';
import AdminAnnouncementsPage from '../pages/Admin/AdminAnnouncementsPage';
import AdminSettingsPage from '../pages/Admin/AdminSettingsPage';
import ParticipantEventsPage from '../pages/Participant/ParticipantEventsPage';
import ParticipantMyEventsPage from '../pages/Participant/ParticipantMyEventsPage';
import ParticipantEventDetailsPage from '../pages/Participant/ParticipantEventDetailsPage';
import ParticipantProfilePage from '../pages/Participant/ParticipantProfilePage';
import FindTeammatesPage from '../pages/Participant/FindTeammatesPage';
import TeamPage from '../pages/Participant/TeamPage';
import ParticipantTeamPage from '../pages/Participant/ParticipantTeamPage';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, token, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  // Check if user is authenticated (has both token and user data)
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Role-based redirect
  if (requiredRole && user?.role !== requiredRole) {
    // Redirect to appropriate dashboard based on user's actual role
    const redirectPath = user.role === 'admin' ? '/admin/dashboard' : '/participant/events';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

// Public Route Component (redirect if authenticated)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/participant/events'} replace />;
  }

  return children;
};

// Admin Layout Component
const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  
  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1">
        <Navbar user={user} onLogout={logout} />
        <PageContainer>
          {children}
        </PageContainer>
      </div>
    </div>
  );
};

// Participant Layout Component
const ParticipantLayout = ({ children }) => {
  const { user, logout } = useAuth();
  
  return (
    <div>
      <Navbar user={user} onLogout={logout} />
      <PageContainer>
        {children}
      </PageContainer>
    </div>
  );
};

const AppRouter = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        } />
        <Route path="/register" element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout>
              <AdminDashboardPage />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/events" element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout>
              <AdminEventsPage />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/events/create" element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout>
              <CreateEventPage />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/events/:eventId/edit" element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout>
              <AdminCreateEventPage />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/events/:eventId" element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout>
              <AdminEventDetailsPage />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout>
              <AdminUsersPage />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/teams" element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout>
              <AdminTeamsPage />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/announcements" element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout>
              <AdminAnnouncementsPage />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/settings" element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout>
              <AdminSettingsPage />
            </AdminLayout>
          </ProtectedRoute>
        } />

        {/* Participant Routes */}
        <Route path="/participant/events" element={
          <ProtectedRoute requiredRole="participant">
            <ParticipantLayout>
              <ParticipantEventsPage />
            </ParticipantLayout>
          </ProtectedRoute>
        } />
        <Route path="/participant/events/:eventId" element={
          <ProtectedRoute requiredRole="participant">
            <ParticipantLayout>
              <ParticipantEventDetailsPage />
            </ParticipantLayout>
          </ProtectedRoute>
        } />
        <Route path="/participant/find-teammates/:eventId" element={
          <ProtectedRoute requiredRole="participant">
            <ParticipantLayout>
              <FindTeammatesPage />
            </ParticipantLayout>
          </ProtectedRoute>
        } />
        <Route path="/participant/my-events" element={
          <ProtectedRoute requiredRole="participant">
            <ParticipantLayout>
              <ParticipantMyEventsPage />
            </ParticipantLayout>
          </ProtectedRoute>
        } />
        <Route path="/participant/profile" element={
          <ProtectedRoute requiredRole="participant">
            <ParticipantLayout>
              <ParticipantProfilePage />
            </ParticipantLayout>
          </ProtectedRoute>
        } />
        <Route path="/participant/team/:eventId" element={
          <ProtectedRoute requiredRole="participant">
            <ParticipantLayout>
              <TeamPage />
            </ParticipantLayout>
          </ProtectedRoute>
        } />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
  );
};

export default AppRouter;
