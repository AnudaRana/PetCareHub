import React, { useState, useEffect } from 'react';
import OwnerSidebar from '../components/owner/OwnerSidebar';
import '../styles/DoctorChanneling.css';
import axios from 'axios';
import { getPetsByOwner } from '../services/petService';
import useCurrentUser from '../hooks/useCurrentUser';

/* -----------------------------
   Constants
----------------------------- */
const SLOT_OPTIONS = [
  { time: '09:00 AM', doctor: 'Dr. Silva', vetId: 6 },
  { time: '11:00 AM', doctor: 'Dr. Nimal Perera', vetId: 5 },
  { time: '02:00 PM', doctor: 'Dr. Fernando', vetId: 7 },
];

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
      <button className="success-modal__btn" onClick={onClose}>
        Done
      </button>
    </div>
  </div>
);

/* -----------------------------
   Main Component
----------------------------- */
const DoctorChanneling = () => {
  const { userId } = useCurrentUser();

  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState('');
  const [appointmentType, setAppointmentType] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedDoctorFilter, setSelectedDoctorFilter] = useState('');
  const [priceSummary, setPriceSummary] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [notes, setNotes] = useState('');
  const [bookedSlots, setBookedSlots] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const doctors = [...new Set(SLOT_OPTIONS.map((slot) => slot.doctor))];

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
      .then((res) => setPets(res.data))
      .catch((err) => console.error('Failed to load pets:', err));
  }, [userId]);

  useEffect(() => {
    if (!selectedDate) {
      setBookedSlots([]);
      return;
    }

    axios
      .get(`http://localhost:8081/api/appointments/booked-slots?date=${selectedDate}`)
      .then((res) => setBookedSlots(res.data || []))
      .catch((err) => console.error('Failed to load booked slots:', err));
  }, [selectedDate]);

  const handleAppointmentTypeChange = (value) => {
    setAppointmentType(value);
    setPriceSummary(APPOINTMENT_PRICES[value] || 0);
  };

  const handleDoctorChange = (value) => {
    setSelectedDoctorFilter(value);
    setSelectedDoctor('');
    setSelectedSlot(null);
  };

  const isSlotBooked = (time, doctor) => {
    return bookedSlots.some(
      (slot) => slot.timeSlot === time && slot.doctor === doctor
    );
  };

  const getVisibleSlots = () => {
    if (!selectedDoctorFilter) return SLOT_OPTIONS;
    return SLOT_OPTIONS.filter((slot) => slot.doctor === selectedDoctorFilter);
  };

  const handleSlotSelect = (slot) => {
    setSelectedSlot(slot);
    setSelectedDoctor(slot.doctor);
  };

  const resetForm = () => {
    setSelectedSlot(null);
    setSelectedDoctor('');
    setSelectedDoctorFilter('');
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
        vetId: selectedSlot.vetId,
        petId: Number(selectedPet),
        appointmentType,
        date: selectedDate,
        timeSlot: selectedSlot.time,
        doctor: selectedSlot.doctor,
        notes,
        price: Number(priceSummary),
      };

      await axios.post('http://localhost:8081/api/appointments', appointmentData);

      const res = await axios.get(
        `http://localhost:8081/api/appointments/booked-slots?date=${selectedDate}`
      );
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

  const visibleSlots = getVisibleSlots();

  return (
    <div className="doctor-channeling-page">
      <OwnerSidebar
        activeTab="doctor-channeling"
        user={{
          fullName: localStorage.getItem('fullName') || 'User',
          email: localStorage.getItem('email') || 'user@petcarehub.com',
          initials:
            (localStorage.getItem('fullName') || 'User')
              .split(' ')
              .map((name) => name[0])
              .join('')
              .toUpperCase()
              .slice(0, 2),
        }}
      />

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
            >
              <option value="">Select a doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor} value={doctor}>
                  {doctor}
                </option>
              ))}
            </select>
          </FormField>

          <div className="slot-section">
            <h3 className="slot-section__title">Available Time Slots</h3>
            <p className="slot-section__hint">
              Select a date and doctor to view availability.
            </p>

            <div className="slot-grid">
              {visibleSlots.map((slot, index) => {
                const booked = isSlotBooked(slot.time, slot.doctor);
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
              className="confirm-btn"
              type="button"
              onClick={handleSubmit}
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
    </div>
  );
};

export default DoctorChanneling;