// File: src/components/MyPets.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { getPetsByOwner, searchPetsByOwner } from '../services/petService';
import { API_BASE_URL } from '../services/petService';
import PetCard from './PetCard';
import PetDetail from './PetDetail';
import AddPetForm from './AddPetForm';
import '../styles/MyPets.css';

const MyPets = () => {
    // ─── User State (same pattern as CheckoutPage) ───────────────
    const [userId, setUserId] = useState(null);
    const [loadingUser, setLoadingUser] = useState(true);

    // ─── Pet State ───────────────────────────────────────────────
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPet, setSelectedPet] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);

    // ─── Step 1: Resolve userId from sessionStorage ──────────────
    // Mirrors the CheckoutPage pattern:
    //   - Reads username stored in sessionStorage at login
    //   - Searches the backend to find the matching userId
    //   - Falls back to hardcoded ID 3 for testing while login is not yet wired
    useEffect(() => {
        const getCurrentUserId = async () => {
            try {
                const username = sessionStorage.getItem('username');

                if (username) {
                    // Ask the backend for user info by username
                    const response = await axios.get(
                        `${API_BASE_URL}/api/admin/users/search?name=${encodeURIComponent(username)}`
                    );

                    if (response.data && response.data.length > 0) {
                        const user = response.data.find(u => u.username === username);
                        if (user) {
                            setUserId(user.userId);
                            return; // found — no fallback needed
                        }
                    }
                }

                // Fallback: hardcoded for testing before login is wired
                setUserId(1);

            } catch (error) {
                console.error('❌ Error fetching user ID:', error);
                console.error('❌ Error details:', error.response?.data);
                // Fallback to default user ID for testing
                setUserId(3);
            } finally {
                setLoadingUser(false);
            }
        };

        getCurrentUserId();
    }, []);

    // ─── Step 2: Fetch pets once userId is known ─────────────────
    const fetchPets = useCallback(async (query = '') => {
        if (!userId) return;
        setLoading(true);
        setError(null);
        try {
            let response;
            if (query.trim()) {
                response = await searchPetsByOwner(userId, query.trim());
            } else {
                response = await getPetsByOwner(userId);
            }
            setPets(response.data || []);
        } catch (err) {
            if (err.response?.status === 401) {
                window.location.href = '/login';
            } else {
                setError(err.response?.data?.message || 'Failed to load pets. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    }, [userId]);

    // Fetch pets whenever userId is resolved
    useEffect(() => {
        if (userId) {
            fetchPets();
        }
    }, [userId, fetchPets]);

    // Debounced search
    useEffect(() => {
        if (!userId) return;
        const timer = setTimeout(() => {
            fetchPets(searchQuery);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchQuery, fetchPets, userId]);

    const handleAddSuccess = () => {
        fetchPets(searchQuery);
    };

    // ─── While resolving userId ───────────────────────────────────
    if (loadingUser) {
        return (
            <div className="loading-container">
                <div className="spinner" aria-label="Loading user..." />
                <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem' }}>Loading your profile...</p>
            </div>
        );
    }

    return (
        <div className="my-pets-container">
            {/* Header */}
            <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 700, color: 'var(--color-primary)', margin: '0 0 6px' }}>My Pets</h2>
                    <p style={{ color: 'var(--color-text-light)', fontSize: 14, margin: 0 }}>Manage and track your beloved companions</p>
                </div>
                <button
                    className="btn-add-pet"
                    onClick={() => setShowAddForm(true)}
                    id="add-pet-btn"
                >
                    + Add New Pet
                </button>
            </div>

            {/* Stats row (Reduced to just the one requested by user) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
                <div style={{
                    background: 'var(--color-white)',
                    borderRadius: 14,
                    padding: '20px 22px',
                    boxShadow: '0 2px 12px rgba(62,64,149,0.07)',
                    borderTop: `3px solid var(--color-primary)`,
                    transition: 'transform 0.18s, box-shadow 0.18s',
                }}>
                    <div style={{ fontSize: 30, fontWeight: 800, color: 'var(--color-primary)', fontFamily: "'Playfair Display', serif" }}>
                        {!loading && !error ? pets.length : '-'}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)', marginTop: 2 }}>My Pets</div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-light)', marginTop: 1 }}>registered</div>
                </div>
            </div>

            {/* Search */}
            <div className="search-bar-wrapper">
                <span className="search-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </span>
                <input
                    className="search-input"
                    type="text"
                    placeholder="Search pets by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    id="pet-search-input"
                    aria-label="Search pets by name"
                />
            </div>

            {/* Error Banner */}
            {error && (
                <div className="error-banner">
                    ⚠ {error}
                    <button onClick={() => fetchPets(searchQuery)}>Retry</button>
                </div>
            )}

            {/* Loading pets */}
            {loading && (
                <div className="loading-container">
                    <div className="spinner" aria-label="Loading pets..." />
                    <p style={{ color: 'var(--color-text-light)', fontSize: '0.9rem' }}>Loading your pets...</p>
                </div>
            )}

            {/* Pet Grid */}
            {!loading && !error && (
                <>
                    {pets.length > 0 && (
                        <p className="pets-count-label">
                            Showing <span>{pets.length}</span> pet{pets.length !== 1 ? 's' : ''}
                            {searchQuery && ` matching "${searchQuery}"`}
                        </p>
                    )}

                    {pets.length === 0 ? (
                        <div className="empty-state">
                            <span className="empty-state-icon">🐾</span>
                            <h3>No pet profiles found</h3>
                            {searchQuery ? (
                                <p>No pets match your search "<strong>{searchQuery}</strong>". Try a different name.</p>
                            ) : (
                                <p>You haven't registered any pets yet. Add your first furry friend!</p>
                            )}
                            {!searchQuery && (
                                <button className="btn-add-pet" onClick={() => setShowAddForm(true)}>
                                    + Register Your First Pet
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="pets-grid">
                            {pets.map((pet) => (
                                <PetCard
                                    key={pet.petId}
                                    pet={pet}
                                    onSelect={setSelectedPet}
                                />
                            ))}

                            {/* Add pet card empty state (from inspiration) */}
                            {!searchQuery && (
                                <div style={{
                                    borderRadius: 18, border: `2px dashed rgba(188,190,192,0.5)`,
                                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                    minHeight: 240, cursor: 'pointer', gap: 10, color: 'var(--color-text-light)',
                                    transition: 'border-color 0.18s',
                                    background: 'var(--color-white)',
                                }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-accent)'}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(188,190,192,0.5)'}
                                    onClick={() => setShowAddForm(true)}
                                >
                                    <div style={{
                                        width: 46, height: 46, borderRadius: '50%',
                                        background: `rgba(0,174,239,0.1)`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, color: 'var(--color-accent)',
                                    }}>+</div>
                                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-primary)' }}>Add New Pet</span>
                                    <span style={{ fontSize: 12, color: 'var(--color-text-light)' }}>Register a companion</span>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Pet Detail Modal */}
            {selectedPet && (
                <PetDetail
                    pet={selectedPet}
                    onClose={() => setSelectedPet(null)}
                />
            )}

            {/* Add Pet Form Modal */}
            {showAddForm && (
                <AddPetForm
                    onClose={() => setShowAddForm(false)}
                    onSuccess={handleAddSuccess}
                    userId={userId}
                />
            )}
        </div>
    );
};

export default MyPets;
