import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../../services/petService';
import '../../../styles/StaffAllAppointments.css';

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
      setError('Failed to load appointments from server.');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const getOwnerName = (appointment) => {
    const ownerFirst = appointment.owner?.firstName || appointment.user?.firstName || appointment.ownerFirstName || '';
    const ownerLast = appointment.owner?.lastName || appointment.user?.lastName || appointment.ownerLastName || '';
    const fullNameFromParts = `${ownerFirst} ${ownerLast}`.trim();
    return appointment.owner?.fullName || appointment.user?.fullName || appointment.ownerName || fullNameFromParts || 'Anonymous Owner';
  };

  const getDoctorName = (appointment) => {
    const vetFirst = appointment.vet?.firstName || appointment.vetFirstName || '';
    const vetLast = appointment.vet?.lastName || appointment.vetLastName || '';
    const fullNameFromParts = `${vetFirst} ${vetLast}`.trim();
    return appointment.vet?.fullName || appointment.doctorName || fullNameFromParts || appointment.doctor || 'Unassigned';
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

      const matchesStatus = statusFilter === 'ALL' || status === statusFilter;
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
    return 'default';
  };

  if (loading) {
    return (
      <div className="staff-appointments-page">
        <div className="loading-container" style={{ padding: '80px 0' }}>
            <div className="spinner" />
            <p style={{ color: 'var(--color-text-light)', marginTop: '16px', fontWeight: 500 }}>Syncing Clinic Schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="staff-appointments-page animate-fade-up">
      <header className="staff-appointments-header">
        <div>
          <h2>Master Clinic Schedule</h2>
          <p>Comprehensive operational view of all registered medical sessions.</p>
        </div>
        <button className="btn btn-teal" onClick={fetchAppointments} type="button">
          🔄 Refresh Dashboard
        </button>
      </header>

      <div className="staff-appointments-toolbar">
        <input
          type="text"
          placeholder="Search patients, owners, clinicians..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="staff-appointments-search"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="staff-appointments-filter"
        >
          <option value="ALL">All Session Statuses</option>
          <option value="UPCOMING">Upcoming</option>
          <option value="PENDING">Pending Approval</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="UPDATED">Rescheduled</option>
          <option value="CANCELLED">Terminated</option>
          <option value="COMPLETED">Archived</option>
        </select>
      </div>

      {error && (
        <div className="error-banner" style={{ marginBottom: '24px' }}>
          <span style={{ fontSize: '1.2rem' }}>⚠️</span>
          <div style={{ flex: 1 }}>{error}</div>
          <button onClick={fetchAppointments}>Retry Connection</button>
        </div>
      )}

      {filteredAppointments.length === 0 ? (
        <div className="empty-state" style={{ padding: '60px 20px' }}>
            <span className="empty-state-icon">📋</span>
            <h3>No sessions found</h3>
            <p>No medical appointments match your active filter criteria.</p>
        </div>
      ) : (
        <div className="staff-appointments-table-wrapper shadow-premium">
          <table className="staff-appointments-table">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Owner contact</th>
                <th>Clinician</th>
                <th>Procedure</th>
                <th>Clinical Date</th>
                <th>Registry Status</th>
                <th>Payment</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--color-primary-dark)' }}>{appointment.pet?.name || appointment.petName || 'N/A'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--color-text-light)' }}>ID: #{appointment.id}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{getOwnerName(appointment)}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>Dr. {getDoctorName(appointment)}</div>
                  </td>
                  <td>
                    <div className="pet-detail-species-badge" style={{ fontSize: '0.75rem', background: 'rgba(20,27,61,0.05)' }}>{appointment.appointmentType || 'N/A'}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 700 }}>{appointment.date || 'N/A'}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-light)' }}>{appointment.timeSlot || appointment.time || 'N/A'}</div>
                  </td>
                  <td>
                    <span className={`staff-appointment-status ${getStatusClass(appointment.status)}`}>
                      {appointment.status || 'N/A'}
                    </span>
                  </td>
                  <td>
                    <span className="staff-appointment-status" style={{ backgroundColor: appointment.paymentStatus === 'PAID' ? '#dcfce7' : '#fef9c3', color: appointment.paymentStatus === 'PAID' ? '#16a34a' : '#ca8a04' }}>
                      {appointment.paymentStatus === 'PAID' ? 'PAID' : (appointment.paymentStatus || 'PENDING')}
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