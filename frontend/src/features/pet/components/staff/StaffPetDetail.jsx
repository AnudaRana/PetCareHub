import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../../../../services/petService';
import '../../../../styles/PetDetail.css';
import '../../../../styles/StaffDashboard.css';

const calcAge = (dob) => {
    if (!dob) return 'Unknown';
    const today = new Date();
    const birth = new Date(dob);
    const years = today.getFullYear() - birth.getFullYear();
    const months = today.getMonth() - birth.getMonth();
    if (years === 0) return `${months < 0 ? 0 : months} months`;
    return `${years} year${years > 1 ? 's' : ''}`;
};

const StaffPetDetail = ({ pet, onClose }) => {
    const navigate = useNavigate();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (pet?.petId) {
            fetchAppointments();
        }
    }, [pet]);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/appointments');
            const allAppts = Array.isArray(res.data) ? res.data : [];
            
            const petAppts = allAppts.filter(a => 
                (a.petId === pet.petId || a.pet?.petId === pet.petId) && 
                (a.status || '').toUpperCase() === 'UPCOMING'
            );

            const sorted = petAppts.sort((a, b) => {
                const dateA = new Date(`${a.date} ${a.timeSlot || ''}`);
                const dateB = new Date(`${b.date} ${b.timeSlot || ''}`);
                return dateA - dateB;
            });

            setAppointments(sorted);
        } catch (error) {
            console.error("Failed to fetch appointments for staff pet detail:", error);
        } finally {
            setLoading(false);
        }
    };

    if (!pet) return null;
    const imageUrl = getImageUrl(pet.petImagePath);

    return (
        <div
            className="pet-detail-overlay"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
        >
            <div className="pet-detail-panel staff-pet-detail-panel" onClick={e => e.stopPropagation()}>
                <header className="pet-detail-header">
                    {imageUrl ? (
                        <img src={imageUrl} alt={pet.name} />
                    ) : (
                        <div className="pet-detail-avatar-fallback">
                            <span className="placeholder-icon">🐾</span>
                        </div>
                    )}
                    <div className="doc-sidebar-role-badge" style={{ position: 'absolute', top: '20px', left: '20px', margin: 0, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}>
                        CLINIC REGISTRY
                    </div>
                    <button className="pet-detail-back-btn" onClick={onClose} aria-label="Close">✕</button>
                </header>

                <div className="pet-detail-body">
                    <div className="pet-detail-title-row">
                        <h2 className="pet-detail-name">{pet.name}</h2>
                        <span className="pet-detail-species-badge">{pet.species.toLowerCase()}</span>
                    </div>

                    <div className="staff-owner-info-card">
                        <div className="staff-owner-info-label">Registered Owner</div>
                        <div className="staff-owner-info-value">{pet.ownerName || 'Unknown / Walk-in'}</div>
                        <div className="staff-owner-info-sub">Primary contact for clinic notifications</div>
                    </div>

                    <div className="pet-detail-grid">
                        <div className="pet-detail-field">
                            <div className="pet-detail-field-label">Breed</div>
                            <div className="pet-detail-field-value">{pet.breed || 'Companion'}</div>
                        </div>
                        <div className="pet-detail-field">
                            <div className="pet-detail-field-label">Gender</div>
                            <div className="pet-detail-field-value">
                                {pet.gender === 'MALE' ? '♂ Male' : pet.gender === 'FEMALE' ? '♀ Female' : '? Mixed'}
                            </div>
                        </div>
                        <div className="pet-detail-field">
                            <div className="pet-detail-field-label">Registry Age</div>
                            <div className="pet-detail-field-value">{calcAge(pet.dateOfBirth)}</div>
                        </div>
                        <div className="pet-detail-field">
                            <div className="pet-detail-field-label">Last Weight</div>
                            <div className="pet-detail-field-value">{pet.weight ? `${pet.weight} kg` : 'N/A'}</div>
                        </div>
                        <div className="pet-detail-field full-width">
                            <div className="pet-detail-field-label">Date of Birth</div>
                            <div className="pet-detail-field-value">
                                {pet.dateOfBirth ? new Date(pet.dateOfBirth).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
                            </div>
                        </div>
                        <div className="pet-detail-field full-width">
                            <div className="pet-detail-field-label">Registry ID</div>
                            <div className="pet-detail-field-value" style={{ fontFamily: 'monospace', letterSpacing: '1px' }}>HUB-{pet.petId}</div>
                        </div>
                    </div>

                    <div className="staff-appointment-section">
                        <div className="staff-appointment-title">
                            <span>📅</span> SCHEDULED CLINIC VISITS
                        </div>
                        
                        {loading ? (
                            <div className="staff-appointment-loading">Querying clinic schedule...</div>
                        ) : appointments.length === 0 ? (
                            <div className="staff-appointment-empty">
                                <span>📅</span>
                                <p>No visits scheduled.</p>
                                <small>The patient has no upcoming appointments registered in the Hub.</small>
                            </div>
                        ) : (
                            <div className="staff-upcoming-appt-card shadow-premium">
                                <div className="staff-appt-main">
                                    <div className="staff-appt-type">{appointments[0].appointmentType}</div>
                                    <div className="staff-appt-time">
                                        <strong>{new Date(appointments[0].date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</strong> {appointments[0].timeSlot}
                                    </div>
                                </div>
                                <div className="staff-appt-doctor">
                                    Assigned: Dr. {appointments[0].doctorName || 'Not assigned'}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="pet-detail-actions">
                        <button className="btn btn-white" onClick={onClose} style={{ flex: 1 }}>
                            Close Profile
                        </button>
                        <button 
                            className="btn btn-dark-blue"
                            onClick={() => navigate('/dashboard/pet-medical-record', { state: { pet } })}
                            style={{ flex: 1.5 }}
                        >
                            📊 Registry Records
                        </button>
                    </div>

                    <p className="pet-detail-registered">
                        Database footprint since {pet.createdAt ? new Date(pet.createdAt).toLocaleDateString('en-GB') : '—'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default StaffPetDetail;
