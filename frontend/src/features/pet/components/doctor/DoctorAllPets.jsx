import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { getImageUrl, API_BASE_URL } from '../../../../services/petService';
import { useAuth } from '../../../auth/contexts/AuthContext';
import DoctorPetDetail from './DoctorPetDetail';
import '../../../../styles/MyPets.css';
import '../../../../styles/DoctorDashboard.css';

const DoctorAllPets = () => {
  const { user } = useAuth();
  const [pets, setPets] = useState([]);
  // ... rest of state stays same
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPet, setSelectedPet] = useState(null);

  const fetchAllPets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/pets/all`);
      const list = data?.data || data || [];
      setPets(list);
      setFiltered(list);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load pets. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllPets();
  }, [fetchAllPets]);

  // Client-side search: by pet name, petId, or owner name
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFiltered(pets);
      return;
    }
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
      <div className="doc-home-greeting">
        <div>
          <h1>Patient Health Database</h1>
          <p>Complete pet profiles across all registered owners. Access medical history and vitals.</p>
        </div>
        <div className="doc-role-badge">
          <span className="doc-sidebar-role-icon">⚕️</span>
          Dr. {user?.firstName || 'Vet'}
        </div>
      </div>

      {/* Stats Summary */}
      <div className="doc-stats-grid">
        <div className="doc-stat-card" style={{ '--accent': 'var(--color-primary)' }}>
          <div className="doc-stat-icon">🐕</div>
          <div className="doc-stat-value">{!loading && !error ? pets.length : '—'}</div>
          <div className="doc-stat-label">Total Patients</div>
          <div className="doc-stat-sub">Clinic registered</div>
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
          <button onClick={fetchAllPets}>Retry Connection</button>
        </div>
      )}

      {loading && (
        <div className="loading-container">
          <div className="spinner" aria-label="Loading pets..." />
          <p style={{ color: 'var(--color-text-light)', fontWeight: 500 }}>Decrypting patient records...</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {filtered.length > 0 && (
            <p className="pets-count-label">
              Diagnostic data for <span>{filtered.length}</span> patient{filtered.length !== 1 ? 's' : ''}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          )}

          {filtered.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state-icon">🔍</span>
              <h3>No patient profiles found</h3>
              {searchQuery
                ? <p>We couldn't find any results for "<strong>{searchQuery}</strong>". Check spelling or ID.</p>
                : <p>No pet medical records are currently registered in the clinic system.</p>
              }
            </div>
          ) : (
            <div className="doc-pets-table shadow-premium">
              <div className="doc-pets-table-header">
                <span>Patient</span>
                <span>Clinical Profile</span>
                <span>Primary Owner</span>
                <span>Age</span>
                <span>Gender</span>
                <span>Interactions</span>
              </div>
              {filtered.map(pet => (
                <DoctorPetRow key={pet.petId} pet={pet} onSelect={setSelectedPet} />
              ))}
            </div>
          )}
        </>
      )}

      {selectedPet && (
        <DoctorPetDetail pet={selectedPet} onClose={() => setSelectedPet(null)} />
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

const DoctorPetRow = ({ pet, onSelect }) => {
  const imageUrl = getImageUrl(pet.petImagePath);
  return (
    <div className="doc-pets-table-row" onClick={() => onSelect(pet)}>
      <span className="doc-pet-name-cell">
        <div className="doc-pet-mini-avatar">
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
        <button className="doc-view-btn" onClick={(e) => { e.stopPropagation(); onSelect(pet); }}>
          View Profile
        </button>
      </span>
    </div>
  );
};

export default DoctorAllPets;
