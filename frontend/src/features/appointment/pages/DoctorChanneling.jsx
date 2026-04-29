import React, { useState, useEffect } from 'react';
import '../../../styles/DoctorChanneling.css';
import axios from 'axios';
import { getPetsByOwner } from '../../../services/petService';
import { getAllVets } from '../../../services/vetService';
import { getSlotsByVet } from '../../../services/timeSlotService';
import { useAuth } from '../../auth/contexts/AuthContext';
import { createCheckoutSession } from '../../../services/paymentService';
import { getAppointmentTypes, getDefaultTimeSlots } from '../../../services/appointmentManagementService';

/* -----------------------------
   Helpers
----------------------------- */
const getCategory = (label = '') => {
  if (label.toLowerCase().includes('operation')) return 'operation';
  if (label.toLowerCase().includes('vaccination')) return 'vaccination';
  return 'other';
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
    className={`slot-btn slot-btn--${slot.category || 'other'}${selected ? ' slot-btn--selected' : ''}${booked ? ' slot-btn--booked' : ''}${disabled ? ' slot-btn--disabled' : ''}`}
  >
    <div className="slot-btn__time">{slot.time}</div>
    <div className="slot-btn__label">{slot.label}</div>
    {booked && <div className="slot-btn__booked-label">Booked</div>}
  </button>
);

