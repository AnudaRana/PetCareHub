import React, { useState, useEffect, useCallback } from 'react';
import { getPetsByOwner, searchPetsByOwner } from '../../../../services/petService';
import PetCard from './PetCard';
import PetDetail from './PetDetail';
import AddPetForm from './AddPetForm';
import '../../../../styles/MyPets.css';
import { useAuth } from '../../../auth/contexts/AuthContext';

const MyPets = () => {
    // ─── User State ──────────────────────────────────────────────
    const { user, hasRole } = useAuth();
    const userId = user?.userId;
    const loadingUser = !user;

    // ─── Pet State ───────────────────────────────────────────────
    const [pets, setPets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPet, setSelectedPet] = useState(null);
    const [showAddForm, setShowAddForm] = useState(false);

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
            setPets(Array.isArray(response) ? response : response.data || []);
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
    

    return (
        

        <div className="my-pets-container">
            {/* Header section matches image */}
            <header className="my-pets-header" style={{ marginBottom: '40px' }}>
                <div className="my-pets-title">
                    <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.4rem', color: '#1a1a1a' }}>My Pets</h1>
                    <p style={{ color: '#64748b', fontSize: '1rem', fontWeight: 500 }}>Manage and track your beloved companions</p>
                </div>
                <button
                    className="btn-add-pet"
                    onClick={() => setShowAddForm(true)}
                    style={{ 
                        background: '#00f0ff', 
                        color: 'white', 
                        fontWeight: 700, 
                        padding: '12px 28px', 
                        borderRadius: '12px',
                        boxShadow: '0 4px 15px rgba(0, 240, 255, 0.3)'
                    }}
                >
                    + Add New Pet
                </button>
            </header>

            {/* Stats Overview matches image */}
            <div className="my-pets-stats-row" style={{ marginBottom: '48px' }}>
                <div className="stat-card-simple" style={{ 
                    background: 'white', 
                    padding: '24px 32px', 
                    borderRadius: '20px', 
                    width: '300px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
                    border: '1px solid #f1f5f9'
                }}>
                    <div style={{ fontSize: '2.8rem', fontWeight: 800, color: '#1e293b', marginBottom: '8px' }}>
                        {!loading && !error ? pets.length : '0'}
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 700, color: '#334155' }}>My Pets</div>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>registered</div>
                </div>
            </div>

            {/* Search Bar matches image */}
            <div className="search-bar-wrapper" style={{ 
                background: 'white', 
                borderRadius: '12px', 
                padding: '4px 8px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                marginBottom: '32px',
                width: '100%',
                maxWidth: '500px',
                border: '1px solid #f1f5f9'
            }}>
                <span className="search-icon" style={{ opacity: 0.5 }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
                    style={{ border: 'none', background: 'transparent' }}
                />
            </div>

            {/* Error handling */}
            {error && (
                <div className="error-banner">
                    <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                    <div style={{ flex: 1 }}>{error}</div>
                    <button onClick={() => fetchPets(searchQuery)}>Retry Connection</button>
                </div>
            )}

            {/* Loading active state */}
            {loading && (
                <div className="loading-container">
                    <div className="spinner" aria-label="Loading pets..." />
                    <p style={{ color: 'var(--color-text-light)', fontWeight: 500 }}>Fetching pet profiles...</p>
                </div>
            )}

            {/* Content grid */}
            {!loading && !error && (
                <>
                    {pets.length > 0 && (
                        <p className="pets-count-label" style={{ marginBottom: '24px', fontSize: '0.9rem', color: '#64748b' }}>
                            Showing <strong>{pets.length}</strong> pet{pets.length !== 1 ? 's' : ''}
                        </p>
                    )}

                    {pets.length === 0 ? (
                        <div className="empty-state">
                            <span className="empty-state-icon">🐾</span>
                            <h3>No companion profiles found</h3>
                            {searchQuery ? (
                                <p>We couldn't find any results for "<strong>{searchQuery}</strong>". Try another keyword.</p>
                            ) : (
                                <p>You haven't registered any pets yet. Start by adding your first furry friend!</p>
                            )}
                            <button className="btn btn-teal" onClick={() => setShowAddForm(true)} style={{ marginTop: '16px' }}>
                                + Add Your First Pet
                            </button>
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

                            {/* Add pet card-like button */}
                            {/* Add New Pet Card matches image */}
                            {!searchQuery && (
                                <div className="add-pet-card" 
                                     style={{ 
                                         minHeight: '280px', 
                                         display: 'flex',
                                         flexDirection: 'column', 
                                         alignItems: 'center',
                                         justifyContent: 'center',
                                         border: '2px dashed #e2e8f0',
                                         background: 'white',
                                         borderRadius: '24px',
                                         cursor: 'pointer',
                                         transition: 'all 0.3s ease'
                                     }}
                                     onClick={() => setShowAddForm(true)}
                                >
                                    <div style={{ 
                                        width: '60px', 
                                        height: '60px', 
                                        borderRadius: '50%', 
                                        background: '#e0faff', 
                                        color: '#00f0ff', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        fontSize: '1.8rem',
                                        marginBottom: '20px'
                                    }}>
                                        +
                                    </div>
                                    <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '1.1rem', marginBottom: '8px' }}>Add New Pet</div>
                                    <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Register a companion</p>
                                </div>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Interactions */}
            {selectedPet && (
                <PetDetail
                    pet={selectedPet}
                    onClose={() => setSelectedPet(null)}
                    onUpdateSuccess={handleAddSuccess}
                    userId={userId}
                />
            )}

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
