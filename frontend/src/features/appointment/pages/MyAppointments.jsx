import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import "../../../styles/MyAppointments.css";
import { useAuth } from '../../auth/contexts/AuthContext';

// --- CONSTANTS ---
const INITIAL_UPDATE_FORM = {
  petName: "",
  petType: "",
  appointmentType: "",
  date: "",
  time: "",
  doctor: "",
  notes: "",
  petId: "",
  price: 0,
};

const INITIAL_CANCEL_FORM = {
  appointmentId: "",
  reason: "",
};

const APPOINTMENT_TYPES = ["Checkup", "Vaccination", "Operation", "Consultation"];

// --- SUB-COMPONENTS ---
const AppointmentDetails = ({ appointment, showUpdatedTag = false }) => {
  const status = (appointment.status || "").toUpperCase();
  const cancelledBy = (appointment.cancelledBy || "").toUpperCase();

  return (
    <>
      <p><strong>Pet:</strong> {appointment.pet?.name || appointment.petName || "N/A"} ({appointment.pet?.species || appointment.petSpecies || "N/A"})</p>
      <p><strong>Type:</strong> {appointment.appointmentType || appointment.appointment_type}</p>
      <p><strong>Date:</strong> {appointment.date}</p>
      <p><strong>Time:</strong> {appointment.timeSlot || appointment.time_slot}</p>
      <p><strong>Doctor:</strong> {appointment.doctor}</p>
      <p><strong>Notes:</strong> {appointment.notes || "-"}</p>
      <p>
        <strong>Status:</strong>{" "}
        <span className={status === "CANCELLED" ? "status-cancelled" : "status-badge"}>
          {appointment.status}
        </span>
        {showUpdatedTag && appointment.updated && (
          <span className="updated-tag">Updated</span>
        )}
      </p>

      {status === "CANCELLED" && (
        <div className="cancel-info-box">
          <p className="cancel-info-text">
            {cancelledBy === "VET" ? "Cancelled by veterinarian." : cancelledBy === "OWNER" ? "You cancelled this." : "Cancelled."}
          </p>
          {appointment.cancellationReason && <p className="cancel-reason"><strong>Reason:</strong> {appointment.cancellationReason}</p>}
        </div>
      )}
    </>
  );
};

