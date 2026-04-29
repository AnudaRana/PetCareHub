import React, { useState, useEffect } from 'react';
import {
  getAppointmentTypes,
  addAppointmentType,
  updateAppointmentType,
  deleteAppointmentType,
  getDefaultTimeSlots,
  addDefaultTimeSlot,
  updateDefaultTimeSlot,
  deleteDefaultTimeSlot
} from '../../../services/appointmentManagementService';
import '../styles/ManageAppointments.css';

const ManageAppointments = () => {

  // States for Appointment Types
  const [types, setTypes] = useState([]);
  const [editingType, setEditingType] = useState(null);
  const [typeForm, setTypeForm] = useState({ name: '', price: '', requiresVet: true, icon: '🌟' });

  // States for Default Time Slots
  const [slots, setSlots] = useState([]);
  const [editingSlot, setEditingSlot] = useState(null);
  const [slotForm, setSlotForm] = useState({ timeSlot: '', label: '' });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(''), 3000);
  };

  const showError = (msg) => {
    setError(msg);
    setTimeout(() => setError(''), 4000);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const typesData = await getAppointmentTypes();
      setTypes(typesData);

      const slotsData = await getDefaultTimeSlots();
      // Sort slots by time (simple sort assuming standard formats)
      setSlots(slotsData.sort((a, b) => {
        // A very basic sort that puts AM before PM, then sorts alphabetically
        return a.timeSlot.localeCompare(b.timeSlot);
      }));
    } catch (err) {
      showError('Failed to fetch data.');
    } finally {
      setLoading(false);
    }
  };

  // --- Appointment Type Handlers ---

  const handleSaveType = async () => {
    if (!typeForm.price) {
      showError('Please enter a price.');
      return;
    }
    try {
      if (editingType) {
        await updateAppointmentType(editingType.id, typeForm);
        showSuccess('Appointment price updated.');
        resetTypeForm();
        fetchData();
      }
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to update appointment type.');
    }
  };

  const resetTypeForm = () => {
    setEditingType(null);
    setTypeForm({ name: '', price: '', requiresVet: true, icon: '🌟' });
  };

  // --- Default Time Slot Handlers ---

  const handleSaveSlot = async () => {
    if (!slotForm.timeSlot || !slotForm.label) {
      showError('Please fill in both Time and Label.');
      return;
    }
    // Very basic format check for timeSlot
    if (!slotForm.timeSlot.match(/^\d{2}:\d{2} [AP]M$/)) {
      showError('Time must be in format HH:MM AM/PM (e.g. 09:00 AM)');
      return;
    }
    try {
      if (editingSlot) {
        await updateDefaultTimeSlot(editingSlot.id, slotForm);
        showSuccess('Default time slot updated.');
      } else {
        await addDefaultTimeSlot(slotForm);
        showSuccess('Default time slot added.');
      }
      resetSlotForm();
      fetchData();
    } catch (err) {
      showError(err.response?.data?.message || 'Failed to save time slot.');
    }
  };

  const handleDeleteSlot = async (id) => {
    if (!window.confirm('Are you sure you want to delete this time slot?')) return;
    try {
      await deleteDefaultTimeSlot(id);
      showSuccess('Default time slot deleted.');
      fetchData();
    } catch (err) {
      showError('Failed to delete time slot.');
    }
  };

  const resetSlotForm = () => {
    setEditingSlot(null);
    setSlotForm({ timeSlot: '', label: '' });
  };

  return (
    <div className="ma-container">
      <div className="ma-header">
        <h2>Manage Clinic Appointments</h2>
        <p>Configure appointment services, pricing, and clinic time slots.</p>
      </div>

      {error && <div className="ma-error">{error}</div>}
      {success && <div className="ma-success">{success}</div>}

      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          {/* --- Services & Pricing Section --- */}
          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ marginBottom: '16px', color: '#1e293b' }}>Services & Pricing</h3>

            {editingType && (
              <div className="ma-form-card">
                <h3>Edit Price for {typeForm.icon} {typeForm.name}</h3>
                <div className="ma-form-row">
                  <div className="ma-form-group">
                    <label>Price (LKR)</label>
                    <input
                      type="number"
                      placeholder="e.g. 2500"
                      value={typeForm.price}
                      onChange={(e) => setTypeForm({ ...typeForm, price: e.target.value })}
                    />
                  </div>
                </div>
                <div className="ma-actions">
                  <button className="ma-btn ma-btn-primary" onClick={handleSaveType}>
                    Update Price
                  </button>
                  <button className="ma-btn ma-btn-secondary" onClick={resetTypeForm}>Cancel</button>
                </div>
              </div>
            )}

            <div className="ma-table-container">
              <table className="ma-table">
                <thead>
                  <tr>
                    <th>Service Name</th>
                    <th>Price (LKR)</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {types.map(type => (
                    <tr key={type.id}>
                      <td>{type.name}</td>
                      <td>{type.price.toLocaleString()}</td>
                      <td>
                        <button className="ma-btn ma-btn-primary" onClick={() => { setEditingType(type); setTypeForm(type); }}>Edit</button>
                      </td>
                    </tr>
                  ))}
                  {types.length === 0 && (
                    <tr><td colSpan="3" style={{ textAlign: 'center' }}>No services configured.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* --- Master Time Slots Section --- */}
          <div>
            <h3 style={{ marginBottom: '16px', color: '#1e293b' }}>Time Slots</h3>

            <div className="ma-form-card">
              <h3>{editingSlot ? 'Edit Time Slot' : 'Add New Time Slot'}</h3>
              <div className="ma-form-row">
                <div className="ma-form-group">
                  <label>Time (HH:MM AM/PM)</label>
                  <input
                    type="text"
                    placeholder="e.g. 02:00 PM"
                    value={slotForm.timeSlot}
                    onChange={(e) => setSlotForm({ ...slotForm, timeSlot: e.target.value })}
                  />
                </div>
                <div className="ma-form-group">
                  <label>Label</label>
                  <input
                    type="text"
                    placeholder="e.g. Vaccination Slot 5"
                    value={slotForm.label}
                    onChange={(e) => setSlotForm({ ...slotForm, label: e.target.value })}
                  />
                </div>
              </div>
              <div className="ma-actions">
                <button className="ma-btn ma-btn-primary" onClick={handleSaveSlot}>
                  {editingSlot ? 'Update Time Slot' : 'Add Time Slot'}
                </button>
                {editingSlot && (
                  <button className="ma-btn ma-btn-secondary" onClick={resetSlotForm}>Cancel</button>
                )}
              </div>
            </div>

            <div className="ma-table-container">
              <table className="ma-table">
                <thead>
                  <tr>
                    <th>Time Slot</th>
                    <th>Label</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {slots.map(slot => (
                    <tr key={slot.id}>
                      <td>{slot.timeSlot}</td>
                      <td>{slot.label}</td>
                      <td style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="ma-btn ma-btn-primary"
                          onClick={() => { setEditingSlot(slot); setSlotForm(slot); }}
                        >
                          Edit
                        </button>
                        <button
                          className="ma-btn"
                          style={{ padding: '6px 12px', fontSize: '0.85rem', background: '#e11d48', color: 'white' }}
                          onClick={() => handleDeleteSlot(slot.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {slots.length === 0 && (
                    <tr><td colSpan="3" style={{ textAlign: 'center' }}>No master time slots configured.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ManageAppointments;
