import React, { useState, useEffect } from 'react';
import { API_BASE_URL, getAllPets } from '../services/petService';
import DoctorSidebar from '../components/doctor/DoctorSidebar';
import DoctorAllPets from '../components/doctor/DoctorAllPets';
import '../styles/Dashboard.css';
import '../styles/DoctorDashboard.css';
import useCurrentUser from '../hooks/useCurrentUser';

const TAB_META = {
  home: { label: 'Home' },
  'all-pets': { label: 'All Pets' },
  'my-schedule': { label: 'My Schedule' },
  appointments: { label: 'Appointments' },
};

const ComingSoon = ({ tabKey }) => {
  const meta = TAB_META[tabKey] || { label: tabKey };
  return (
    <div className="doc-coming-soon">
      <div className="doc-coming-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h2>{meta.label}</h2>
      <p>This section is under development and will be available soon. Stay tuned!</p>
      <span className="doc-coming-badge">Coming Soon</span>
    </div>
  );
};

const DoctorDashboard = () => {
  const [activeTab, setActiveTab] = useState('home');
  const doctor = useCurrentUser();

  const renderContent = () => {
    switch (activeTab) {
      case 'all-pets':
        return <DoctorAllPets />;
      case 'home':
        return <DoctorHome doctor={doctor} onNavigate={setActiveTab} />;
      default:
        return <ComingSoon tabKey={activeTab} />;
    }
  };

  const currentMeta = TAB_META[activeTab] || { label: activeTab };

  return (
    <div className="dashboard-layout">
      <DoctorSidebar activeTab={activeTab} onTabChange={setActiveTab} doctor={doctor} />

      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="topbar-breadcrumb">
            <span className="breadcrumb-home">Doctor Portal</span>
            <span className="breadcrumb-sep">›</span>
            <span className="breadcrumb-current">{currentMeta.label}</span>
          </div>
          <div className="topbar-right">
            <div className="topbar-user-section">
              <span className="topbar-greeting">
                Welcome, <strong>Dr. {doctor.fullName}</strong>
              </span>
              <div className="topbar-avatar doc-avatar" title="Profile">
                {doctor.initials}
              </div>
            </div>
          </div>
        </header>

        <main className="dashboard-content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

// ── Doctor Home Tab ──────────────────────────────────────────
const DoctorHome = ({ doctor, onNavigate }) => {
  const [stats, setStats] = useState({ totalPets: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getAllPets();
        const petList = response?.data || response || [];
        setStats({ totalPets: Array.isArray(petList) ? petList.length : 0 });
      } catch {
        // silently ignore
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="doc-home">
      <div className="doc-home-greeting">
        <div>
          <h1>Good day, Dr. {doctor.firstName || doctor.fullName} 👋</h1>
          <p>Here's an overview of what's happening at PetCareHub today.</p>
        </div>
        <div className="doc-role-badge">
          <span>🩺</span> Veterinarian
        </div>
      </div>

      <div className="doc-stats-grid">
        {[
          { icon: '🐾', label: 'Total Pets', value: stats.totalPets, sub: 'registered in system', color: '#3B82F6' },
          { icon: '📅', label: "Today's Appointments", value: '—', sub: 'coming soon', color: '#8B5CF6' },
          { icon: '', label: 'Pending Records', value: '—', sub: 'coming soon', color: '#F59E0B' },
        ].map((stat, i) => (
          <div className="doc-stat-card" key={i} style={{ '--accent': stat.color }}>
            <div className="doc-stat-icon">{stat.icon}</div>
            <div className="doc-stat-value">{stat.value}</div>
            <div className="doc-stat-label">{stat.label}</div>
            <div className="doc-stat-sub">{stat.sub}</div>
          </div>
        ))}
      </div>

      <div className="doc-quick-actions">
        <h3>Quick Actions</h3>
        <div className="doc-action-cards">
          <button className="doc-action-card" onClick={() => onNavigate('all-pets')}>
            <span className="doc-action-icon">🐾</span>
            <span className="doc-action-label">View All Pets</span>
            <span className="doc-action-arrow">→</span>
          </button>
          <button className="doc-action-card" onClick={() => onNavigate('my-schedule')}>
            <span className="doc-action-icon">📅</span>
            <span className="doc-action-label">My Schedule</span>
            <span className="doc-action-arrow">→</span>
          </button>
          <button className="doc-action-card" onClick={() => onNavigate('appointments')}>
            <span className="doc-action-icon">📋</span>
            <span className="doc-action-label">Appointments</span>
            <span className="doc-action-arrow">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
