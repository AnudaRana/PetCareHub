import React from 'react';
import { useAuth } from '../../auth/contexts/AuthContext';
import OwnerDashboard from './OwnerDashboard';
import VetDashboard from './VetDashboard';
import StaffDashboard from './StaffDashboard';
import AdminDashboard from './AdminDashboard';

/**
 * Picks the my_code-style role dashboard shell (sidebar + layout) after login at /dashboard.
 */
const RoleDashboard = () => {
  const { user, loading, hasRole } = useAuth();

  if (loading) {
    return <div className="loading-state" style={{ padding: '2rem' }}>Loading dashboard…</div>;
  }
  if (!user) {
    return null;
  }

  if (hasRole('ADMIN')) {
    return <AdminDashboard />;
  }
  if (hasRole('VET')) {
    return <VetDashboard />;
  }
  if (hasRole('STAFF')) {
    return <StaffDashboard />;
  }
  if (hasRole('OWNER')) {
    return <OwnerDashboard />;
  }

  return <OwnerDashboard />;
};

export default RoleDashboard;
