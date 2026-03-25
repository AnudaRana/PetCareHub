import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Sidebar.css';
import '../../styles/StaffDashboard.css';

const HomeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9,22 9,12 15,12 15,22" />
  </svg>
);

const PawIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7" cy="7" r="2.5" />
    <circle cx="17" cy="7" r="2.5" />
    <circle cx="5" cy="14" r="2.5" />
    <circle cx="19" cy="14" r="2.5" />
    <path d="M12 22c-4 0-7-3-7-6 0-1.5 1.5-3 3-3h8c1.5 0 3 1.5 3 3 0 3-3 6-7 6z" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const BoxIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="21 8 21 21 3 21 3 8" />
    <rect x="1" y="3" width="22" height="5" />
    <line x1="10" y1="12" x2="14" y2="12" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const SignOutIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const NAV_ITEMS = [
  { key: 'home',         icon: <HomeIcon />,     label: 'Home',         clickable: true },
  { key: 'all-pets',     icon: <PawIcon />,      label: 'All Pets',     clickable: true },
  { key: 'appointments', icon: <CalendarIcon />, label: 'Appointments', clickable: true },
  { key: 'vaccinations', icon: <ShieldIcon />,   label: 'Vaccinations', clickable: false },
  { key: 'orders',       icon: <BoxIcon />,      label: 'Orders',       clickable: false },
  { key: 'settings',     icon: <SettingsIcon />, label: 'Settings',     clickable: false },
];

const StaffSidebar = ({ activeTab, onTabChange, staff = {} }) => {
  const navigate = useNavigate();

  const displayName = staff.fullName || 'Staff';
  const displayEmail = staff.email || 'staff@petcarehub.com';
  const displayInitials = staff.initials || 'ST';

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    navigate('/login', { replace: true });
  };

  return (
    <aside className="sidebar staff-sidebar">
      <div className="sidebar-decor-tr" />
      <div className="sidebar-decor-bl" />

      <div className="sidebar-logo">
        <img
          src="/images/logo/Logo.jpeg"
          alt="PetCareHub Logo"
          className="sidebar-logo-image"
          style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }}
        />
        <div className="sidebar-logo-text">
          <h2 style={{ fontFamily: "'Playfair Display', serif" }}>PetCareHub</h2>
          <p>Staff Portal</p>
        </div>
      </div>

      <div className="staff-sidebar-role-badge">
        <span>🏥</span>
        <span>Clinic Staff</span>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            className={`nav-item${activeTab === item.key ? ' active' : ''}${!item.clickable ? ' nav-item--disabled' : ''}`}
            onClick={() => item.clickable && onTabChange(item.key)}
            aria-current={activeTab === item.key ? 'page' : undefined}
            tabIndex={item.clickable ? 0 : -1}
            aria-disabled={!item.clickable}
            type="button"
          >
            <span className="nav-item-icon">{item.icon}</span>
            <span className="nav-item-text">{item.label}</span>
            {activeTab === item.key && <span className="nav-indicator-dot" />}
            {!item.clickable && <span className="nav-item-soon">Soon</span>}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user-card">
          <div className="sidebar-user-avatar staff-user-avatar">{displayInitials}</div>
          <div className="sidebar-user-text">
            <p className="sidebar-user-name" title={displayName}>{displayName}</p>
            <p className="sidebar-user-email" title={displayEmail}>{displayEmail}</p>
          </div>
        </div>

        <button className="sidebar-signout" onClick={handleSignOut} type="button">
          <SignOutIcon />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default StaffSidebar;