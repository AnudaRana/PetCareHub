/**
 * Dev login utility — simulates a successful JWT login for testing.
 * Everything stored in localStorage to match the real login spec.
 *
 * Usage in browser console:
 *   devLogin('owner')        → Anuda     (userId 1)
 *   devLogin('owner', 2)     → Amaya     (userId 2)
 *   devLogin('owner', 3)     → Vindya    (userId 3)
 *   devLogin('owner', 4)     → Piyumi    (userId 4)
 *   devLogin('vet')          → Dr. Nimal (userId 5)
 *   devLogin('staff')        → Staff     (userId 6)
 *
 * Remove this file and its import in index.js before going to production.
 */

const OWNERS = {
  1: { email: 'ranasingheanuda@gmail.com', name: 'Anuda' },
  2: { email: 'amaya@gmail.com', name: 'Amaya' },
  3: { email: 'vindya@gmail.com', name: 'Vindya' },
  4: { email: 'piyumi@gmail.com', name: 'Piyumi' },
};

const VETS = {
  5: { email: 'dr.nimal@petcarehub.com', name: 'Dr. Nimal' },
};

const STAFF = {
  6: { email: 'staff@petcarehub.com', name: 'Staff Member' },
};

export const devLogin = (roleType, userId = null) => {
  const role = roleType.toUpperCase();

  let id, record, roleKey;

  if (role === 'OWNER') {
    id = userId || 1;
    record = OWNERS[id];
    roleKey = 'ROLE_OWNER';
    if (!record) { console.error(`No owner with userId ${id}. Available: ${Object.keys(OWNERS).join(', ')}`); return; }

  } else if (role === 'VET') {
    id = userId || 5;
    record = VETS[id];
    roleKey = 'ROLE_VET';
    if (!record) { console.error(`No vet with userId ${id}. Available: ${Object.keys(VETS).join(', ')}`); return; }

  } else if (role === 'STAFF') {
    id = userId || 6;
    record = STAFF[id];
    roleKey = 'ROLE_STAFF';
    if (!record) { console.error(`No staff with userId ${id}. Available: ${Object.keys(STAFF).join(', ')}`); return; }

  } else {
    console.error('Invalid role. Use "owner", "vet", or "staff".');
    return;
  }

  // Store everything in localStorage — matches real login spec (ROLE_ prefix required)
  localStorage.setItem('token', `fake-jwt-token-${role.toLowerCase()}-${id}`);
  localStorage.setItem('userId', String(id));
  localStorage.setItem('email', record.email);   // matches useCurrentUser fast-path
  localStorage.setItem('fullName', record.name);    // matches useCurrentUser fast-path
  localStorage.setItem('username', record.email);   // legacy fallback
  localStorage.setItem('role', roleKey);        // ROLE_OWNER / ROLE_VET / ROLE_STAFF

  console.log(`✅ Dev login as ${roleKey} — ${record.name} (userId: ${id})`);
  window.location.href = '/';
};

if (typeof window !== 'undefined') {
  window.devLogin = devLogin;
}

export default devLogin;