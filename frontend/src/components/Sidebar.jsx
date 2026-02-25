// File: src/components/Sidebar.jsx
import React from 'react';
import '../styles/Sidebar.css';

/* ── SVG Icon Components ─────────────────────────────── */
const HomeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
        <path d="M9 21V12h6v9" />
    </svg>
);

const ProfileIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const PawIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="7" cy="6" r="2" />
        <circle cx="17" cy="6" r="2" />
        <circle cx="4" cy="13" r="2" />
        <circle cx="20" cy="13" r="2" />
        <path d="M12 22c-3.314 0-6-2-6-4.5S8.686 13 12 13s6 2 6 4.5S15.314 22 12 22z" />
    </svg>
);

const StoreIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
    </svg>
);

const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

const ShieldIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
    </svg>
);

const StethoscopeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.8 2.3A.3.3 0 105 2H4a2 2 0 00-2 2v5a6 6 0 006 6 6 6 0 006-6V4a2 2 0 00-2-2h-1a.2.2 0 10.3.3" />
        <line x1="8" y1="15" x2="8" y2="18" />
        <circle cx="14" cy="18" r="3" />
        <line x1="8" y1="18" x2="11" y2="18" />
    </svg>
);

const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
);

const SignOutIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
);

/* ── Navigation Items ─────────────────────────────────── */
// Only 'my-pets' is enabled; all others are locked (clickable: false)
const NAV_ITEMS = [
    { key: 'home', icon: <HomeIcon />, label: 'Home', clickable: false },
    { key: 'my-profile', icon: <ProfileIcon />, label: 'My Profile', clickable: false },
    { key: 'my-pets', icon: <PawIcon />, label: 'My Pets', clickable: true },
    { key: 'store', icon: <StoreIcon />, label: 'Store', clickable: false },
    { key: 'my-appointments', icon: <CalendarIcon />, label: 'My Appointments', clickable: false },
    { key: 'my-vaccinations', icon: <ShieldIcon />, label: 'My Vaccinations', clickable: false },
    { key: 'doctor-channeling', icon: <StethoscopeIcon />, label: 'Doctor Channeling', clickable: false },
    { key: 'settings', icon: <SettingsIcon />, label: 'Settings', clickable: false },
];

/* ── Component ────────────────────────────────────────── */
const Sidebar = ({ activeTab, onTabChange, user = {} }) => {
    const displayName = user.fullName || 'Pet Owner';
    const displayEmail = user.email || 'owner@petcarehub.com';
    const displayInitials = user.initials || 'PO';
    return (
        <aside className="sidebar">
            {/* Brand / Logo */}
            <div className="sidebar-logo">
                <div className="sidebar-logo-badge">PCH</div>
                <div className="sidebar-logo-text">
                    <h2>PetCareHub</h2>
                    <p>Pet Management Portal</p>
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
                        {!item.clickable && (
                            <span className="nav-item-soon">Soon</span>
                        )}
                    </button>
                ))}
            </nav>

            {/* Footer: user info + sign out */}
            <div className="sidebar-footer">
                <div className="sidebar-user">
                    <div className="sidebar-avatar">{displayInitials}</div>
                    <div className="sidebar-user-info">
                        <p>{displayName}</p>
                        <span>{displayEmail}</span>
                    </div>
                </div>
                <button className="sidebar-signout">
                    <SignOutIcon />
                    <span>Sign Out</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
