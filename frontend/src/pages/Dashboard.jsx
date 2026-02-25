// File: src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import MyPets from '../components/MyPets';
import { API_BASE_URL } from '../services/petService';
import '../styles/Dashboard.css';

const TAB_META = {
    'home': { label: 'Home' },
    'my-profile': { label: 'My Profile' },
    'my-pets': { label: 'My Pets' },
    'store': { label: 'Store' },
    'my-appointments': { label: 'My Appointments' },
    'my-vaccinations': { label: 'My Vaccinations' },
    'doctor-channeling': { label: 'Doctor Channeling' },
    'settings': { label: 'Settings' },
};

const ComingSoon = ({ tabKey }) => {
    const meta = TAB_META[tabKey] || { label: tabKey };
    return (
        <div className="coming-soon-panel">
            <div className="coming-soon-icon-placeholder">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
            </div>
            <h2>{meta.label}</h2>
            <p>
                This section is currently under development and will be available soon.
                Stay tuned for updates.
            </p>
            <span className="coming-soon-badge">Coming Soon</span>
        </div>
    );
};

/** Build initials from first + last name, e.g. "John Smith" → "JS" */
const getInitials = (firstName = '', lastName = '') =>
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('my-pets');

    // ── User info ──────────────────────────────────────────────────
    const [user, setUser] = useState({
        firstName: '',
        lastName: '',
        fullName: 'Pet Owner',
        email: 'owner@petcarehub.com',
        initials: 'PO',
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const username = sessionStorage.getItem('username');
                if (!username) return;

                const { data } = await axios.get(
                    `${API_BASE_URL}/api/admin/users/search?name=${encodeURIComponent(username)}`
                );

                if (Array.isArray(data) && data.length > 0) {
                    // Match by username field (set during login) or fall back to first result
                    const found = data.find(u => u.username === username) || data[0];
                    if (found) {
                        const firstName = found.firstName || '';
                        const lastName = found.lastName || '';
                        setUser({
                            firstName,
                            lastName,
                            fullName: `${firstName} ${lastName}`.trim() || username,
                            email: found.email || 'owner@petcarehub.com',
                            initials: getInitials(firstName, lastName),
                        });
                    }
                }
            } catch (err) {
                // Silently keep the default placeholder values
                console.warn('Could not load user profile:', err);
            }
        };

        fetchUser();
    }, []);

    // ── Content renderer ───────────────────────────────────────────
    const renderContent = () => {
        if (activeTab === 'my-pets') return <MyPets />;
        return <ComingSoon tabKey={activeTab} />;
    };

    const currentMeta = TAB_META[activeTab] || { label: activeTab };

    return (
        <div className="dashboard-layout">
            <Sidebar activeTab={activeTab} onTabChange={setActiveTab} user={user} />

            <div className="dashboard-main">
                {/* Top Bar */}
                <header className="dashboard-topbar">
                    <div className="topbar-breadcrumb">
                        <span className="breadcrumb-home">Dashboard</span>
                        <span className="breadcrumb-sep">›</span>
                        <span className="breadcrumb-current">{currentMeta.label}</span>
                    </div>
                    <div className="topbar-right">
                        <span className="topbar-greeting">
                            Welcome back, <strong>{user.fullName}</strong>
                        </span>
                        <div className="topbar-avatar" title="Profile">
                            {user.initials}
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="dashboard-content">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
