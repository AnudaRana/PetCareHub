import React, { useState, useEffect } from 'react';
import '../styles/ViewTimeSlots.css';
import axios from 'axios';
import { getPetsByOwner } from '../../../services/petService';
import { useAuth } from '../../auth/contexts/AuthContext';

const ViewTimeSlots = () => {
  const { userId } = useAuth();
  const [pets, setPets] = useState([]);
  const [selectedPet, setSelectedPet] = useState('');
  const [appointmentType, setAppointmentType] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [priceSummary, setPriceSummary] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [notes, setNotes] = useState('');
  const [bookedSlots, setBookedSlots] = useState([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const slots = [
    { time: '09:00 AM', doctor: 'Dr. Silva' },
    { time: '11:00 AM', doctor: 'Dr. Perera' },
    { time: '02:00 PM', doctor: 'Dr. Fernando' },
  ];

  useEffect(() => {
    if (userId) {
      getPetsByOwner(userId)
        .then((res) => setPets(Array.isArray(res) ? res : res.data || []))
        .catch((err) => console.error('Failed to load pets:', err));
    }
  }, [userId]);

  useEffect(() => {
    if (selectedDate) {
      axios.get(`/api/appointments/booked-slots?date=${selectedDate}`)
        .then(res => setBookedSlots(res.data || []))
        .catch(err => console.error('Failed to load booked slots:', err));
    } else {
      setBookedSlots([]);
    }
  }, [selectedDate]);

  const handleAppointmentTypeChange = (value) => {
    setAppointmentType(value);
    const priceMap = {
      Checkup: 2000,
      Operation: 12000,
      Grooming: 3000,
    };
    setPriceSummary(priceMap[value] || 0);
  };

  const isSlotBooked = (time, doctor) => {
    return bookedSlots.some(slot => slot.timeSlot === time && slot.doctor === doctor);
  };

  const handleSubmit = async () => {
    if (!selectedPet || !appointmentType || !selectedDate || !selectedSlot || !selectedDoctor) {
      alert('Please fill all required fields');
      return;
    }

    try {
      const appointmentData = {
        userId,
        petId: Number(selectedPet),
        appointmentType,
        date: selectedDate,
        timeSlot: selectedSlot,
        doctor: selectedDoctor,
        notes,
        price: Number(priceSummary)
      };

      await axios.post('/api/appointments', appointmentData);

      const res = await axios.get(`/api/appointments/booked-slots?date=${selectedDate}`);
      setBookedSlots(res.data || []);

      setSelectedSlot('');
      setSelectedDoctor('');
      setNotes('');
      setAppointmentType('');
      setShowSuccessModal(true);
    } catch (error) {
      alert('Booking failed: ' + (error.response?.data?.message || 'Double booking error or network issue.'));
    }
  };

  return (
    <div className="view-slots-card" style={{ maxWidth: '800px', margin: '0 auto', background: '#fff', padding: '24px', borderRadius: '14px', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
      <div className="view-slots-card-header" style={{ marginBottom: '20px' }}>
        <h2 className="section-title" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--color-primary)' }}>Doctor Channeling</h2>
      </div>

      <div className="form-row" style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Pet</label>
        <select value={selectedPet} onChange={(e) => setSelectedPet(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}>
          <option value="">Select a pet</option>
          {pets.map(pet => (
            <option key={pet.petId} value={pet.petId}>{pet.name} ({pet.species})</option>
          ))}
        </select>
      </div>

      <div className="form-row" style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Appointment type</label>
        <select value={appointmentType} onChange={(e) => handleAppointmentTypeChange(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }}>
          <option value="">Select appointment type</option>
          <option value="Checkup">Checkup</option>
          <option value="Operation">Operation</option>
          <option value="Grooming">Grooming</option>
        </select>
      </div>

      <div className="form-row" style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Date</label>
        <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc' }} />
      </div>

      <div className="slot-section" style={{ marginBottom: '24px', marginTop: '24px' }}>
        <h3 style={{ fontSize: '16px', color: 'var(--color-primary)', marginBottom: '8px' }}>Available Time Slots</h3>
        <p style={{ fontSize: '13px', color: '#666', marginBottom: '16px' }}>Select a date to view availability.</p>
        <div className="slot-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
          {slots.map((slot, index) => {
            const booked = isSlotBooked(slot.time, slot.doctor);
            const selected = selectedSlot === slot.time && selectedDoctor === slot.doctor;

            return (
              <button
                type="button"
                key={index}
                onClick={() => {
                  if (!booked) {
                    setSelectedSlot(slot.time);
                    setSelectedDoctor(slot.doctor);
                  }
                }}
                disabled={booked || !selectedDate}
                className={`btn ${selected ? 'btn-teal' : 'btn-white'}`}
                style={{
                  padding: '16px',
                  opacity: booked ? 0.5 : 1,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div style={{ fontWeight: 'bold', fontSize: '15px' }}>{slot.time}</div>
                <div style={{ fontSize: '12px' }}>{slot.doctor}</div>
                {booked && <div style={{ color: '#d32f2f', fontSize: '12px', fontWeight: 'bold', marginTop: '4px' }}>Booked</div>}
              </button>
            );
          })}
        </div>
      </div>

      <div className="form-row notes-row" style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Notes</label>
        <textarea rows="3" placeholder="Enter additional notes" value={notes} onChange={(e) => setNotes(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ccc', resize: 'vertical' }} />
      </div>

      <div className="bottom-actions" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '16px', borderTop: '1px solid #eee' }}>
        <div className="price-field" style={{ width: '45%' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Price summary</label>
          <input type="text" value={priceSummary ? `LKR ${priceSummary.toLocaleString()}` : ''} readOnly style={{ width: '100%', padding: '10px', borderRadius: '8px', border: 'none', background: '#f5f5f5', fontWeight: 'bold', color: 'var(--color-primary)' }} />
        </div>

        <button className="btn btn-teal" type="button" onClick={handleSubmit} style={{ width: '45%' }}>
          Confirm Appointment
        </button>
      </div>

      {showSuccessModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          animation: 'fadeIn 0.2s ease-in-out'
        }}>
          <div style={{
            background: '#fff', padding: '32px', borderRadius: '16px', maxWidth: '400px', width: '90%',
            textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
          }}>
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(46, 204, 113, 0.15)', color: '#2ecc71', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', margin: '0 auto 20px' }}>
              ✓
            </div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', color: 'var(--color-primary)', marginBottom: '12px' }}>
              Appointment Confirmed!
            </h3>
            <p style={{ color: 'var(--color-text-light)', lineHeight: '1.6', marginBottom: '24px' }}>
              An email confirmation has been sent to your registered email address. Thank you for using our services!
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="btn btn-teal"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewTimeSlots;