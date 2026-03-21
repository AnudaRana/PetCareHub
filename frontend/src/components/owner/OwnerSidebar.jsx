// File: src/components/owner/OwnerSidebar.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/Sidebar.css';

/* ── SVG Icon Components ─────────────────────────────── */
const HomeIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9,22 9,12 15,12 15,22" />
    </svg>
);

const ProfileIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
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

const StoreIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
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
        <path d="M10 8l6 6" />
        <path d="M14 4l6 6-7 7-6-6 7-7z" />
        <path d="M4 20l4-4" />
    </svg>
);

const StethoscopeIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        <line x1="12" y1="10" x2="12" y2="16" />
        <line x1="9" y1="13" x2="15" y2="13" />
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

/* ── Navigation Items ─────────────────────────────────── */
const NAV_ITEMS = [
    { key: 'home', icon: <HomeIcon />, label: 'Home', clickable: false },
    { key: 'my-profile', icon: <ProfileIcon />, label: 'My Profile', clickable: false },
    { key: 'my-pets', icon: <PawIcon />, label: 'My Pets', clickable: true },
    { key: 'store', icon: <StoreIcon />, label: 'Store', clickable: false },
    { key: 'my-appointments', icon: <CalendarIcon />, label: 'My Appointments', clickable: false },
    { key: 'my-vaccinations', icon: <ShieldIcon />, label: 'My Vaccinations', clickable: false },
    { key: 'doctor-channeling', icon: <StethoscopeIcon />, label: 'Doctor Channeling', clickable: true },
    { key: 'settings', icon: <SettingsIcon />, label: 'Settings', clickable: false },
];

/* ── Component ────────────────────────────────────────── */
const OwnerSidebar = ({ activeTab, onTabChange, user = {} }) => {
    const navigate = useNavigate();
    const displayName = user.fullName || 'User';
    const displayEmail = user.email || 'user@petcarehub.com';
    const displayInitials = user.initials || 'U';

    const handleSignOut = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        localStorage.removeItem('role');
        localStorage.removeItem('email');
        localStorage.removeItem('fullName');
        navigate('/login', { replace: true });
    };

    return (
        <aside className="sidebar">
            {/* Decorative circles */}
            <div className="sidebar-decor-tr" />
            <div className="sidebar-decor-bl" />

            {/* Brand / Logo */}
            <div className="sidebar-logo">
                <img
                    src="/images/logo/Logo.jpeg"
                    alt="PetCareHub Logo"
                    className="sidebar-logo-image"
                    style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div className="sidebar-logo-text">
                    <h2 style={{ fontFamily: "'Playfair Display', serif" }}>PetCareHub</h2>
                    <p>Mans's best friend is his pet!...</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                <div className="nav-section-label">Navigation</div>
                {NAV_ITEMS.map((item) => (
                    <button
                        key={item.key}
                        className={`nav-item${activeTab === item.key ? ' active' : ''}${!item.clickable ? ' nav-item--disabled' : ''}`}
                        onClick={() => item.clickable && onTabChange(item.key)}
                        aria-current={activeTab === item.key ? 'page' : undefined}
                        tabIndex={item.clickable ? 0 : -1}
                        aria-disabled={!item.clickable}
                    >
                        <span className="nav-item-icon">{item.icon}</span>
                        <span className="nav-item-text">{item.label}</span>
                        {activeTab === item.key && <span className="nav-indicator-dot" />}
                        {!item.clickable && (
                            <span className="nav-item-soon">Soon</span>
                        )}
                    </button>
                ))}
            </nav>

            {/* Footer: user info + sign out */}
            <div className="sidebar-footer">
                <div className="sidebar-user-card">
                    <div className="sidebar-user-avatar">{displayInitials}</div>
                    <div className="sidebar-user-text">
                        <p className="sidebar-user-name" title={displayName}>{displayName}</p>
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

export default OwnerSidebar;
