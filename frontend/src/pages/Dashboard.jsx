import React, { useState } from 'react';
import OwnerSidebar from '../components/owner/OwnerSidebar';
import MyPets from '../components/owner/MyPets';
import ViewTimeSlots from './ViewTimeSlots';
import '../styles/Dashboard.css';
import useCurrentUser from '../hooks/useCurrentUser';

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
        <div style={{
            height: '60vh', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: '16px',
        }}>
            <div style={{
                width: '80px', height: '80px', borderRadius: '50%',
                background: `linear-gradient(135deg, rgba(62,64,149,0.18), rgba(0,174,239,0.18))`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-primary)',
            }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"
                    fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', color: 'var(--color-primary)', margin: 0 }}>
                {meta.label}
            </h2>
            <p style={{ color: 'var(--color-border)', fontSize: '14px', textAlign: 'center', maxWidth: '320px', margin: 0, lineHeight: 1.6 }}>
                This section is currently under development and will be available soon. Stay tuned!
            </p>
            <span style={{
                background: `linear-gradient(90deg, var(--color-primary), var(--color-accent))`,
                color: 'var(--color-white)', padding: '6px 18px', borderRadius: '20px',
                fontSize: '12px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>Coming Soon</span>
        </div>
    );
};

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState('my-pets');
    const user = useCurrentUser();

    const renderContent = () => {
        if (activeTab === 'my-pets') return <MyPets />;
        if (activeTab === 'doctor-channeling') return <ViewTimeSlots />;
        return <ComingSoon tabKey={activeTab} />;
    };

    const currentMeta = TAB_META[activeTab] || { label: activeTab };

    return (
        <div className="dashboard-layout">
            <OwnerSidebar activeTab={activeTab} onTabChange={setActiveTab} user={user} />

            <div className="dashboard-main">
                {/* Top Bar */}
                <header className="dashboard-topbar">
                    <div className="topbar-breadcrumb">
                        <span className="breadcrumb-home">Dashboard</span>
                        <span className="breadcrumb-sep">›</span>
                        <span className="breadcrumb-current">{currentMeta.label}</span>
                    </div>

                    <div className="topbar-right">
                        <div className="topbar-user-section">
                            <span className="topbar-greeting">
                                Welcome, <strong>{user.fullName}</strong>
                            </span>
                            <div className="topbar-avatar" title="Profile">
                                {user.initials}
                            </div>
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
