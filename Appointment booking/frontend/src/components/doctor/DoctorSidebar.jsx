import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Sidebar.css';
import '../../styles/DoctorDashboard.css';

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

const ClipboardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
  </svg>
);

const ShieldIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
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
  { key: 'home', icon: <HomeIcon />, label: 'Home', clickable: true },
  { key: 'all-pets', icon: <PawIcon />, label: 'All Pets', clickable: true },
  { key: 'my-schedule', icon: <CalendarIcon />, label: 'My Schedule', clickable: true },
  { key: 'appointments', icon: <ClipboardIcon />, label: 'Appointments', clickable:true },
  { key: 'vaccinations-scheduled', icon: <ShieldIcon />, label: 'Vaccinations Scheduled', clickable: false },
];

const DoctorSidebar = ({ activeTab, onTabChange, doctor = {} }) => {
  const navigate = useNavigate();
  const displayName = doctor.fullName || 'Doctor';
  const displayEmail = doctor.email || 'doctor@petcarehub.com';
  const displayInitials = doctor.initials || 'DR';

  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    navigate('/login', { replace: true });
  };

  return (
    <aside className="sidebar doc-sidebar">
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
          <p>Doctor Portal</p>
        </div>
      </div>

      {/* Doctor badge */}
      <div className="doc-sidebar-role-badge">
        <span className="doc-sidebar-role-icon">🩺</span>
        <span>Veterinarian</span>
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            className={`nav-item${activeTab === item.key ? ' active' : ''}${!item.clickable ? ' nav-item--disabled' : ''}`}
         
            onClick={() => {
  if (!item.clickable) return;

  if (item.key === 'appointments') {
    navigate('/vet-appointments');
  } else {
    onTabChange(item.key);
  }
}}
            aria-current={activeTab === item.key ? 'page' : undefined}
            tabIndex={item.clickable ? 0 : -1}
            aria-disabled={!item.clickable}
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
          <div className="sidebar-user-avatar doc-user-avatar">{displayInitials}</div>
          <div className="sidebar-user-text">
            <p className="sidebar-user-name" title={`Dr. ${displayName}`}>Dr. {displayName}</p>
            <p className="sidebar-user-email" title={displayEmail}>{displayEmail}</p>
          </div>
        </div>
        <button className="sidebar-signout" onClick={handleSignOut}>
          <SignOutIcon />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default DoctorSidebar;