const RedirectingModal = () => (
  <div className="success-modal-overlay">
    <div className="success-modal">
      <div className="success-modal__icon" style={{ fontSize: '2rem' }}>💳</div>
      <h3 className="success-modal__title">Redirecting to Payment...</h3>
      <p className="success-modal__message">
        Your appointment has been created. Please complete the payment to confirm your booking.
      </p>
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
  const [showRedirectingModal, setShowRedirectingModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [paymentFailedPopup, setPaymentFailedPopup] = useState(false);
  const [loadingVets, setLoadingVets] = useState(true);
  // Doctor-specific slots fetched from the backend
  const [doctorSlots, setDoctorSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState('');
  // Dynamic Data
  const [appointmentTypes, setAppointmentTypes] = useState([]);
  const [defaultSlots, setDefaultSlots] = useState([]);

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

    // Removed draft restoration logic as per requirement to not retain details on failure
    if (sessionStorage.getItem('showPaymentFailedPopup') === 'true') {
      setPaymentFailedPopup(true);
      sessionStorage.removeItem('showPaymentFailedPopup');
    }

  }, [userId]);

  useEffect(() => {
    setLoadingVets(true);
    getAllVets()
      .then((res) => {
        const vetData = Array.isArray(res) ? res : (res.data || []);
        setVets(vetData);

        // Removed draft restoration logic for vetId
      })
      .catch((err) => console.error('Failed to load vets:', err))
      .finally(() => setLoadingVets(false));

    // Fetch dynamic appointment types and default slots
    getAppointmentTypes()
      .then((data) => setAppointmentTypes(data))
      .catch((err) => console.error('Failed to load appointment types', err));

    getDefaultTimeSlots()
      .then((data) => setDefaultSlots(data))
      .catch((err) => console.error('Failed to load default slots', err));
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
    const selectedType = appointmentTypes.find(t => t.name === value);
    if (selectedType) {
      setPriceSummary(selectedType.price || 0);
      if (!selectedType.requiresVet) {
        setSelectedDoctorFilter('');
        setSelectedVetId(null);
        setSelectedDoctor('');
      }
    } else {
      setPriceSummary(0);
    }
    // Clear any selected slot so a stale cross-category selection can't persist
    setSelectedSlot(null);
    setSelectedDoctor('');
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
    const selectedType = appointmentTypes.find(t => t.name === appointmentType);
    const requiresVet = selectedType ? selectedType.requiresVet : true;

    if (requiresVet && !selectedDoctorFilter) return [];

    // If requires vet, use doctor slots (fallback to default if none configured).
    // If doesn't require vet, always use default slots (clinic-wide schedule).
    const source = (requiresVet && doctorSlots.length > 0) ? doctorSlots : defaultSlots.map((d) => ({
      timeSlot: d.timeSlot,
      label: d.label,
    }));

    // Filter source by the selected appointment type (if the slot has a specific label/category)
    // To be robust, if it's a general slot, we show it. 
    // This allows grooming to show up.
    return source.map((s) => ({
      time: s.timeSlot,
      doctor: selectedDoctorFilter || 'Clinic Service',
      vetId: selectedVetId,
      label: s.label || '',
      category: getCategory(s.label),
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
    const selectedType = appointmentTypes.find(t => t.name === appointmentType);
    const requiresVet = selectedType ? selectedType.requiresVet : true;

    if (
      !selectedPet ||
      !appointmentType ||
      !selectedDate ||
      !selectedSlot ||
      (requiresVet && !selectedDoctorFilter)
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

    let createdId = null;

    try {
      setSubmitting(true);
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

      const apptRes = await axios.post('/api/appointments', appointmentData);
      createdId = apptRes.data?.id;

      if (!createdId) {
        throw new Error('Could not retrieve appointment ID after booking.');
      }

      // Show redirecting overlay briefly before navigating to Stripe
      setShowRedirectingModal(true);

      // Removed draft storage logic to prevent retention of details on failure


      const checkoutUrl = await createCheckoutSession(createdId, 'APPOINTMENT');
      window.location.href = checkoutUrl;

    } catch (error) {
      setSubmitting(false);
      setShowRedirectingModal(false);

      // If appointment was created but checkout session failed, delete it
      if (createdId) {
        try {
          await axios.delete(`/api/appointments/${createdId}`);
        } catch (e) {
          console.error("Failed to delete orphaned appointment", e);
        }
      }

      setErrorMessage(
        'Booking failed: ' +
        (error.response?.data?.message ||
          error.message ||
          'Double booking error or network issue.')
      );
    }


  };

  const visibleSlots = getVisibleSlots();

  const selectedType = appointmentTypes.find(t => t.name === appointmentType);
  const requiresVet = selectedType ? selectedType.requiresVet : true;

  const isFullyBooked = visibleSlots.length > 0 && visibleSlots.every(slot =>
    isSlotBooked(slot.time, slot.vetId) || isPastTimeSlotToday(slot.time)
  );

  return (
    <div className="doctor-channeling-content">
      <div className="dashboard-header-banner">
        <h2>Doctor Channeling</h2>
        <p>Book an appointment with our veterinarians</p>
      </div>

      {paymentFailedPopup && (
        <div className="payment-failed-popup" style={{
          background: '#fee2e2', border: '1px solid #ef4444', padding: '16px', borderRadius: '8px',
          marginBottom: '24px', color: '#b91c1c', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <div>
            <strong>Payment unsuccessful.</strong> Your appointment was not confirmed.
            Please try booking again.
          </div>
          <button onClick={() => setPaymentFailedPopup(false)} style={{
            background: 'none', border: 'none', color: '#b91c1c', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold'
          }}>&times;</button>
        </div>
      )}

      <div className="view-slots-card">
        <div className="dc-split-layout">
          {/* Left Column: Form Inputs & Actions */}
          <div className="dc-left-panel">
            <FormField label="Pet">
              <select
                value={selectedPet}
                onChange={(e) => setSelectedPet(e.target.value)}
                autoComplete="off"
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
                autoComplete="off"
              >
                <option value="">Select appointment type</option>
                {appointmentTypes.map(type => (
                  <option key={type.id} value={type.name}>
                    {type.icon} {type.name}
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Date">
              <input
                type="date"
                value={selectedDate}
                min={today}
                autoComplete="off"
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

            {requiresVet && (
              <FormField label="Doctor">
                <select
                  value={selectedDoctorFilter}
                  onChange={(e) => handleDoctorChange(e.target.value)}
                  disabled={loadingVets}
                  autoComplete="off"
                >
                  <option value="">{loadingVets ? 'Loading vets...' : 'Select a doctor'}</option>
                  {vets.map((vet) => (
                    <option key={vet.userId} value={`${vet.firstName} ${vet.lastName}`}>
                      Dr. {vet.firstName} {vet.lastName}
                    </option>
                  ))}
                </select>
              </FormField>
            )}

            <FormField label="Notes" className="notes-row">
              <textarea
                rows="3"
                placeholder="Enter additional notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                autoComplete="off"
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
                disabled={submitting}
              >
                {submitting ? 'Processing...' : 'Confirm & Pay'}
              </button>
            </div>

            {errorMessage && (
              <div className="error-box" style={{ marginTop: '12px' }}>
                {errorMessage}
              </div>
            )}
          </div>

          {/* Right Column: Time Slots */}
          <div className="dc-right-panel">
            <div className="slot-section">
              <h3 className="slot-section__title">Available Time Slots</h3>
              <p className="slot-section__hint">
                {requiresVet && !selectedDoctorFilter
                  ? 'Select a doctor to view available slots.'
                  : !appointmentType
                    ? 'Select an appointment type to see matching slots.'
                    : !selectedDate
                      ? `Slots for ${requiresVet ? 'Dr. ' + selectedDoctorFilter.replace(/^Dr\.\s*/i, '') : appointmentType} — please also pick a date before confirming.`
                      : `Select a time slot for ${requiresVet ? 'Dr. ' + selectedDoctorFilter.replace(/^Dr\.\s*/i, '') : appointmentType}`}
              </p>

              {/* Loading state */}
              {loadingSlots && (
                <p className="dc-slots-loading">Loading slots…</p>
              )}

              {/* Error state */}
              {!loadingSlots && slotsError && (
                <p className="dc-slots-error">{slotsError}</p>
              )}

              {/* Fully Booked State */}
              {!loadingSlots && !slotsError && (selectedDoctorFilter || !requiresVet) && selectedDate && isFullyBooked && (
                <div className="fully-booked-message" style={{ padding: '20px', textAlign: 'center', color: '#dc2626', background: 'rgba(220, 38, 38, 0.05)', borderRadius: '12px', marginTop: '16px', fontWeight: 'bold' }}>
                  All appointment slots for this date are fully booked or have already passed. Please select another date.
                </div>
              )}

              {/* Slot groups */}
              {!loadingSlots && !slotsError && (selectedDoctorFilter || !requiresVet) && !isFullyBooked && (() => {
                const opSlots = visibleSlots.filter((s) => s.category === 'operation');
                const vaccSlots = visibleSlots.filter((s) => s.category === 'vaccination');
                const otherSlots = visibleSlots.filter((s) => s.category === 'other');

                // Determine which sections to show based on appointment type
                const showOp = !appointmentType || appointmentType === 'Operation';
                const showVacc = !appointmentType || appointmentType === 'Vaccination';
                const showOther = !appointmentType || (!showOp && !showVacc);

                const renderSlotButton = (slot, index) => {
                  const booked = isSlotBooked(slot.time, slot.vetId);
                  const pastTime = isPastTimeSlotToday(slot.time);
                  const selected = selectedSlot?.time === slot.time && (slot.doctor === selectedDoctor || slot.doctor === 'Clinic Service');
                  return (
                    <TimeSlotButton
                      key={index}
                      slot={slot}
                      booked={booked}
                      selected={selected}
                      disabled={booked || pastTime || (requiresVet && !selectedDoctorFilter)}
                      onClick={() => {
                        if (!booked && !pastTime && (!requiresVet || selectedDoctorFilter)) {
                          handleSlotSelect(slot);
                        }
                      }}
                    />
                  );
                };

                return (
                  <>
                    {/* ── Operations ── */}
                    {showOp && (
                      <div className="dc-slot-group dc-slot-group--operation">
                        <div className="dc-slot-group-header">
                          <span className="dc-slot-group-icon">🔪</span>
                          <div>
                            <div className="dc-slot-group-title">Operations</div>
                            <div className="dc-slot-group-sub">9:00 AM – 12:00 PM &nbsp;·&nbsp; 1 hour per slot</div>
                          </div>
                          <span className="dc-slot-group-badge dc-slot-group-badge--operation">
                            {opSlots.length} slots
                          </span>
                        </div>
                        <div className="slot-grid">
                          {opSlots.map(renderSlotButton)}
                        </div>
                      </div>
                    )}

                    {/* ── Vaccinations ── */}
                    {showVacc && vaccSlots.length > 0 && (
                      <div className="dc-slot-group dc-slot-group--vaccination">
                        <div className="dc-slot-group-header">
                          <span className="dc-slot-group-icon">💉</span>
                          <div>
                            <div className="dc-slot-group-title">Vaccinations</div>
                            <div className="dc-slot-group-sub">15 minutes per slot</div>
                          </div>
                          <span className="dc-slot-group-badge dc-slot-group-badge--vaccination">
                            {vaccSlots.length} slots
                          </span>
                        </div>
                        <div className="slot-grid">
                          {vaccSlots.map(renderSlotButton)}
                        </div>
                      </div>
                    )}

                    {/* ── Other General Services (e.g. Grooming) ── */}
                    {showOther && otherSlots.length > 0 && (
                      <div className="dc-slot-group dc-slot-group--other" style={{ marginTop: '24px' }}>
                        <div className="dc-slot-group-header">
                          <span className="dc-slot-group-icon">{selectedType?.icon || '🌟'}</span>
                          <div>
                            <div className="dc-slot-group-title">{appointmentType || 'General Services'}</div>
                            <div className="dc-slot-group-sub">Standard clinic slots</div>
                          </div>
                          <span className="dc-slot-group-badge" style={{ background: '#e0f2fe', color: '#0369a1' }}>
                            {otherSlots.length} slots
                          </span>
                        </div>
                        <div className="slot-grid">
                          {otherSlots.map(renderSlotButton)}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>

        {showRedirectingModal && <RedirectingModal />}
      </div>
    </div>
  );
};

export default DoctorChanneling;