import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../../../../services/petService';
import '../../../../styles/PetDetail.css';
import '../../../../styles/StaffDashboard.css';

const SPECIES_EMOJI = { Dog: '🐕', Cat: '🐈', Bird: '🐦', Rabbit: '🐇', Fish: '🐟' };

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
      
      // Filter for this pet and UPCOMING status
      const petAppts = allAppts.filter(a => 
        (a.petId === pet.petId || a.pet?.petId === pet.petId) && 
        (a.status || '').toUpperCase() === 'UPCOMING'
      );

      // Sort by date and time
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
  const emoji = SPECIES_EMOJI[pet.species] || '🐾';

  return (
    <div
      className="pet-detail-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`${pet.name}'s profile`}
    >
      <div className="pet-detail-panel staff-pet-detail-panel" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="pet-detail-header staff-pet-detail-header">
          {pet.petImagePath ? (
            <img src={`${API_BASE_URL}/${pet.petImagePath}`} alt={pet.name} />
          ) : (
            <div className="pet-detail-avatar-fallback">
              <span>{emoji}</span>
            </div>
          )}
          <button className="pet-detail-back-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="pet-detail-body">
          <div className="pet-detail-title-row">
            <h2 className="pet-detail-name">{pet.name}</h2>
            <span className="pet-detail-species-badge">{pet.species}</span>
          </div>

          {/* Owner info */}
          <div className="staff-owner-info-card">
            <div className="staff-owner-info-label">👤 Owner</div>
            <div className="staff-owner-info-value">{pet.ownerName || '—'}</div>
            <div className="staff-owner-info-sub">Registered owner of this pet</div>
          </div>

          {/* Pet details grid */}
          <div className="pet-detail-grid">
            <div className="pet-detail-field">
              <div className="pet-detail-field-label">Breed</div>
              <div className="pet-detail-field-value">{pet.breed || 'Mixed / Unknown'}</div>
            </div>
            <div className="pet-detail-field">
              <div className="pet-detail-field-label">Gender</div>
              <div className="pet-detail-field-value">
                {pet.gender === 'MALE' ? '♂ Male' : pet.gender === 'FEMALE' ? '♀ Female' : '? Unknown'}
              </div>
            </div>
            <div className="pet-detail-field">
              <div className="pet-detail-field-label">Age</div>
              <div className="pet-detail-field-value">{calcAge(pet.dateOfBirth)}</div>
            </div>
            <div className="pet-detail-field">
              <div className="pet-detail-field-label">Date of Birth</div>
              <div className="pet-detail-field-value">
                {pet.dateOfBirth ? new Date(pet.dateOfBirth).toLocaleDateString('en-GB') : '—'}
              </div>
            </div>
            <div className="pet-detail-field">
              <div className="pet-detail-field-label">Weight</div>
              <div className="pet-detail-field-value">{pet.weight ? `${pet.weight} kg` : '—'}</div>
            </div>
            <div className="pet-detail-field">
              <div className="pet-detail-field-label">Pet ID</div>
              <div className="pet-detail-field-value">#{pet.petId}</div>
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="staff-appointment-section">
            <div className="staff-appointment-title">
              <span>📅</span> Upcoming Appointments
            </div>
            
            {loading ? (
              <div className="staff-appointment-loading">Loading appointments...</div>
            ) : appointments.length === 0 ? (
              <div className="staff-appointment-empty">
                <span>📅</span>
                <p>No upcoming appointments scheduled.</p>
                <small>Latest data fetched from system.</small>
              </div>
            ) : (
              <div className="staff-upcoming-appt-card">
                <div className="staff-appt-main">
                  <div className="staff-appt-type">{appointments[0].appointmentType}</div>
                  <div className="staff-appt-time">
                    <strong>{appointments[0].date}</strong> at {appointments[0].timeSlot}
                  </div>
                </div>
                <div className="staff-appt-doctor">
                  Doctor: {appointments[0].doctor || 'Not assigned'}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pet-detail-actions">
            <button className="pet-detail-btn secondary" onClick={onClose}>
              Close
            </button>
            <button 
              className="btn btn-dark-blue"
              onClick={() => navigate('/dashboard/pet-medical-record', { state: { pet } })}
              style={{ width: '100%', marginTop: '12px' }}
            >
              View Medical Records
            </button>

          </div>

          <p className="pet-detail-registered">
            Registered on {pet.createdAt ? new Date(pet.createdAt).toLocaleDateString('en-GB') : '—'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StaffPetDetail;
