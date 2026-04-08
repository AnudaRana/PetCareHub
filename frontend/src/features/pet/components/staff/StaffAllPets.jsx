import React, { useState, useEffect, useCallback } from 'react';
import { getImageUrl, getAllPets } from '../../../../services/petService';
import StaffPetDetail from './StaffPetDetail';
import '../../../../styles/MyPets.css';
import '../../../../styles/StaffDashboard.css';

const StaffAllPets = () => {
    // ... (rest of the component state/logic stays same)
  const [pets, setPets]               = useState([]);
  const [filtered, setFiltered]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPet, setSelectedPet] = useState(null);

  const fetchAllPets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllPets();
      const list = response?.data || response || [];
      setPets(list);
      setFiltered(list);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load pets. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAllPets(); }, [fetchAllPets]);

  useEffect(() => {
    if (!searchQuery.trim()) { setFiltered(pets); return; }
    const q = searchQuery.toLowerCase();
    setFiltered(
      pets.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        String(p.petId)?.includes(q) ||
        p.ownerName?.toLowerCase().includes(q)
      )
    );
  }, [searchQuery, pets]);

  return (

    <div className="my-pets-container animate-fade-up">
      {/* Header with Role Badge */}
      <div className="staff-home-greeting">
        <div>
          <h1>Clinic Pet Registry</h1>
          <p>Access and manage pet information for clinic operations and records.</p>
        </div>
        <div className="staff-role-badge">
          <span className="staff-sidebar-role-icon">📋</span>
          Clinic Staff
        </div>
      </div>

      {/* Stats Summary */}
      <div className="staff-stats-grid">
        <div className="staff-stat-card" style={{ '--accent': 'var(--color-primary)' }}>
          <div className="staff-stat-icon">🐕</div>
          <div className="staff-stat-value">{!loading && !error ? pets.length : '—'}</div>
          <div className="staff-stat-label">Total Registry</div>
          <div className="staff-stat-sub">Active patients</div>
        </div>
        <div className="staff-stat-card" style={{ '--accent': '#10B981' }}>
          <div className="staff-stat-icon">📈</div>
          <div className="staff-stat-value">{!loading && !error ? filtered.length : '—'}</div>
          <div className="staff-stat-label">Filtered Results</div>
          <div className="staff-stat-sub">Active search database</div>
        </div>
      </div>

      {/* Advanced Search */}
      <div className="search-bar-wrapper">
        <span className="search-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input
          className="search-input"
          type="text"
          placeholder="Search by pet name, ID, or owner name..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          aria-label="Search patients"
          style={{ maxWidth: 520 }}
        />
      </div>

      {error && (
        <div className="error-banner">
          <span style={{ fontSize: '1.2rem' }}>⚠️</span>
          <div style={{ flex: 1 }}>{error}</div>
          <button onClick={fetchAllPets}>Retry Sync</button>
        </div>
      )}

      {loading && (
        <div className="loading-container">
          <div className="spinner" aria-label="Loading pets..." />
          <p style={{ color: 'var(--color-text-light)', fontWeight: 500 }}>Syncing registry data...</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {filtered.length > 0 && (
            <p className="pets-count-label">
              Showing <span>{filtered.length}</span> patient record{filtered.length !== 1 ? 's' : ''}
              {searchQuery && ` for "${searchQuery}"`}
            </p>
          )}

          {filtered.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state-icon">🔍</span>
              <h3>No patient profiles found</h3>
              {searchQuery
                ? <p>We couldn't find any results for "<strong>{searchQuery}</strong>". Try searching by ID or name.</p>
                : <p>No pet profiles are currently registered in the clinic database.</p>
              }
            </div>
          ) : (
            <div className="staff-pets-table shadow-premium">
              <div className="staff-pets-table-header">
                <span>Patient</span>
                <span>Registry Info</span>
                <span>Primary Owner</span>
                <span>Age</span>
                <span>Gender</span>
                <span>Operations</span>
              </div>
              {filtered.map(pet => (
                <StaffPetRow key={pet.petId} pet={pet} onSelect={setSelectedPet} />
              ))}
            </div>
          )}
        </>
      )}

      {selectedPet && (
        <StaffPetDetail pet={selectedPet} onClose={() => setSelectedPet(null)} />
      )}
    </div>

  );
};

const calcAge = (dob) => {
  if (!dob) return 'Unknown';
  const today = new Date();
  const birth = new Date(dob);
  const years = today.getFullYear() - birth.getFullYear();
  const months = today.getMonth() - birth.getMonth();
  if (years === 0) return `${months < 0 ? 0 : months}mo`;
  return `${years}yr`;
};

const StaffPetRow = ({ pet, onSelect }) => {
  const imageUrl = getImageUrl(pet.petImagePath);
  return (
    <div className="staff-pets-table-row" onClick={() => onSelect(pet)}>
      <span className="staff-pet-name-cell">
        <div className="staff-pet-mini-avatar">
          {imageUrl
            ? <img src={imageUrl} alt={pet.name} />
            : <span className="placeholder-icon">🐾</span>
          }
        </div>
        <div>
          <div style={{ fontWeight: 700, color: 'var(--color-text)' }}>{pet.name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>ID: #{pet.petId}</div>
        </div>
      </span>
      <span>
        <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{pet.species}</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>{pet.breed || 'Mixed'}</div>
      </span>
      <span>
        <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{pet.ownerName || '—'}</div>
      </span>
      <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>{calcAge(pet.dateOfBirth)}</span>
      <span style={{ fontSize: '0.85rem' }}>
        {pet.gender === 'MALE' ? '♂ Male' : pet.gender === 'FEMALE' ? '♀ Female' : '? Unknown'}
      </span>
      <span>
        <button className="staff-view-btn" onClick={e => { e.stopPropagation(); onSelect(pet); }}>
          View Profile
        </button>
      </span>
    </div>
  );
};

export default StaffAllPets;
