import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../auth/contexts/AuthContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import './MyProfile.css';

import CameraAltIcon from '@mui/icons-material/CameraAlt';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const MyProfile = () => {
    const { token, loading, updateContextProfile } = useAuth();
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        mobileNumber: '',
        address: '',
        password: '',
        confirmPassword: ''
    });

    const fetchProfile = async () => {
        if (!token) return;
        try {
            const response = await axios.get('/api/auth/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = response.data;

            let pfp = data.profilePicture;
            if (pfp && !pfp.startsWith('data:image')) {
                pfp = `data:image/jpeg;base64,${pfp}`;
            }
            data.profilePicture = pfp;

            setProfile(data);
            setFormData({
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                mobileNumber: data.mobileNumber || '',
                address: data.address || '',
                password: '',
                confirmPassword: ''
            });
        } catch (error) {
            toast.error('Failed to load profile data.');
        }
    };

    useEffect(() => {
        fetchProfile();
    }, [token]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            await axios.post('/api/users/me/profile-picture', uploadData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            toast.success("Profile picture updated!");
            await fetchProfile();

            const newResponse = await axios.get('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
            let newPfp = newResponse.data.profilePicture;
            if (newPfp && !newPfp.startsWith('data:image')) newPfp = `data:image/jpeg;base64,${newPfp}`;
            updateContextProfile({ profilePicture: newPfp });

        } catch (error) {
            toast.error("Upload failed.");
        }
    };

    const handleDeletePicture = async () => {
        try {
            await axios.delete('/api/users/me/profile-picture', {
                headers: { Authorization: `Bearer ${token}` }
            });
            updateContextProfile({ profilePicture: null });
            toast.success("Profile picture removed");
            fetchProfile();
        } catch (error) {
            toast.error("Failed to delete picture.");
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (formData.password && formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        try {
            const payload = { ...formData };
            if (!formData.password) delete payload.password;
            delete payload.confirmPassword;

            const response = await axios.put('/api/users/me/update', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(response.data);
            setIsEditing(false);
            setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
            toast.success("Profile updated successfully!");
        } catch (error) {
            toast.error("Failed to update profile");
        }
    };

    if (loading || !profile) return (
        <div className="loading-container" style={{ padding: '80px 0' }}>
            <div className="spinner" />
            <p style={{ color: 'var(--color-text-light)', marginTop: '16px', fontWeight: 500 }}>Accessing Profile Data...</p>
        </div>
    );

    return (
        <div className="profile-container-content animate-fade-up">
            <div className="profile-header-banner">
                <div className="banner-info">
                    <h2>Account Overview</h2>
                    <p>User Information</p>
                </div>
                {!isEditing && (
                    <button className="btn btn-teal" onClick={() => setIsEditing(true)}>
                        🛠️ Edit Profile
                    </button>
                )}
            </div>

            <div className="profile-main-container shadow-premium">
                <div className="profile-summary-section">
                    <div className="avatar-wrapper">
                        {profile.profilePicture ? (
                            <img src={profile.profilePicture} alt="Avatar" className="profile-avatar-img" />
                        ) : (
                            <div className="profile-avatar-large">
                                {profile.firstName?.charAt(0)}{profile.lastName?.charAt(0)}
                            </div>
                        )}

                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            onChange={handleFileChange}
                            accept="image/*"
                        />

                        <div className="avatar-actions">
                            <button className="avatar-icon-btn camera" onClick={() => fileInputRef.current.click()} title="Update Hub Avatar">
                                <CameraAltIcon style={{ fontSize: '18px' }} />
                            </button>
                            {profile.profilePicture && (
                                <button className="avatar-icon-btn delete" onClick={handleDeletePicture} title="Purge Identity Media">
                                    <DeleteOutlineIcon style={{ fontSize: '18px' }} />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="profile-identity">
                        <h3>{profile.firstName} {profile.lastName}</h3>
                        <p className="profile-email-text">{profile.email}</p>
                        <div className="profile-roles">
                            {profile.roles?.map(r => (
                                <span key={r} className="role-tag">
                                    {r.replace('ROLE_', '') === 'VET' ? '⚕️ VET' : r.replace('ROLE_', '') === 'STAFF' ? '📋 STAFF' : r.replace('ROLE_', '') === 'ADMIN' ? '🛡️ ADMIN' : '👤 OWNER'}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {!isEditing ? (
                    <div className="profile-details-view">
                        <div className="detail-box">
                            <span className="detail-label">First Registry Name</span>
                            <span className="detail-value">{profile.firstName || 'Not Documented'}</span>
                        </div>
                        <div className="detail-box">
                            <span className="detail-label">Last Registry Name</span>
                            <span className="detail-value">{profile.lastName || 'Not Documented'}</span>
                        </div>
                        <div className="detail-box">
                            <span className="detail-label">Mobile Contact</span>
                            <span className="detail-value">{profile.mobileNumber || 'No verified number'}</span>
                        </div>
                        <div className="detail-box">
                            <span className="detail-label">Registry Address</span>
                            <span className="detail-value">{profile.address || 'No physical address linked'}</span>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSave} className="profile-edit-form premium-form">
                        <div className="form-grid">
                            <div className="form-input-group">
                                <label>First Name</label>
                                <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required />
                            </div>
                            <div className="form-input-group">
                                <label>Last Name</label>
                                <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required />
                            </div>
                            <div className="form-input-group">
                                <label>Mobile Contact</label>
                                <input type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} placeholder="+XX XXX XXX XXXX" />
                            </div>
                            <div className="form-input-group">
                                <label>Physical Address</label>
                                <input type="text" name="address" value={formData.address} onChange={handleInputChange} placeholder="Current residency..." />
                            </div>
                        </div>

                        <hr className="form-divider" />

                        <div className="password-update-section">
                            <h4>Credential Management</h4>
                            <div className="form-grid">
                                <div className="form-input-group">
                                    <label>Renew Password</label>
                                    <input type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleInputChange} />
                                </div>
                                <div className="form-input-group">
                                    <label>Authorize Password</label>
                                    <input type="password" name="confirmPassword" placeholder="••••••••" value={formData.confirmPassword} onChange={handleInputChange} />
                                </div>
                            </div>
                            <p style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--color-text-light)' }}>
                                Identity confirmation required for credential synchronization. Leave empty to maintain current vault state.
                            </p>
                        </div>

                        <div className="form-button-group">
                            <button type="button" className="btn btn-white" onClick={() => setIsEditing(false)} style={{ flex: 1 }}>Discard Changes</button>
                            <button type="submit" className="btn btn-teal" style={{ flex: 2 }}>Synchronize Identity</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default MyProfile;