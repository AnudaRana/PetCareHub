import React, { useState, useEffect } from 'react';
import '../../../styles/DoctorChanneling.css';
import axios from 'axios';
import { getPetsByOwner } from '../../../services/petService';
import { getAllVets } from '../../../services/vetService';
import { getSlotsByVet } from '../../../services/timeSlotService';
import { useAuth } from '../../auth/contexts/AuthContext';

/* -----------------------------
   Constants
----------------------------- */
const APPOINTMENT_PRICES = {
  Vaccination: 2500,
  Checkup: 2000,
  Operation: 12000,
};

/* -----------------------------
   Small Reusable Components
----------------------------- */
const FormField = ({ label, children, className = '' }) => (
  <div className={`form-row ${className}`}>
    <label>{label}</label>
    {children}
  </div>
);

const TimeSlotButton = ({ slot, booked, selected, disabled, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`slot-btn${selected ? ' slot-btn--selected' : ''}${booked ? ' slot-btn--booked' : ''}${disabled ? ' slot-btn--disabled' : ''}`}
  >
    <div className="slot-btn__time">{slot.time}</div>
    <div className="slot-btn__doctor">{slot.doctor}</div>
    {booked && <div className="slot-btn__booked-label">Booked</div>}
  </button>
);

const SuccessModal = ({ onClose }) => (
  <div className="success-modal-overlay">
    <div className="success-modal">
      <div className="success-modal__icon">✓</div>
      <h3 className="success-modal__title">Appointment Confirmed!</h3>
      <p className="success-modal__message">
        An email confirmation has been sent to your registered email address.
        Thank you for using our services!
      </p>
      <button className="btn btn-teal" onClick={onClose} style={{ width: '100%', marginTop: '10px' }}>
        Done
      </button>
    </div>
  </div>
);

