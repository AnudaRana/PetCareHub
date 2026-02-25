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
                setUserId(2);

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
            <div className="my-pets-header">
                <div className="my-pets-title">
                    <h1>My Pets 🐾</h1>
                    <p>Manage and view all your registered pet profiles</p>
                </div>
                <button
                    className="btn-add-pet"
                    onClick={() => setShowAddForm(true)}
                    id="add-pet-btn"
                >
                    + Add New Pet
                </button>
            </div>

            {/* Search */}
            <div className="search-bar-wrapper">
                <span className="search-icon">🔍</span>
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
