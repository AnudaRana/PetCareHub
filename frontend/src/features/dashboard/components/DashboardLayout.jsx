import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/contexts/AuthContext';
import Logo from '../../../assets/logo-w.png';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import LogoutIcon from '@mui/icons-material/Logout';
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
        if (user?.firstName) return user.firstName;
        return user?.email ? user.email.split('@')[0] : 'User';
    };

    const getSidebarClass = () => {
        if (!user) return 'sidebar';
        const role = (user.role || '').toUpperCase();
        if (role === 'VET') return 'sidebar doc-sidebar';
        if (role === 'STAFF') return 'sidebar staff-sidebar';
        return 'sidebar';
    };

    const getBreadcrumbs = () => {
        const paths = location.pathname.split('/').filter(p => p);
        return (
            <div className="topbar-breadcrumb">
                <span className="breadcrumb-home">Dashboard</span>
                {paths.map((path, idx) => {
                    if (path === 'dashboard') return null;
                    return (
                        <React.Fragment key={path}>
                            <span className="breadcrumb-sep">/</span>
                            <span className={idx === paths.length - 1 ? 'breadcrumb-current' : 'breadcrumb-home'}>
                                {path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' ')}
                            </span>
                        </React.Fragment>
                    );
                })}
            </div>
        );
    };

    const isStaffOrVet = user?.role === 'VET' || user?.role === 'STAFF';

    return (
        <div className="dashboard-layout">
            {mobileOpen && <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />}
            <aside className={getSidebarClass() + (mobileOpen ? ' mobile-open' : '')}>
                <div className="sidebar-decor-tr" />
                <div className="sidebar-decor-bl" />

                <div className="sidebar-logo">
                    <img src={Logo} alt="PetCareHub" className="sidebar-logo-image" />
                    <div className="sidebar-logo-text">
                        <h2>PetCareHub</h2>
                        <p>{user?.role || 'Portal'}</p>
                    </div>
                </div>

                {isStaffOrVet && (
                    <div className={user.role === 'VET' ? 'doc-sidebar-role-badge' : 'staff-sidebar-role-badge'}>
                        <span className="doc-sidebar-role-icon">🛡️</span>
                        {user.role} ACCESS
                    </div>
                )}

                <ul className="sidebar-nav">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path ||
                            (item.path !== '/dashboard' && item.path !== '/' && location.pathname.startsWith(item.path));
                        const isDisabled = item.disabled;

                        return (
                            <li
                                key={item.name}
                                className={`nav-item ${isActive ? 'active' : ''} ${isDisabled ? 'nav-item--disabled' : ''}`}
                                onClick={() => {
                                    if (isDisabled) return;
                                    navigate(item.path);
                                    setMobileOpen(false);
                                }}
                            >
                                <div className="nav-item-icon">
                                    <item.icon style={{ fontSize: '20px' }} />
                                </div>
                                <span className="nav-item-text">{item.name}</span>
                                {isActive && <div className="nav-indicator-dot" />}
                                {isDisabled && <span className="nav-item-tag">LOCKED</span>}
                            </li>
                        );
                    })}
                </ul>

                <div className="sidebar-footer">
                    <button className="sidebar-signout" onClick={handleLogout}>
                        <LogoutIcon style={{ fontSize: '18px' }} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            <main className="dashboard-main">
                <header className="dashboard-topbar">
                    <button className="mobile-toggle" onClick={toggleMobileMenu}>
                        <MenuIcon />
                    </button>

                    {getBreadcrumbs()}

                    <div className="topbar-right">
                        <div className="topbar-user-section">
                            <span className="topbar-greeting">
                                Welcome, <strong>{getUserName()}</strong>
                            </span>
                            <div className="topbar-avatar" onClick={() => navigate('/dashboard/profile')}>
                                {getInitials(user?.email)}
                            </div>
                        </div>
                    </div>
                </header>

                <section className="dashboard-content">
                    {children}
                </section>
            </main>
        </div>
    );
};

export default DashboardLayout;