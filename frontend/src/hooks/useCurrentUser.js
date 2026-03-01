import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../services/petService';

const useCurrentUser = () => {
    const [user, setUser] = useState({
        userId: null,
        firstName: '',
        lastName: '',
        fullName: 'User',
        email: '',
        initials: 'U',
        role: null,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const getInitials = (firstName = '', lastName = '') =>
        `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        return token ? { Authorization: `Bearer ${token}` } : {};
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                // Task 2: Read directly from sessionStorage
                let userId = sessionStorage.getItem('userId');
                const role = sessionStorage.getItem('role');
                const username = sessionStorage.getItem('username');

                // Fallback as requested by user
                if (!userId) {
                    console.warn('userId missing in sessionStorage, falling back to 1');
                    userId = 1;
                }

                const { data } = await axios.get(`${API_BASE_URL}/api/admin/users/${userId}`, {
                    headers: getAuthHeaders()
                });

                if (data && data.userId) {
                    const firstName = data.firstName || '';
                    const lastName = data.lastName || '';
                    setUser({
                        userId: data.userId,
                        firstName,
                        lastName,
                        fullName: `${firstName} ${lastName}`.trim() || data.username || data.email || 'User',
                        email: data.email || data.username || '',
                        initials: getInitials(firstName, lastName),
                        role: role || data.roles?.[0] || 'OWNER',
                    });
                } else if (userId) {
                    // If backend return empty but we have a userId
                    setUser(prev => ({ ...prev, userId, role }));
                }
            } catch (err) {
                console.error('Error fetching current user:', err);
                setError(err);
                // Set whatever we have from session
                const userId = sessionStorage.getItem('userId') || 1;
                const role = sessionStorage.getItem('role');
                setUser(prev => ({ ...prev, userId, role }));
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    return { ...user, loading, error };
};

export default useCurrentUser;
