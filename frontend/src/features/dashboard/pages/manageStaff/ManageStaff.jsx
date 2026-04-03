import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../auth/contexts/AuthContext';
// DashboardLayout removed from here as it is handled by the parent (AdminDashboard)
import '../../components/Dashboard.css';
import './ManageStaff.css';
import axios from 'axios';
import { toast } from 'react-toastify';

const ManageStaff = () => {
    const { loading, token } = useAuth();
    const [users, setUsers] = useState([]);
    const [isFetching, setIsFetching] = useState(false);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        mobileNumber: '',
        address: '',
        role: 'VET' // Default
    });

    const fetchUsers = async () => {
        setIsFetching(true);
        try {
            const response = await axios.get('/api/admin/users', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const staffAndVets = response.data.filter(u =>
                u.roles.includes('ROLE_VET') || u.roles.includes('ROLE_STAFF') || u.roles.includes('ROLE_ADMIN')
            );
            setUsers(staffAndVets);
        } catch (error) {
            toast.error('Failed to load user list.');
        } finally {
            setIsFetching(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchUsers();
        }
        // eslint-disable-next-line
    }, [token]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password,
                mobileNumber: formData.mobileNumber,
                address: formData.address,
                roles: [`ROLE_${formData.role}`],
                enabled: true
            };

            await axios.post('/api/admin/users', payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success(`${formData.role} created successfully!`);
            setShowModal(false);
            setFormData({ firstName: '', lastName: '', email: '', password: '', mobileNumber: '', address: '', role: 'VET' });
            fetchUsers(); 
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create user');
        }
    };

    if (loading) return <div className="loading-state">Loading Manage Staff...</div>;

    return (
        <>
            <div className="staff-header-container">
                <div className="header-text">
                    <h2>Manage Staff</h2>
                    <p>Add new Vets and Staff members to the registry.</p>
                </div>
                <button className="btn btn-teal" onClick={() => setShowModal(true)}>
                    + Create Member
                </button>
            </div>

            <div className="staff-table-container">
                {isFetching ? (
                    <p>Loading users...</p>
                ) : (
                    <table className="staff-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Role(s)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id || u.email}>
                                    <td>{u.firstName} {u.lastName}</td>
                                    <td>{u.email}</td>
                                    <td>{u.mobileNumber}</td>
                                    <td>
                                        {u.roles.map(r => (
                                            <span key={r} className={`role-badge role-${r.toLowerCase()}`}>
                                                {r.replace('ROLE_', '')}
                                            </span>
                                        ))}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Modal for Creation */}
            {showModal && (
                <div className="popup-overlay">
                    <div className="popup-dialog">
                        <h3>Create New Member</h3>
                        <form onSubmit={handleCreateSubmit} className="staff-form">
                            <select name="role" value={formData.role} onChange={handleInputChange} className="form-input">
                                <option value="VET">Veterinarian</option>
                                <option value="STAFF">Front Desk / Staff</option>
                                <option value="ADMIN">System Administrator</option>
                            </select>

                            <input type="text" name="firstName" placeholder="First Name" required
                                value={formData.firstName} onChange={handleInputChange} className="form-input" />

                            <input type="text" name="lastName" placeholder="Last Name" required
                                value={formData.lastName} onChange={handleInputChange} className="form-input" />

                            <input type="email" name="email" placeholder="Email Address" required
                                value={formData.email} onChange={handleInputChange} className="form-input" />

                            <input type="text" name="password" placeholder="Temporary Password" required
                                value={formData.password} onChange={handleInputChange} className="form-input" />

                            <input type="tel" name="mobileNumber" placeholder="Phone Number"
                                value={formData.mobileNumber} onChange={handleInputChange} className="form-input" />

                            <div className="form-actions">
                                <button type="button" onClick={() => setShowModal(false)} className="btn-cancel">
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-teal">
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default ManageStaff;