// File: src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';

/**
 * Placeholder Login page
 */
const LoginPage = () => (
    <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center',
        justifyContent: 'center', background: '#f4f7f8',
        fontFamily: 'Inter, system-ui, sans-serif'
    }}>
        <div style={{
            background: '#fff', padding: '40px 48px', borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)', textAlign: 'center', maxWidth: 380, width: '100%'
        }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🐾</div>
            <h1 style={{ color: '#36B8B7', fontSize: '1.5rem', fontWeight: 800, marginBottom: '6px' }}>
                PetCareHub
            </h1>
            <p style={{ color: '#6b7e8a', fontSize: '0.85rem', marginBottom: '24px' }}>
                Please log in to access your dashboard.
            </p>
            <p style={{ color: '#2c3e50', fontSize: '0.88rem' }}>
                Set your username in <code>sessionStorage</code> under key <code>"username"</code> for testing.
            </p>
        </div>
    </div>
);

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route
                    path="/dashboard"
                    element={<Dashboard />}
                />
                {/* Default redirect to Dashboard for testing */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </Router>
    );
};

export default App;
