 import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import '../styles/ViewTimeSlots.css';

const ViewTimeSlots = () => {
  const [petType, setPetType] = useState('');
  const [appointmentType, setAppointmentType] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [priceSummary, setPriceSummary] = useState('');

  const slots = [
    { time: '09:00 AM', doctor: 'Dr. Silva' },
    { time: '11:00 AM', doctor: 'Dr. Perera' },
    { time: '02:00 PM', doctor: 'Dr. Fernando' },
  ];

  const handleAppointmentTypeChange = (value) => {
    setAppointmentType(value);

    const priceMap = {
      Vaccination: 'LKR 2,500',
      Checkup: 'LKR 2,000',
      Operation: 'LKR 12,000',
      Grooming: 'LKR 3,000',
    };

    setPriceSummary(priceMap[value] || '');
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
            <button className="my-appointments-btn">My Appointments</button>
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
                <div key={index} className="slot-card">
                  <div className="slot-time">{slot.time}</div>
                  <div className="slot-doctor">{slot.doctor}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="form-row">
            <label>Doctor</label>
            <select>
              <option>Select a doctor</option>
              <option>Dr. Silva</option>
              <option>Dr. Perera</option>
              <option>Dr. Fernando</option>
            </select>
          </div>

          <div className="form-row notes-row">
            <label>Notes</label>
            <textarea placeholder="Enter additional notes" />
          </div>

          <div className="bottom-actions">
            <div className="price-field">
              <label>Price summary</label>
              <input type="text" value={priceSummary} readOnly />
            </div>

            <button className="confirm-btn">Confirm Appointment</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ViewTimeSlots;