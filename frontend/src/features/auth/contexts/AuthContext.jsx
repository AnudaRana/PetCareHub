import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

// Helper for generating initials
const getInitials = (firstName = '', lastName = '') =>
    `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || '?';

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(() => {
        const storedToken = localStorage.getItem('token');
        if (!storedToken) return null;
        try {
            const decoded = jwtDecode(storedToken);
            // Check if expired
            if (decoded.exp && decoded.exp * 1000 < Date.now()) {
                localStorage.removeItem('token');
                return null;
            }
            return storedToken;
        } catch {
            localStorage.removeItem('token');
            return null;
        }
    });

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // ─── Profile Fetching Logic ──────────────────────────────────
    const fetchFullProfile = useCallback(async (authToken) => {
        try {
            setLoading(true);
            const decoded = jwtDecode(authToken);

            const initialUser = {
                userId: decoded.userId || decoded.user_id || localStorage.getItem('userId') || decoded.sub || null,
                email: decoded.sub || null,
                roles: decoded.roles || [],
                firstName: decoded.firstName || '',
                lastName: decoded.lastName || '',
                fullName: decoded.fullName || `${decoded.firstName || ''} ${decoded.lastName || ''}`.trim() || 'User',
                initials: getInitials(decoded.firstName || '', decoded.lastName || ''),
                profilePicture: null
            };

            setUser(initialUser);

            const { data } = await axios.get('/api/auth/me', {
                headers: { Authorization: `Bearer ${authToken}` }
            });

            if (!data) throw new Error('/api/auth/me returned no data');

            let pfp = data.profilePicture;
            if (pfp && !pfp.startsWith('data:image')) {
                pfp = `data:image/jpeg;base64,${pfp}`;
            }

            const firstName = data.firstName || initialUser.firstName;
            const lastName = data.lastName || initialUser.lastName;

            const resolvedUser = {
                userId: data.userId || initialUser.userId,
                email: data.email || initialUser.email,
                firstName,
                lastName,
                fullName: data.fullName || `${firstName} ${lastName}`.trim() || initialUser.fullName,
                initials: getInitials(firstName, lastName),
                roles: data.roles || initialUser.roles,
                profilePicture: pfp || initialUser.profilePicture
            };

            if (resolvedUser.userId) localStorage.setItem('userId', String(resolvedUser.userId));
            if (resolvedUser.fullName) localStorage.setItem('fullName', resolvedUser.fullName);
            if (resolvedUser.email) localStorage.setItem('email', resolvedUser.email);
            if (resolvedUser.roles?.length) localStorage.setItem('role', resolvedUser.roles[0]);

            setUser(resolvedUser);
        } catch (err) {
            console.error('AuthContext: Profile fetch failed', err);
            const decoded = jwtDecode(authToken);
            const fallbackUser = {
                email: decoded.sub,
                roles: decoded.roles || [],
                userId: decoded.userId || decoded.user_id || null,
                firstName: decoded.firstName || '',
                lastName: decoded.lastName || '',
                fullName: decoded.fullName || `${decoded.firstName || ''} ${decoded.lastName || ''}`.trim() || 'User'
            };
            if (fallbackUser.userId) localStorage.setItem('userId', String(fallbackUser.userId));
            if (fallbackUser.fullName) localStorage.setItem('fullName', fallbackUser.fullName);
            if (fallbackUser.email) localStorage.setItem('email', fallbackUser.email);
            if (fallbackUser.roles?.length) localStorage.setItem('role', fallbackUser.roles[0]);
            setUser(fallbackUser);
        } finally {
            setLoading(false);
        }
    }, []);

    // ─── Axios Interceptors ──────────────────────────────────────
    useEffect(() => {
        const requestInterceptor = axios.interceptors.request.use((config) => {
            if (token) config.headers.Authorization = `Bearer ${token}`;
            return config;
        });

        const responseInterceptor = axios.interceptors.response.use(
            (res) => res,
            (err) => {
                if (err.response?.status === 401) logout();
                return Promise.reject(err);
            }
        );

        return () => {
            axios.interceptors.request.eject(requestInterceptor);
            axios.interceptors.response.eject(responseInterceptor);
        };
    }, [token]);

    // ─── Sync User on Token Change ───────────────────────────────
    useEffect(() => {
        if (token) {
            fetchFullProfile(token);
        } else {
            setUser(null);
            setLoading(false);
        }
    }, [token, fetchFullProfile]);

    // ─── Auth Actions ────────────────────────────────────────────
    const login = async (email, password) => {
        const res = await axios.post('/api/auth/login', { email, password });
        const { token: newToken, userId, fullName, roles, email: loginEmail } = res.data;

        localStorage.setItem('token', newToken);
        if (userId) localStorage.setItem('userId', String(userId));
        if (fullName) localStorage.setItem('fullName', fullName);
        if (loginEmail) localStorage.setItem('email', loginEmail);
        if (roles?.length) localStorage.setItem('role', roles[0]);

        setToken(newToken);
        return { success: true, roles };
    };

    const register = async (payload) => {
        await axios.post('/api/auth/register', payload);
    };

    const logout = () => {
        localStorage.clear(); // Clears token, userId, and role
        setToken(null);
        setUser(null);
    };

    const hasRole = (role) => {
        const checkRole = role.startsWith('ROLE_') ? role : `ROLE_${role}`;
        return user?.roles?.some(r => r.toUpperCase() === checkRole.toUpperCase()) || false;
    };

    const refreshProfile = () => token && fetchFullProfile(token);

    return (
        <AuthContext.Provider value={{
            user,
            userId: user?.userId,
            token,
            loading,
            login,
            register,
            logout,
            hasRole,
            refreshProfile,
            updateContextProfile: refreshProfile,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);