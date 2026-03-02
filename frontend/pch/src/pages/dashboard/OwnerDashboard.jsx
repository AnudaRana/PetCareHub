import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import './Dashboard.css'; 
import Logo from '../../assets/logo-w.png'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';


const OwnerDashboard = () => {
  const { user, token, logout } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      // Skip if we already have basic user info from JWT
      if (profile) return;

      try {
        setLoading(true);
        setError(null);

        const res = await axios.get('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`, // usually already set globally — but safe to be explicit
          },
        });

        setProfile(res.data); // → UserProfileResponse DTO
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        if (err.response?.status === 401) {
          logout(); // token expired/invalid → force re-login
        }
        setError('Could not load your profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchProfile();
    }
  }, [token, logout, profile]);

  if (!token) {
    return <div>Please log in to view your dashboard.</div>;
  }

  if (loading) {
    return <div className="loading">Loading your dashboard...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!profile) {
    return <div>No profile data available.</div>;
  }

  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <img src= {Logo} alt='' className="logo"/>
          <div className="sidebar-header-text">
            <span className="sidebar-title">PetCareHub</span>
            <span className="sidebar-subtitle">Pet Owner Dashboard</span>
          </div>
        </div>
        <ul>
          <li><HomeOutlinedIcon className="dashboard-icon"/>Home</li>
          <li>My Profile</li>
          <li>My Pets</li>
          <li>My Appointments</li>
          <li>Doctor Channeling</li>
          <li>Store</li>
          <li>Settings</li>
        </ul>
      </div>
    
    </div>
  );
};

export default OwnerDashboard;