/* -----------------------------
   Main Component
----------------------------- */
const DoctorChanneling = () => {
  const { userId } = useAuth();

  const [pets, setPets] = useState([]);
  const [vets, setVets] = useState([]);
  const [selectedPet, setSelectedPet] = useState('');
  const [appointmentType, setAppointmentType] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState('');
  const [priceSummary, setPriceSummary] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedVetId, setSelectedVetId] = useState(null);
  const [notes, setNotes] = useState('');
  const [bookedSlots, setBookedSlots] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loadingVets, setLoadingVets] = useState(true);
  // Doctor-specific slots fetched from the backend
  const [doctorSlots, setDoctorSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState('');

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const isPastTimeSlotToday = (time) => {
    if (selectedDate !== today) return false;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();

    const [slotTime, modifier] = time.split(' ');
    let [hours, minutes] = slotTime.split(':');

    hours = parseInt(hours, 10);
    minutes = parseInt(minutes, 10);

    if (modifier === 'PM' && hours !== 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;

    return hours < currentHour || (hours === currentHour && minutes <= currentMinutes);
  };

  useEffect(() => {
    if (!userId) return;

    getPetsByOwner(userId)
      .then((res) => setPets(Array.isArray(res) ? res : res.data || []))
      .catch((err) => console.error('Failed to load pets:', err));
  }, [userId]);

  useEffect(() => {
    setLoadingVets(true);
    getAllVets()
      .then((res) => {
        // Backend now returns the array directly
        setVets(Array.isArray(res) ? res : (res.data || []));
        setLoadingVets(false);
      })
      .catch((err) => {
        console.error('Failed to load vets:', err);
        setLoadingVets(false);
      });
  }, []);

  useEffect(() => {
    if (!selectedDate) {
      setBookedSlots([]);
      return;
    }

    // Include vetId so we only get booked slots for the selected vet
    const vetParam = selectedVetId ? `&vetId=${selectedVetId}` : '';
    axios
      .get(`/api/appointments/booked-slots?date=${selectedDate}${vetParam}`)
      .then((res) => setBookedSlots(res.data || []))
      .catch((err) => console.error('Failed to load booked slots:', err));
  }, [selectedDate, selectedVetId]);

  // Fetch doctor-specific time slots from the backend whenever the selected vet changes
  useEffect(() => {
    if (!selectedVetId) {
      setDoctorSlots([]);
      setSlotsError('');
      return;
    }

    setLoadingSlots(true);
    setSlotsError('');
    getSlotsByVet(selectedVetId)
      .then((data) => {
        setDoctorSlots(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error('Failed to load doctor slots:', err);
        setSlotsError('Could not load time slots for this doctor.');
        setDoctorSlots([]);
      })
      .finally(() => setLoadingSlots(false));
  }, [selectedVetId]);

  const handleAppointmentTypeChange = (value) => {
    setAppointmentType(value);
    setPriceSummary(APPOINTMENT_PRICES[value] || 0);
  };

  const handleDoctorChange = (value) => {
    setSelectedDoctorFilter(value);
    const selectedVet = vets.find((v) => `${v.firstName} ${v.lastName}` === value);
    if (selectedVet) {
      setSelectedVetId(selectedVet.userId);
    }
    setSelectedDoctor('');
    setSelectedSlot(null);
  };

  const isSlotBooked = (time, vetId) => {
    return bookedSlots.some(
      (slot) => slot.timeSlot === time && String(slot.vetId) === String(vetId)
    );
  };

  const getVisibleSlots = () => {
    if (!selectedDoctorFilter) return [];
    // Build slot objects from the backend-sourced list for this vet
    return doctorSlots.map((s) => ({
      time: s.timeSlot,
      doctor: selectedDoctorFilter,
      vetId: selectedVetId,
      label: s.label || '',
    }));
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setSelectedDoctor(slot.doctor);
  };

  const resetForm = () => {
    setSelectedSlot(null);
    setSelectedDoctor('');
    setSelectedDoctorFilter('');
    setSelectedVetId(null);
    setNotes('');
    setAppointmentType('');
    setSelectedPet('');
    setSelectedDate('');
    setPriceSummary(0);
  };

  const handleSubmit = async () => {
    if (
      !selectedPet ||
      !appointmentType ||
      !selectedDate ||
      !selectedDoctorFilter ||
      !selectedSlot ||
      !selectedDoctor
    ) {
      setErrorMessage('Please fill in all required fields before confirming the appointment.');
      return;
    }

    const selectedDateObj = new Date(`${selectedDate}T00:00:00`);
    const todayObj = new Date(`${today}T00:00:00`);

    if (selectedDateObj < todayObj) {
      setErrorMessage('You cannot book an appointment for a past date.');
      return;
    }

    if (isPastTimeSlotToday(selectedSlot.time)) {
      setErrorMessage('You cannot book a past time slot for today.');
      return;
    }

    setErrorMessage('');

    try {
      const appointmentData = {
        userId,
        vetId: selectedVetId,
        petId: Number(selectedPet),
        appointmentType,
        date: selectedDate,
        timeSlot: selectedSlot.time,
        // 'doctor' is intentionally omitted — the backend derives it from the vet entity
        notes,
        price: Number(priceSummary),
      };

      await axios.post('/api/appointments', appointmentData);

      // Refresh booked slots filtered by the selected vet
      const vetParam = selectedVetId ? `&vetId=${selectedVetId}` : '';
      const res = await axios.get(`/api/appointments/booked-slots?date=${selectedDate}${vetParam}`);
      setBookedSlots(res.data || []);

      resetForm();
      setShowSuccessModal(true);
    } catch (error) {
      setErrorMessage(
        'Booking failed: ' +
        (error.response?.data?.message ||
          'Double booking error or network issue.')
      );
    }
  };

  const visibleSlots = getVisibleSlots(); return (
    <div className="doctor-channeling-content">
      <div className="channeling-header">
        <h1>Doctor Channeling</h1>
        <p>Book an appointment with our veterinarians</p>
      </div>

      <div className="view-slots-card">
        <FormField label="Pet">
          <select
            value={selectedPet}
            onChange={(e) => setSelectedPet(e.target.value)}
          >
            <option value="">Select a pet</option>
            {pets.map((pet) => (
              <option key={pet.petId} value={pet.petId}>
                {pet.name} ({pet.species})
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Appointment type">
          <select
            value={appointmentType}
            onChange={(e) => handleAppointmentTypeChange(e.target.value)}
          >
            <option value="">Select appointment type</option>
            <option value="Vaccination">Vaccination</option>
            <option value="Checkup">Checkup</option>
            <option value="Operation">Operation</option>
          </select>
        </FormField>

        <FormField label="Date">
          <input
            type="date"
            value={selectedDate}
            min={today}
            onChange={(e) => {
              const value = e.target.value;

              if (value < today) {
                setErrorMessage('You cannot select a past date.');
                return;
              }

              setSelectedDate(value);
              setSelectedSlot(null);
              setSelectedDoctor('');
            }}
          />
        </FormField>

        <FormField label="Doctor">
          <select
            value={selectedDoctorFilter}
            onChange={(e) => handleDoctorChange(e.target.value)}
            disabled={loadingVets}
          >
            <option value="">{loadingVets ? 'Loading vets...' : 'Select a doctor'}</option>
            {vets.map((vet) => (
              <option key={vet.userId} value={`${vet.firstName} ${vet.lastName}`}>
                Dr. {vet.firstName} {vet.lastName}
              </option>
            ))}
          </select>
        </FormField>

        <div className="slot-section">
          <h3 className="slot-section__title">Available Time Slots</h3>
          <p className="slot-section__hint">
            Select a date and doctor to view availability.
          </p>

          {/* Slot loading / empty / error states */}
          {loadingSlots && (
            <p style={{ color: '#64748b', fontSize: '0.88rem' }}>Loading slots…</p>
          )}
          {!loadingSlots && slotsError && (
            <p style={{ color: '#dc2626', fontSize: '0.88rem' }}>{slotsError}</p>
          )}
          {!loadingSlots && !slotsError && selectedDoctorFilter && !loadingVets && visibleSlots.length === 0 && (
            <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
              This doctor has no available time slots configured yet.
            </p>
          )}

          <div className="slot-grid">
            {visibleSlots.map((slot, index) => {
              const booked = isSlotBooked(slot.time, slot.vetId);
              const pastTime = isPastTimeSlotToday(slot.time);
              const selected =
                selectedSlot?.time === slot.time && selectedDoctor === slot.doctor;

              return (
                <TimeSlotButton
                  key={index}
                  slot={slot}
                  booked={booked}
                  selected={selected}
                  disabled={booked || pastTime || !selectedDate || !selectedDoctorFilter}
                  onClick={() => {
                    if (!booked && !pastTime && selectedDate && selectedDoctorFilter) {
                      handleSlotSelect(slot);
                    }
                  }}
                />
              );
            })}
          </div>
        </div>

        <FormField label="Notes" className="notes-row">
          <textarea
            rows="3"
            placeholder="Enter additional notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </FormField>

        <div className="bottom-actions">
          <div className="price-field">
            <label>Price summary</label>
            <input
              type="text"
              value={priceSummary ? `LKR ${priceSummary.toLocaleString()}` : ''}
              readOnly
              className="price-input"
            />
          </div>

          <button
            className="btn btn-teal"
            type="button"
            onClick={handleSubmit}
            style={{ padding: '12px 40px' }}
          >
            Confirm Appointment
          </button>
        </div>

        {errorMessage && (
          <div className="error-box" style={{ marginTop: '12px' }}>
            {errorMessage}
          </div>
        )}

        {showSuccessModal && (
          <SuccessModal onClose={() => setShowSuccessModal(false)} />
        )}
      </div>
    </div>
  );
};

export default DoctorChanneling;