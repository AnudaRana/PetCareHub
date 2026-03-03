import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../services/petService';

const getInitials = (firstName = '', lastName = '') =>
  `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || '?';

const decodeJWT = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
};

const useCurrentUser = () => {
  // ── Fast-path seed from localStorage (stored by login developer) ────────
  // The login response stores: { token, email, fullName, roles } in localStorage.
  // Pre-populate immediately so the topbar greeting doesn't flicker.
  const [user, setUser] = useState({
    userId: null,
    firstName: '',
    lastName: '',
    fullName: localStorage.getItem('fullName') || '',
    email: localStorage.getItem('email') || '',
    initials: '',
    role: '',
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // ── Step 1: Get userId and role from localStorage ──────
        // Real login:  token is a real JWT → decode to get userId & roles
        // Dev testing: token starts with 'fake-' → read userId & role directly
        let userId = null;
        // 'role' in localStorage is stored as the full ROLE_XXX string by the login developer
        // e.g. 'ROLE_VET', 'ROLE_OWNER', 'ROLE_STAFF'
        let role = localStorage.getItem('role');

        const token = localStorage.getItem('token');

        if (token && !token.startsWith('fake-')) {
          // Real JWT — decode payload
          const payload = decodeJWT(token);
          if (payload) {
            userId = payload.userId || payload.sub || null;
            // Resolve role: prefer already-stored 'role' (set by login dev),
            // fall back to JWT payload roles array
            if (!role && Array.isArray(payload.roles)) {
              role = payload.roles[0] || null;   // Keep full ROLE_XXX string
              if (role) localStorage.setItem('role', role);
            }
          }
        } else {
          // Dev / fake token — read directly from localStorage
          userId = localStorage.getItem('userId');
        }

        // Last resort fallback
        if (!userId) {
          console.warn('useCurrentUser: No userId found, falling back to userId 1');
          userId = 1;
        }

        // ── Step 2: Fetch full user details from backend ───────
        const { data } = await axios.get(`${API_BASE_URL}/api/admin/users/${userId}`);

        if (!data || !data.userId) {
          throw new Error(`No user found for userId: ${userId}`);
        }

        // ── Step 3: Validate role against backend ──────────────
        const backendRoles = Array.isArray(data.roles) ? data.roles : [];
        let resolvedRole = role;

        if (backendRoles.length > 0) {
          // Backend returns roles as e.g. 'VET', 'OWNER' — normalize to ROLE_XXX
          // to stay consistent with what the login developer stores
          const backendRoleRaw = backendRoles[0].toUpperCase();
          const backendRole = backendRoleRaw.startsWith('ROLE_')
            ? backendRoleRaw
            : `ROLE_${backendRoleRaw}`;
          if (backendRole !== role) {
            console.warn(
              `useCurrentUser: role mismatch — localStorage "${role}" vs backend "${backendRole}". Using backend.`
            );
            resolvedRole = backendRole;
            localStorage.setItem('role', backendRole);
          }
        }

        const firstName = data.firstName || '';
        const lastName = data.lastName || '';

        setUser({
          userId: data.userId,
          firstName,
          lastName,
          fullName: `${firstName} ${lastName}`.trim() || data.email || localStorage.getItem('fullName') || '',
          email: data.email || localStorage.getItem('email') || '',
          initials: getInitials(firstName, lastName),
          role: resolvedRole || '',
          loading: false,
          error: null,
        });

      } catch (err) {
        console.error('useCurrentUser: Failed to fetch user —', err.message);
        setUser(prev => ({ ...prev, loading: false, error: err.message }));
      }
    };

    fetchUser();
  }, []);

  return user;
};

export default useCurrentUser;