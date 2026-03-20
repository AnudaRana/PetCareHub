import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import Navbar from './components/navbar/Navbar';
import Footer from './components/footer/Footer';
import Home from './pages/home/Home.jsx';
import Login from './pages/loginSignup/access/Login';
import SignUp from './pages/loginSignup/access/SignUp';
import ResetPassword from './pages/loginSignup/passwordreset/ResetPassword';
import ForgotPasswordEmail from './pages/loginSignup/passwordreset/ForgotPasswordEmail';
import ForgotPasswordOtp from './pages/loginSignup/passwordreset/ForgotPasswordOtp';
import OwnerDashboard from './pages/dashboard/OwnerDashboard';
import VetDashboard from './pages/dashboard/VetDashboard';
import StaffDashboard from './pages/dashboard/StaffDashboard';
import AdminDashboard from './pages/dashboard/AdminDashboard';
import ManageStaff from './pages/manageStaff/ManageStaff';
import MyProfile from './pages/profile/MyProfile';

import { AuthProvider, useAuth } from './context/AuthContext';

const Layout = ({ children }) => {
  const location = useLocation();
  const hideLayout = ['/login', '/signup', '/reset', '/forgot-password', '/verify-otp'].includes(location.pathname) || location.pathname.startsWith('/dashboard');

  return (
    <>
      {!hideLayout && <Navbar />}
      {children}
      {!hideLayout && <Footer />}
    </>
  );
}

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, hasRole, token } = useAuth();

  if (!token) return <Navigate to="/login" replace />;
  if (requiredRole && !hasRole(requiredRole)) return <Navigate to="/dashboard" replace />;

  return children;
};

const DashboardRouter = () => {
  const { hasRole } = useAuth();

  if (hasRole('ADMIN')) return <AdminDashboard />;     // admin sees admin panel
  if (hasRole('VET')) return <VetDashboard />;       // normal vet
  if (hasRole('STAFF')) return <StaffDashboard />;
  if (hasRole('OWNER')) return <OwnerDashboard />;

  return <Navigate to="/" replace />;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />

            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPasswordEmail />} />
            <Route path="/verify-otp" element={<ForgotPasswordOtp />} />
            <Route path="/reset" element={<ResetPassword />} />

            {/* One dashboard route — component decides view */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardRouter />
                </ProtectedRoute>
              }
            />

            {/* Optional: explicit role routes if you want separate URLs */}
            <Route path="/dashboard/admin" element={<ProtectedRoute requiredRole="ADMIN"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/dashboard/vet" element={<ProtectedRoute requiredRole="VET"><VetDashboard /></ProtectedRoute>} />

            {/* Admin Management Pages */}
            <Route path="/dashboard/manage-staff" element={<ProtectedRoute requiredRole="ADMIN"><ManageStaff /></ProtectedRoute>} />
            <Route path="/dashboard/profile" element={<ProtectedRoute><MyProfile /></ProtectedRoute>} />

            <Route path="/dashboard/*" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
};

export default App;