import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from '../../auth/contexts/AuthContext';
import "../../../styles/VetAppointments.css";

const VetAppointments = () => {
  const { user } = useAuth();
  const userId = user?.userId;

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelError, setCancelError] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (!userId) return;
    fetchAppointments();
  }, [userId]);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/appointments/vet/${userId}`);
      setAppointments(res.data || []);
    } catch (err) {
      console.error("Failed to load vet appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  const calculateOverdue = (dateStr) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const apptDate = new Date(dateStr);
    apptDate.setHours(0, 0, 0, 0);
    if (apptDate < today) {
      const diffTime = Math.abs(today - apptDate);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
    return 0;
  };

  const handleDone = async (id) => {
    try {
      await axios.patch(`/api/appointments/${id}/complete`);
      await fetchAppointments();
    } catch (error) {
      console.error("Failed to complete appointment:", error);
    }
  };

  const getStatusClass = (status) => {
    if (status === "CANCELLED") return "status-badge status-cancelled";
    if (status === "UPDATED") return "status-badge status-updated";
    return "status-badge status-upcoming";
  };

  const openCancelModal = (appointment) => {
    setSelectedAppointment(appointment);
    setCancelReason("");
    setCancelError("");
  };

  const closeCancelModal = () => {
    setSelectedAppointment(null);
    setCancelReason("");
    setCancelError("");
    setIsCancelling(false);
  };

  const handleCancel = async () => {
    const trimmedReason = cancelReason.trim();
    if (!trimmedReason) {
      setCancelError("Cancellation reason is required.");
      return;
    }

    try {
      setIsCancelling(true);
      setCancelError("");
      await axios.patch(
        `/api/appointments/${selectedAppointment.id}/cancel-by-vet`,
        {
          vetId: userId,
          reason: trimmedReason,
        }
      );
      await fetchAppointments();
      closeCancelModal();
    } catch (error) {
      setCancelError(error.response?.data?.message || "Failed to cancel appointment.");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="vet-appointments-container animate-fade-up">
      <div className="vet-appointments-card">
        <header className="vet-appointments-card-header">
          <h2 className="section-title">Clinical Daily Schedule</h2>
          <div className="doc-sidebar-role-badge" style={{ margin: 0, background: 'rgba(20,27,61,0.05)', color: 'var(--color-primary-dark)', border: '1px solid rgba(20,27,61,0.1)' }}>
            {appointments.filter(a => a.status === 'UPCOMING').length} UPCOMING
          </div>
        </header>

        {loading ? (
          <div className="loading-container" style={{ padding: '60px 0' }}>
            <div className="spinner" />
            <p style={{ color: 'var(--color-text-light)', marginTop: '16px' }}>Synchronizing schedule...</p>
          </div>
        ) : appointments.length === 0 ? (
          <div className="empty-state" style={{ padding: '60px 20px' }}>
            <span className="empty-state-icon">📅</span>
            <h3>No appointments found</h3>
            <p>You have no clinical sessions registered in the system currently.</p>
          </div>
        ) : (
          <div className="vet-appointments-grid">
            {appointments.map((a) => (
              <div key={a.id} className="vet-appointment-item" style={a.status === 'UPCOMING' && calculateOverdue(a.date) > 0 ? { border: '2px solid #dc2626' } : {}}>
                <h3>
                  <span>{a.petSpecies === 'Dog' ? '🐕' : a.petSpecies === 'Cat' ? '🐈' : '🐾'}</span>
                  {a.petName}
                </h3>

                <div className="vet-appointment-details">
                  <p><strong>Clinical Reason:</strong> <span>{a.appointmentType}</span></p>
                  <p><strong>Scheduled Date:</strong> <span>{new Date(a.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span></p>
                  <p><strong>Time Slot:</strong> <span>{a.timeSlot}</span></p>
                  <p><strong>Primary Owner:</strong> <span>{a.ownerFirstName} {a.ownerLastName}</span></p>
                  
                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(0,0,0,0.05)' }}>
                    <p style={{ marginBottom: '8px' }}><strong>Note for Clinician:</strong></p>
                    <p style={{ display: 'block', fontStyle: 'italic', background: 'rgba(0,0,0,0.02)', padding: '10px', borderRadius: '8px' }}>
                      {a.notes || "No additional clinical notes provided."}
                    </p>
                  </div>

                                    <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>Status</strong>
                    {a.status === 'UPCOMING' && calculateOverdue(a.date) > 0 ? (
                        <span className="status-badge" style={{ color: '#dc2626', background: 'rgba(239, 68, 68, 0.1)' }}>Overdue by {calculateOverdue(a.date)} days</span>
                    ) : (
                        <span className={getStatusClass(a.status)}>{a.status}</span>
                    )}
                  </div>

                  <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>Payment</strong>
                    <span className="status-badge" style={{ backgroundColor: a.paymentStatus === 'PAID' ? '#dcfce7' : '#fef9c3', color: a.paymentStatus === 'PAID' ? '#16a34a' : '#ca8a04' }}>
                      {a.paymentStatus || 'PENDING'}
                    </span>
                  </div>

                  {a.status === "CANCELLED" && (
                    <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '10px', borderLeft: '3px solid #dc2626' }}>
                      <p style={{ color: '#dc2626', fontWeight: 600, fontSize: '0.8rem', marginBottom: '4px' }}>CANCELLATION DATA</p>
                      <p style={{ fontSize: '0.85rem' }}><strong>By:</strong> {a.cancelledBy}</p>
                      <p style={{ fontSize: '0.85rem' }}><strong>Reason:</strong> {a.cancellationReason || "Not specified"}</p>
                    </div>
                  )}
                </div>

                {a.status === "UPCOMING" && (
                  <div style={{ display: 'flex', gap: '8px', marginTop: 'auto', paddingTop: '16px' }}>
                    <button
                      className="btn btn-teal"
                      style={{ flex: 1, padding: '8px' }}
                      onClick={(e) => { e.stopPropagation(); handleDone(a.id); }}
                      type="button"
                    >
                      Done
                    </button>
                    <button
                      className="btn btn-white"
                      style={{ flex: 1, color: '#dc2626', borderColor: 'rgba(239, 68, 68, 0.2)', padding: '8px' }}
                      onClick={(e) => { e.stopPropagation(); openCancelModal(a); }}
                      type="button"
                    >
                      Cancel Session
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Cancellation Modal */}
      {selectedAppointment && (
        <div className="success-modal-overlay" onClick={closeCancelModal}>
          <div className="vet-cancel-modal" onClick={e => e.stopPropagation()}>
            <h3>Authorize Cancellation</h3>
            <p className="vet-cancel-modal-subtitle">
              Documenting the clinical reason for this session termination.
            </p>

            <div className="vet-cancel-form-group">
              <label htmlFor="cancelReason" className="vet-cancel-label">
                Clinical Reason for Cancellation
              </label>
              <textarea
                id="cancelReason"
                className="vet-cancel-textarea"
                placeholder="Discuss the reason for this update (e.g. equipment failure, doctor emergency)..."
                value={cancelReason}
                onChange={(e) => {
                  setCancelReason(e.target.value);
                  if (cancelError) setCancelError("");
                }}
                rows={4}
              />
            </div>

            {cancelError && (
              <div className="vet-cancel-error-message">{cancelError}</div>
            )}

            <div className="vet-cancel-modal-actions">
              <button
                className="btn btn-primary"
                onClick={handleCancel}
                type="button"
                style={{ flex: 2, background: '#dc2626', borderColor: '#dc2626' }}
                disabled={isCancelling}
              >
                {isCancelling ? "Archiving..." : "Confirm Cancellation"}
              </button>

              <button
                className="btn btn-white"
                onClick={closeCancelModal}
                type="button"
                style={{ flex: 1 }}
                disabled={isCancelling}
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VetAppointments;