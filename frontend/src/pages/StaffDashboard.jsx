import React, { useState, useEffect } from 'react';
import axios from 'axios';
import StaffSidebar from '../components/staff/StaffSidebar';
import StaffAllPets from '../components/staff/StaffAllPets';
import useCurrentUser from '../hooks/useCurrentUser';
import { API_BASE_URL } from '../services/petService';
import '../styles/Dashboard.css';
import '../styles/StaffDashboard.css';

const TAB_META = {
  home:         { label: 'Home' },
  'all-pets':   { label: 'All Pets' },
  appointments: { label: 'Appointments' },
  vaccinations: { label: 'Vaccinations' },
  orders:       { label: 'Orders' },
  settings:     { label: 'Settings' },
};

const ComingSoon = ({ tabKey }) => {
  const meta = TAB_META[tabKey] || { label: tabKey };
  return (
    <div className="staff-coming-soon">
      <div className="staff-coming-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h2>{meta.label}</h2>
      <p>This section is under development and will be available soon.</p>
      <span className="staff-coming-badge">Coming Soon</span>
    </div>
  );
};

const StaffDashboard = () => {
  const [activeTab, setActiveTab] = useState('home');
  const { fullName, firstName, email, initials, loading } = useCurrentUser();

  const staff = { fullName, firstName, email, initials: initials || 'ST' };

  const renderContent = () => {
    switch (activeTab) {
      case 'all-pets': return <StaffAllPets />;
      case 'home':     return <StaffHome staff={staff} onNavigate={setActiveTab} />;
      default:         return <ComingSoon tabKey={activeTab} />;
    }
  };

  const currentMeta = TAB_META[activeTab] || { label: activeTab };

  if (loading) {
    return (
      <div className="staff-full-loading">
        <div className="staff-spinner" />
        <p>Loading staff portal...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <StaffSidebar activeTab={activeTab} onTabChange={setActiveTab} staff={staff} />
      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="topbar-breadcrumb">
            <span className="breadcrumb-home">Staff Portal</span>
            <span className="breadcrumb-sep">›</span>
            <span className="breadcrumb-current">{currentMeta.label}</span>
          </div>
          <div className="topbar-right">
            <div className="topbar-user-section">
              <span className="topbar-greeting">
                Welcome, <strong>{fullName}</strong>
              </span>
              <div className="topbar-avatar staff-avatar" title="Profile">
                {initials || 'ST'}
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

// ── Staff Home Tab ───────────────────────────────────────────
const StaffHome = ({ staff, onNavigate }) => {
  const [totalPets, setTotalPets] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/pets/all`);
        const list = data?.data || data || [];
        setTotalPets(Array.isArray(list) ? list.length : 0);
      } catch {
        setTotalPets(0);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="staff-home">
      <div className="staff-home-greeting">
        <div>
          <h1>Good day, {staff.firstName || staff.fullName} 👋</h1>
          <p>Here's your staff portal overview for today.</p>
        </div>
        <div className="staff-role-badge">
          <span>🏥</span> Clinic Staff
        </div>
      </div>

      <div className="staff-stats-grid">
        {[
          { icon: '🐾', label: 'Registered Pets', value: totalPets !== null ? totalPets : '...', sub: 'in system',    color: '#10B981' },
          { icon: '📅', label: 'Appointments',    value: '—',                                    sub: 'coming soon', color: '#F59E0B' },
          { icon: '💉', label: 'Vaccinations',    value: '—',                                    sub: 'coming soon', color: '#3B82F6' },
          { icon: '📦', label: 'Orders',          value: '—',                                    sub: 'coming soon', color: '#8B5CF6' },
        ].map((stat, i) => (
          <div className="staff-stat-card" key={i} style={{ '--accent': stat.color }}>
            <div className="staff-stat-icon">{stat.icon}</div>
            <div className="staff-stat-value">{stat.value}</div>
            <div className="staff-stat-label">{stat.label}</div>
            <div className="staff-stat-sub">{stat.sub}</div>
          </div>
        ))}
      </div>

      <div className="staff-quick-actions">
        <h3>Quick Actions</h3>
        <div className="staff-action-cards">
          {[
            { icon: '🐾', label: 'View All Pets',  tab: 'all-pets'    },
            { icon: '📅', label: 'Appointments',   tab: 'appointments' },
            { icon: '💉', label: 'Vaccinations',   tab: 'vaccinations' },
            { icon: '📦', label: 'Orders',         tab: 'orders'      },
          ].map((action, i) => (
            <button key={i} className="staff-action-card" onClick={() => onNavigate(action.tab)}>
              <span className="staff-action-icon">{action.icon}</span>
              <span className="staff-action-label">{action.label}</span>
              <span className="staff-action-arrow">→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