// --- MAIN COMPONENT ---
const MyAppointments = () => {
  const { user } = useAuth();
  const userId = user?.userId;

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [updateForm, setUpdateForm] = useState(INITIAL_UPDATE_FORM);
  const [cancelForm, setCancelForm] = useState(INITIAL_CANCEL_FORM);
  const [loading, setLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCancelSuccessModal, setShowCancelSuccessModal] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [updateError, setUpdateError] = useState("");

  const fetchAppointments = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await axios.get(`/api/appointments/user/${userId}`);
      setAppointments(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [userId]);

  const filteredAppointments = useMemo(() => 
    appointments.filter((appt) => {
      const k = searchTerm.toLowerCase();
      const petName = appt.pet?.name || "";
      const type = appt.appointmentType || "";
      return petName.toLowerCase().includes(k) || type.toLowerCase().includes(k);
    }), [appointments, searchTerm]
  );

  const upcomingAppointments = useMemo(() => 
    filteredAppointments.filter(a => (a.status || "").toUpperCase() === "UPCOMING"), [filteredAppointments]
  );

  const pastAppointments = useMemo(() => 
    filteredAppointments.filter(a => ["PAST", "CANCELLED", "COMPLETED"].includes((a.status || "").toUpperCase())), [filteredAppointments]
  );

  const latestUpcomingAppointment = useMemo(() => 
    (upcomingAppointments.length > 0 ? upcomingAppointments[0] : null), [upcomingAppointments]
  );

  const openUpdateModal = (appointment) => {
    setSelectedAppointment(appointment);
    setUpdateForm({
      petName: appointment.pet?.name || appointment.petName || "",
      petType: appointment.pet?.species || appointment.petSpecies || "",
      appointmentType: appointment.appointmentType || "",
      date: appointment.date || "",
      time: appointment.timeSlot || "",
      doctor: appointment.doctor || "",
      notes: appointment.notes || "",
      petId: appointment.pet?.petId || appointment.petId || "",
      price: appointment.price || 0,
    });
    setShowUpdateModal(true);
  };

  const confirmUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.put(`/api/appointments/${selectedAppointment.id}`, { ...updateForm, userId, timeSlot: updateForm.time });
      setAppointments(prev => prev.map(a => a.id === selectedAppointment.id ? res.data : a));
      setShowUpdateModal(false);
      setShowSuccessModal(true);
    } catch (error) { setUpdateError("Failed to update."); }
  };

  const confirmCancel = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.patch(`/api/appointments/${cancelForm.appointmentId}/cancel`, { reason: cancelForm.reason });
      setAppointments(prev => prev.map(a => a.id === Number(cancelForm.appointmentId) ? res.data : a));
      setShowCancelModal(false);
      setShowCancelSuccessModal(true);
    } catch (error) { setCancelError("Cancellation failed."); }
  };

  return (
    <div className="appointments-container">
      <div className="appointments-header">
        <h1>My Appointments</h1>
        <button className="btn btn-teal" onClick={() => setShowCancelModal(true)}>
          Cancel Appointments
        </button>
      </div>

      <div className="search-wrapper">
        <input
          type="text"
          placeholder="Search by pet name or appointment type..."
          className="search-bar"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <p className="empty-text">Loading appointments...</p>
      ) : (
        <>
          {latestUpcomingAppointment && (
            <div className="latest-appointment-card">
              <div className="latest-badge">Latest Upcoming Appointment</div>
              <div className="latest-details">
                <AppointmentDetails appointment={latestUpcomingAppointment} showUpdatedTag={true} />
              </div>
            </div>
          )}

          <div className="appointments-grid">
            <div className="appointment-section">
              <h2>Upcoming Appointments</h2>
              {upcomingAppointments.length === 0 ? <p className="empty-text">No upcoming appointments.</p> :  
                upcomingAppointments.map(appt => (
                  <div className="appointment-box" key={appt.id}>
                    <AppointmentDetails appointment={appt} showUpdatedTag={true} />
                    <button className="btn btn-teal" onClick={() => openUpdateModal(appt)}>Update</button>
                  </div>
              ))}
            </div>

            <div className="appointment-section">
              <h2>Past / Cancelled</h2>
              {pastAppointments.length === 0 ? <p className="empty-text">No history found.</p> :  
                pastAppointments.map(appt => (
                  <div className="appointment-box" key={appt.id}>
                    <AppointmentDetails appointment={appt} />
                  </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Update Modal */}
      {showUpdateModal && (
        <div className="modal-overlay" onClick={() => setShowUpdateModal(false)}>
          <div className="update-modal" onClick={e => e.stopPropagation()}>
             <h2>Update Appointment</h2>
             <form onSubmit={confirmUpdate}>
                <div className="form-group">
                  <label>Type</label>
                  <select value={updateForm.appointmentType} onChange={e => setUpdateForm({...updateForm, appointmentType: e.target.value})}>
                    {APPOINTMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group"><label>Date</label><input type="date" min={today} value={updateForm.date} onChange={e => setUpdateForm({...updateForm, date: e.target.value})} /></div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-white" onClick={() => setShowUpdateModal(false)}>Close</button>
                  <button type="submit" className="btn btn-teal">Save Changes</button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="update-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Cancel Appointment</h2>
              <button className="close-btn" onClick={() => setShowCancelModal(false)}>&times;</button>
            </div>
            <form onSubmit={confirmCancel} className="update-form">
               <div className="form-group">
                 <label>Select Appointment</label>
                 <select value={cancelForm.appointmentId} onChange={e => setCancelForm({...cancelForm, appointmentId: e.target.value})} required>
                   <option value="">Select an appointment</option>
                   {upcomingAppointments.map(a => <option key={a.id} value={a.id}>{a.pet?.name} - {a.date}</option>)}
                 </select>
               </div>
               <div className="form-group">
                 <label>Reason for Cancellation</label>
                 <textarea placeholder="e.g. Pet is feeling better, change of date..." value={cancelForm.reason} onChange={e => setCancelForm({...cancelForm, reason: e.target.value})} required />
               </div>
               {cancelError && <div className="error-box">{cancelError}</div>}
               <div className="modal-actions">
                 <button type="button" className="btn btn-white" onClick={() => setShowCancelModal(false)}>Close</button>
                 <button type="submit" className="btn btn-teal">Confirm Cancellation</button>
               </div>
            </form>
          </div>
        </div>
      )}
      {showCancelSuccessModal && (
        <div className="modal-overlay" onClick={() => setShowCancelSuccessModal(false)}>
          <div className="success-modal" style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="success-icon" style={{ fontSize: '3rem', color: '#2dd4bf', marginBottom: '1rem' }}>✓</div>
            <h2>Successfully Cancelled</h2>
            <p>Your appointment has been removed from the schedule.</p>
            <button className="btn btn-teal" onClick={() => setShowCancelSuccessModal(false)} style={{ marginTop: '1.5rem' }}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;