import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../dashboard/DashboardLayout';
import axios from 'axios';
import { toast } from 'react-toastify';
import './MyProfile.css';

import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import CameraAltIcon from '@mui/icons-material/CameraAlt';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PetsOutlinedIcon from '@mui/icons-material/PetsOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import BookOnlineOutlinedIcon from '@mui/icons-material/BookOnlineOutlined';
import StoreOutlinedIcon from '@mui/icons-material/StoreOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined';
import HealingOutlinedIcon from '@mui/icons-material/HealingOutlined';
import ContentPasteSearchOutlinedIcon from '@mui/icons-material/ContentPasteSearchOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import MonitorHeartOutlinedIcon from '@mui/icons-material/MonitorHeartOutlined';
import LocalHospitalOutlinedIcon from '@mui/icons-material/LocalHospitalOutlined';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';

const MyProfile = () => {
    const { user, hasRole, token, loading, updateContextProfile } = useAuth();
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

    const getMenuItems = () => {
        if (hasRole('ADMIN')) {
            return [
                { name: 'Home', icon: HomeOutlinedIcon, path: '/' },
                { name: 'My Profile', icon: PersonOutlineOutlinedIcon, path: '/dashboard/profile' },
                { name: 'Manage Staff', icon: PeopleAltOutlinedIcon, path: '/dashboard/manage-staff' },
                { name: 'System Analytics', icon: BarChartOutlinedIcon, path: '/dashboard/analytics' },
                { name: 'System Logs', icon: MonitorHeartOutlinedIcon, path: '/dashboard/logs' },
                { name: 'Settings', icon: SettingsOutlinedIcon, path: '/dashboard/settings' }
            ];
        }
        if (hasRole('OWNER')) {
            return [
                { name: 'Home', icon: HomeOutlinedIcon, path: '/' },
                { name: 'My Profile', icon: PersonOutlineOutlinedIcon, path: '/dashboard/profile' },
                { name: 'My Pets', icon: PetsOutlinedIcon, path: '/dashboard/pets' },
                { name: 'My Appointements', icon: CalendarTodayOutlinedIcon, path: '/dashboard/appointments' },
                { name: 'Doctor Channeling', icon: BookOnlineOutlinedIcon, path: '/dashboard/channeling' },
                { name: 'Shop', icon: StoreOutlinedIcon, path: '/dashboard/shop' },
                { name: 'Settings', icon: SettingsOutlinedIcon, path: '/dashboard/settings' }
            ];
        }
        if (hasRole('STAFF')) {
            return [
                { name: 'Home', icon: HomeOutlinedIcon, path: '/' },
                { name: 'My Profile', icon: PersonOutlineOutlinedIcon, path: '/dashboard/profile' },
                { name: 'Manage Appointments', icon: ContentPasteSearchOutlinedIcon, path: '/dashboard/appointments' },
                { name: 'Orders', icon: StoreOutlinedIcon, path: '/dashboard/store' },
                { name: 'Settings', icon: SettingsOutlinedIcon, path: '/dashboard/settings' }
            ];
        }
        if (hasRole('VET')) {
            return [
                { name: 'Home', icon: HomeOutlinedIcon, path: '/' },
                { name: 'My Profile', icon: PersonOutlineOutlinedIcon, path: '/dashboard/profile' },
                { name: 'My Appointments', icon: EventNoteOutlinedIcon, path: '/dashboard/appointments' },
                { name: 'Patient Records', icon: HealingOutlinedIcon, path: '/dashboard/patients' },
                { name: 'Prescriptions', icon: LocalHospitalOutlinedIcon, path: '/dashboard/prescriptions' },
                { name: 'Messages', icon: ChatOutlinedIcon, path: '/dashboard/messages' },
                { name: 'Settings', icon: SettingsOutlinedIcon, path: '/dashboard/settings' }
            ];
        }

        return [
            { name: 'Home', icon: HomeOutlinedIcon, path: '/' },
            { name: 'My Profile', icon: PersonOutlineOutlinedIcon, path: '/dashboard/profile' }
        ];
    };

    const fetchProfile = async () => {
        if (!token) return;
        try {
            const response = await axios.get('http://localhost:8080/api/auth/me', {
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

    //Profile Picture logic
    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            await axios.post('http://localhost:8080/api/users/me/profile-picture', uploadData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            toast.success("Profile picture updated!");

            //re-fetch to update the profile 
            await fetchProfile();

            //update the global navbar 
            const newResponse = await axios.get('http://localhost:8080/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
            let newPfp = newResponse.data.profilePicture;
            if (newPfp && !newPfp.startsWith('data:image')) newPfp = `data:image/jpeg;base64,${newPfp}`;
            updateContextProfile({ profilePicture: newPfp });

        } catch (error) {
            toast.error("Upload failed.");
        }
    };

    const handleDeletePicture = async () => {
        try {
            await axios.delete('http://localhost:8080/api/users/me/profile-picture', {
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

            const response = await axios.put('http://localhost:8080/api/users/me/update', payload, {
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

    if (loading || !profile) return <div className="loading-state">Loading Profile...</div>;

    return (
        <DashboardLayout menuItems={getMenuItems()}>
            <div className="profile-header-banner">
                <div className="banner-info">
                    <h2>My Profile</h2>
                    <p>Manage your account settings and personal information.</p>
                </div>
                {!isEditing && (
                    <button className="btn btn-teal" onClick={() => setIsEditing(true)}>
                        Edit Profile
                    </button>
                )}
            </div>

            <div className="profile-main-container">
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
                            <button className="avatar-icon-btn camera" onClick={() => fileInputRef.current.click()}>
                                <CameraAltIcon style={{ fontSize: '18px' }} />
                            </button>
                            {profile.profilePicture && (
                                <button className="avatar-icon-btn delete" onClick={handleDeletePicture}>
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
                                <span key={r} className="role-tag">{r.replace('ROLE_', '')}</span>
                            ))}
                        </div>
                    </div>
                </div>

                {!isEditing ? (
                    <div className="profile-details-view">
                        <div className="detail-box">
                            <span className="detail-label">First Name</span>
                            <span className="detail-value">{profile.firstName || '-'}</span>
                        </div>
                        <div className="detail-box">
                            <span className="detail-label">Last Name</span>
                            <span className="detail-value">{profile.lastName || '-'}</span>
                        </div>
                        <div className="detail-box">
                            <span className="detail-label">Mobile Number</span>
                            <span className="detail-value">{profile.mobileNumber || '-'}</span>
                        </div>
                        <div className="detail-box">
                            <span className="detail-label">Address</span>
                            <span className="detail-value">{profile.address || '-'}</span>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSave} className="profile-edit-form">
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
                                <label>Mobile Number</label>
                                <input type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} />
                            </div>
                            <div className="form-input-group">
                                <label>Address</label>
                                <input type="text" name="address" value={formData.address} onChange={handleInputChange} />
                            </div>
                        </div>

                        <hr className="form-divider" />

                        <div className="password-update-section">
                            <h4>Change Password (Optional)</h4>
                            <div className="form-grid">
                                <div className="form-input-group">
                                    <label>New Password</label>
                                    <input type="password" name="password" placeholder="Leave blank to keep current" value={formData.password} onChange={handleInputChange} />
                                </div>
                                <div className="form-input-group">
                                    <label>Confirm New Password</label>
                                    <input type="password" name="confirmPassword" placeholder="Confirm new password" value={formData.confirmPassword} onChange={handleInputChange} />
                                </div>
                            </div>
                        </div>

                        <div className="form-button-group">
                            <button className="btn btn-cancel" onClick={() => setIsEditing(false)}>Cancel</button>
                            <button type="submit" className="btn btn-teal">Save Changes</button>
                        </div>
                    </form>
                )}
            </div>

        </DashboardLayout>
    );
};

export default MyProfile;