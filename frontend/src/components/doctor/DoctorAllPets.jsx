import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../services/petService';
import DoctorPetDetail from './DoctorPetDetail';
import '../../styles/MyPets.css';
import '../../styles/DoctorDashboard.css';

const SPECIES_EMOJI = { Dog: '🐕', Cat: '🐈', Bird: '🐦', Rabbit: '🐇', Fish: '🐟' };

const DoctorAllPets = () => {
  const [pets, setPets] = useState([]);
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
    <div className="my-pets-container">
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: 'var(--color-primary)', margin: '0 0 6px' }}>
          All Pet Profiles
        </h2>
        <p style={{ color: 'var(--color-text-light)', fontSize: 14, margin: 0 }}>
          View complete pet profiles across all registered owners. Profiles are read-only.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        <div className="doc-stat-card-inline" style={{ '--accent': '#3B82F6' }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: '#3B82F6', fontFamily: "'Playfair Display', serif" }}>
            {!loading && !error ? pets.length : '—'}
          </div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginTop: 2 }}>Total Pets</div>
          <div style={{ fontSize: 11, color: 'var(--color-text-light)', marginTop: 1 }}>registered</div>
        </div>
      </div>

      {/* Search */}
      <div className="search-bar-wrapper" style={{ marginBottom: 24 }}>
        <span className="search-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
          aria-label="Search pets"
          style={{ maxWidth: 480 }}
        />
      </div>



      {error && (
        <div className="error-banner">
          ⚠ {error}
          <button onClick={fetchAllPets}>Retry</button>
        </div>
      )}

      {loading && (
        <div className="loading-container">
          <div className="spinner" aria-label="Loading pets..." />
          <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem' }}>Loading all pet profiles...</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {filtered.length > 0 && (
            <p className="pets-count-label">
              Showing <span>{filtered.length}</span> of <span>{pets.length}</span> pet{pets.length !== 1 ? 's' : ''}
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          )}

          {filtered.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state-icon">🐾</span>
              <h3>No pet profiles found</h3>
              {searchQuery
                ? <p>No pets match your search "<strong>{searchQuery}</strong>". Try a different term.</p>
                : <p>No pets are registered in the system yet.</p>
              }
            </div>
          ) : (
            <div className="doc-pets-table">
              <div className="doc-pets-table-header">
                <span>Pet</span>
                <span>Species / Breed</span>
                <span>Owner</span>
                <span>Age</span>
                <span>Gender</span>
                <span>Actions</span>
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
  const emoji = SPECIES_EMOJI[pet.species] || '🐾';
  return (
    <div className="doc-pets-table-row" onClick={() => onSelect(pet)}>
      <span className="doc-pet-name-cell">
        <div className="doc-pet-mini-avatar">
          {pet.petImagePath
            ? <img src={`${API_BASE_URL}/${pet.petImagePath}`} alt={pet.name} />
            : <span>{emoji}</span>
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
