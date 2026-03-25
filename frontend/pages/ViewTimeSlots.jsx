import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import '../styles/ViewTimeSlots.css';
import axios from 'axios';

const ViewTimeSlots = () => {
  const [petType, setPetType] = useState('');
  const [appointmentType, setAppointmentType] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [priceSummary, setPriceSummary] = useState(0);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [notes, setNotes] = useState('');

  const slots = [
    { time: '09:00 AM', doctor: 'Dr. Silva' },
    { time: '11:00 AM', doctor: 'Dr. Perera' },
    { time: '02:00 PM', doctor: 'Dr. Fernando' },
  ];

  const handleAppointmentTypeChange = (value) => {
    setAppointmentType(value);

    const priceMap = {
      Vaccination: 2500,
      Checkup: 2000,
      Operation: 12000,
      Grooming: 3000,
    };

    setPriceSummary(priceMap[value] || 0);
  };

  const handleSubmit = async () => {
    try {
      const appointmentData = {
        petType,
        appointmentType,
        date: selectedDate,
        timeSlot: selectedSlot,
        doctor: selectedDoctor,
        notes,
        price: Number(priceSummary),
        userEmail: 'vindyawijerathna1@gmail.com',
      };

      console.log('Sending:', appointmentData);

      await axios.post(
        'http://localhost:8083/api/appointments',
        appointmentData
      );

      alert('Appointment booked successfully!');
    } catch (error) {
      console.error('Booking error details:', error.response?.data || error.message);
      alert(
        'Booking failed: ' +
          (error.response?.data?.message || error.message || 'Unknown error')
      );
    }
  };

  return (
    <div className="view-slots-layout">
      <aside className="view-slots-sidebar">
        <Sidebar />
      </aside>

      <main className="view-slots-main">
        <div className="view-slots-card">
          <div className="view-slots-card-header">
            <h2 className="section-title">Doctor Channeling</h2>
            <button className="my-appointments-btn" type="button">
              My Appointments
            </button>
          </div>

          <div className="form-row">
            <label>Pet type</label>
            <select value={petType} onChange={(e) => setPetType(e.target.value)}>
              <option value="">Select pet type</option>
              <option value="Dog">Dog</option>
              <option value="Cat">Cat</option>
              <option value="Rabbit">Rabbit</option>
              <option value="Bird">Bird</option>
            </select>
          </div>

          <div className="form-row">
            <label>Appointment type</label>
            <select
              value={appointmentType}
              onChange={(e) => handleAppointmentTypeChange(e.target.value)}
            >
              <option value="">Select appointment type</option>
              <option value="Vaccination">Vaccination</option>
              <option value="Checkup">Checkup</option>
              <option value="Operation">Operation</option>
              <option value="Grooming">Grooming</option>
            </select>
          </div>

          <div className="form-row">
            <label>Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>

          <div className="slot-section">
            <h3>Available Time Slots</h3>
            <div className="slot-grid">
              {slots.map((slot, index) => (
                <button
                  type="button"
                  key={index}
                  className="slot-card"
                  onClick={() => {
                    setSelectedSlot(slot.time);
                    setSelectedDoctor(slot.doctor);
                  }}
                >
                  <div className="slot-time">{slot.time}</div>
                  <div className="slot-doctor">{slot.doctor}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="form-row">
            <label>Doctor</label>
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
            >
              <option value="">Select a doctor</option>
              <option value="Dr. Silva">Dr. Silva</option>
              <option value="Dr. Perera">Dr. Perera</option>
              <option value="Dr. Fernando">Dr. Fernando</option>
            </select>
          </div>

          <div className="form-row notes-row">
            <label>Notes</label>
            <textarea
              placeholder="Enter additional notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="bottom-actions">
            <div className="price-field">
              <label>Price summary</label>
              <input
                type="text"
                value={priceSummary ? `LKR ${priceSummary.toLocaleString()}` : ''}
                readOnly
              />
            </div>

            <button className="confirm-btn" type="button" onClick={handleSubmit}>
              Confirm Appointment
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ViewTimeSlots;