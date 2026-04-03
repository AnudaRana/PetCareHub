import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/contexts/AuthContext';
import Logo from '../../../assets/logo-w.png';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
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

  // Close mobile menu if window is resized to desktop width
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1000) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
            <div className="sidebar-header">
              <img src={Logo} alt='Logo' className="logo" />
              <div className="sidebar-header-text">
                <span className="sidebar-title">PetCareHub</span>
              </div>
              <button className="sidebar-close-btn" onClick={() => setMobileOpen(false)}>
                <CloseIcon />
              </button>
            </div>

            <ul style={{ flex: 1, overflowY: 'auto', paddingBottom: '20px' }}>
              {menuItems.map((item) => {

                let isActive = false;
                if (item.path === '/dashboard') {

                  isActive = location.pathname === '/dashboard';
                } else if (item.path === '/') {

                  isActive = location.pathname === '/';
                } else {

                  isActive = location.pathname.startsWith(item.path);
                }

                isActive = location.pathname === item.path;


                if (item.name === 'Home') {
                  isActive = false;
                }

                return (
                  <li
                    key={item.name}
                    className={isActive ? 'active' : ''}
                    onClick={() => {
                      navigate(item.path);
                      setMobileOpen(false);
                    }}
                  >
                    <item.icon className="dashboard-icon" />
                    {item.name}

                    {isActive && <FiberManualRecordIcon className="active-dot" style={{ fontSize: '12px' }} />}
                  </li>
                )
              })}
            </ul>
          </div>

          <div>
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