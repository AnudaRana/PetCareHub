import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from '../../assets/logo-w.png';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import './Dashboard.css';

const DashboardLayout = ({ children, menuItems }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  const getInitials = (email) => {
    if (!email) return 'U';
    return email.substring(0, 2).toUpperCase();
  };

  const getUserName = () => {
    if (user?.fullName) return user.fullName;
    return user?.email ? user.email.split('@')[0] : 'User';
  };

  return (
    <div className="dashboard-container">

      <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
        <MenuIcon />
      </button>

      <div
        className={`sidebar-overlay ${mobileOpen ? 'mobile-open' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      <div className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
          <div>
            <div className="sidebar-header">
              <img src={Logo} alt='Logo' className="logo" />
              <div className="sidebar-header-text">
                <span className="sidebar-title">PetCareHub</span>
                <span className="sidebar-subtitle">Dashboard</span>
              </div>
            </div>

            <ul>
              {menuItems.map((item) => {
                // For the home icon routing to '/', we want an exact match, but actually
                // the location.pathname is what defines active status for dashboards.
                // The dashboard itself is mounted at '/dashboard' for the owner home view.
                let isActive = false;
                if (item.path === '/dashboard') {
                  // only active if exactly /dashboard
                  isActive = location.pathname === '/dashboard';
                } else if (item.path === '/') {
                  // if we're somehow at exactly root (landing page), but sidebar isn't usually there
                  isActive = location.pathname === '/';
                } else {
                  // for /dashboard/profile, /dashboard/pets, etc
                  isActive = location.pathname.startsWith(item.path);
                }

                // Workaround for the bug where "every element except the one that's selected has a highlight"
                // The issue actually originates from the OwnerDashboard array setup, but let's make sure
                // the isActive check is exact string match.
                isActive = location.pathname === item.path;

                // If it's the specific landing page dashboard home it can be tricky.
                if (item.name === 'Home') {
                  // This item navigates outside the dashboard to the marketing wrapper '/'
                  // It shouldn't be "active" while in the dashboard.
                  isActive = false;
                }

                return (
                  <li
                    key={item.name}
                    className={isActive ? 'active' : ''}
                    onClick={() => {
                      navigate(item.path);
                      setMobileOpen(false); // Close mobile menu on click
                    }}
                  >
                    <item.icon className="dashboard-icon" />
                    {item.name}
                    {/* The Teal Dot for Active State */}
                    {isActive && <FiberManualRecordIcon className="active-dot" style={{ fontSize: '12px' }} />}
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Sidebar Footer: User Details & Logout */}
          <div className="sidebar-footer">
            <div className="user-profile-card">
              <div className="initials-box" style={{ overflow: 'hidden' }}>
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  getInitials(user?.email)
                )}
              </div>
              <div className="user-details">
                <span className="user-name">{getUserName()}</span>
                <span className="user-email">{user?.email || 'email@example.com'}</span>
              </div>
            </div>
            
            <div className="logout-container">
              <button className="logout-btn" onClick={handleLogout}>
                <LogoutIcon style={{ fontSize: '18px' }} />
                Logout
              </button>
            </div>
          </div>

        </div>
      </div>

      <div className="dashboard-content">
        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;