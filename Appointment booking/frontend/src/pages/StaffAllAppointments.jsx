import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../services/petService';
import '../styles/StaffAllAppointments.css';

const StaffAllAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.get(`${API_BASE_URL}/api/appointments`);
      const data = response.data?.data || response.data || [];

      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load appointments:', err);
      setError('Failed to load appointments.');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const getOwnerName = (appointment) => {
    return (
      appointment.owner?.fullName ||
      appointment.owner?.name ||
      appointment.owner?.username ||
      appointment.owner?.firstName ||
      appointment.user?.fullName ||
      appointment.user?.name ||
      appointment.user?.username ||
      appointment.user?.firstName ||
      'N/A'
    );
  };

  const getDoctorName = (appointment) => {
    return (
      appointment.vet?.fullName ||
      appointment.vet?.name ||
      appointment.vet?.username ||
      appointment.vet?.firstName ||
      appointment.doctor?.fullName ||
      appointment.doctorName ||
      appointment.doctor ||
      'N/A'
    );
  };

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const petName = appointment.pet?.name || appointment.petName || '';
      const ownerName = getOwnerName(appointment);
      const doctorName = getDoctorName(appointment);
      const appointmentType = appointment.appointmentType || '';
      const status = (appointment.status || '').toUpperCase();

      const matchesSearch =
        petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        appointmentType.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'ALL' || status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [appointments, searchTerm, statusFilter]);

  const getStatusClass = (status) => {
    const value = (status || '').toLowerCase();

    if (value === 'confirmed') return 'confirmed';
    if (value === 'pending') return 'pending';
    if (value === 'cancelled') return 'cancelled';
    if (value === 'completed') return 'completed';
    if (value === 'updated') return 'updated';
    if (value === 'upcoming') return 'default';

    return 'default';
  };

  if (loading) {
    return (
      <div className="staff-appointments-page">
        <div className="staff-appointments-loading">Loading appointments...</div>
      </div>
    );
  }

  return (
    <div className="staff-appointments-page">
      <div className="staff-appointments-header">
        <div>
          <h2>All Appointments</h2>
          <p>Clinic staff can view all appointments in the system here.</p>
        </div>
        <button className="staff-refresh-btn" onClick={fetchAppointments} type="button">
          Refresh
        </button>
      </div>

      <div className="staff-appointments-toolbar">
        <input
          type="text"
          placeholder="Search by pet, owner, doctor, or appointment type..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="staff-appointments-search"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="staff-appointments-filter"
        >
          <option value="ALL">All Statuses</option>
          <option value="UPCOMING">Upcoming</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="UPDATED">Updated</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {error && <div className="staff-appointments-error">{error}</div>}

      {filteredAppointments.length === 0 ? (
        <div className="staff-appointments-empty">No appointments found.</div>
      ) : (
        <div className="staff-appointments-table-wrapper">
          <table className="staff-appointments-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Pet</th>
                <th>Owner</th>
                <th>Doctor</th>
                <th>Type</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td>{appointment.id}</td>
                  <td>{appointment.pet?.name || appointment.petName || 'N/A'}</td>
                  <td>{getOwnerName(appointment)}</td>
                  <td>{getDoctorName(appointment)}</td>
                  <td>{appointment.appointmentType || 'N/A'}</td>
                  <td>{appointment.date || 'N/A'}</td>
                  <td>{appointment.timeSlot || appointment.time || 'N/A'}</td>
                  <td>
                    <span
                      className={`staff-appointment-status ${getStatusClass(appointment.status)}`}
                    >
                      {appointment.status || 'N/A'}
                    </span>
                  </td>
                  <td className="staff-appointment-notes">
                    {appointment.notes || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StaffAllAppointments;