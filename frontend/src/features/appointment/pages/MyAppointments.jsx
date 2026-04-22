import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import "../../../styles/MyAppointments.css";
import { useAuth } from '../../auth/contexts/AuthContext';
import { getAllVets } from '../../../services/vetService';
import { submitFeedback } from '../../../services/feedbackApi';

// --- CONSTANTS ---
const TIME_SLOTS = ['09:00 AM', '11:00 AM', '02:00 PM'];
const APPOINTMENT_TYPES = ["Checkup", "Vaccination", "Operation", "Consultation", "Vaccination Reminder"];

// --- SUB-COMPONENTS ---
const calculateOverdue = (dateStr) => {
  if (!dateStr) return 0;
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

const AppointmentDetails = ({ appointment, showUpdatedTag = false }) => {
  const status = (appointment.status || "").toUpperCase();
  const cancelledBy = (appointment.cancelledBy || "").toUpperCase();
  const overdueDays = calculateOverdue(appointment.date);
  const isPendingType = status === 'UPCOMING' || status === 'PENDING';

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
        {isPendingType && overdueDays > 0 ? (
           <span className="status-badge" style={{ color: '#dc2626', background: 'rgba(239, 68, 68, 0.1)' }}>Overdue by {overdueDays} days</span>
        ) : (
           <span className={status === "CANCELLED" ? "status-cancelled" : "status-badge"}>
             {appointment.status}
           </span>
        )}
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

const StarRating = ({ rating, setRating }) => {
  return (
    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', fontSize: '2rem', cursor: 'pointer', color: '#fbbf24' }}>
      {[1, 2, 3, 4, 5].map(star => (
        <span key={star} onClick={() => { if(setRating) setRating(star) }}>
          {star <= rating ? '★' : '☆'}
        </span>
      ))}
    </div>
  );
};

// --- MAIN COMPONENT ---
const MyAppointments = () => {
  const { user } = useAuth();
  const userId = user?.userId;

  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const [appointments, setAppointments] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [vets, setVets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Unified Modal States
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editForm, setEditForm] = useState({});

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelForm, setCancelForm] = useState({ reason: "" });

  const [loading, setLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCancelSuccessModal, setShowCancelSuccessModal] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [updateError, setUpdateError] = useState("");

  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({ rating: 0, comment: "" });
  const [feedbackError, setFeedbackError] = useState("");
  const [showFeedbackSuccess, setShowFeedbackSuccess] = useState(false);

  const fetchAppointments = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const [apptRes, remRes] = await Promise.all([
         axios.get(`/api/appointments/user/${userId}`),
         axios.get(`/api/reminders?userId=${userId}`)
      ]);
      setAppointments(Array.isArray(apptRes.data) ? apptRes.data : []);
      
      const formattedReminders = (Array.isArray(remRes.data) ? remRes.data : []).map(r => ({
         id: r.reminderId,
         isReminder: true,
         petName: r.petName,
         petSpecies: 'Pet',
         appointmentType: r.reminderType ? `${r.reminderType} Reminder` : 'Vaccination Reminder',
         date: r.dueDate,
         timeSlot: 'All Day',
         doctor: 'System Generated',
         notes: r.description,
         status: r.status,
         petId: r.petId
      }));
      setReminders(formattedReminders);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [userId]);

  useEffect(() => {
    getAllVets()
      .then((res) => setVets(Array.isArray(res) ? res : (res.data || [])))
      .catch((err) => console.error('Failed to load vets:', err));
  }, []);

  const allItems = useMemo(() => [...appointments, ...reminders], [appointments, reminders]);

  const filteredItems = useMemo(() => 
    allItems.filter((item) => {
      const k = searchTerm.toLowerCase();
      const petName = item.pet?.name || item.petName || "";
      const type = item.appointmentType || "";
      return petName.toLowerCase().includes(k) || type.toLowerCase().includes(k);
    }), [allItems, searchTerm]
  );

  const upcomingAppointments = useMemo(() => 
    filteredItems.filter(a => {
      const s = (a.status || "").toUpperCase();
      return s === "UPCOMING" || s === "PENDING";
    }), [filteredItems]
  );

  const pastAppointments = useMemo(() => 
    filteredItems.filter(a => {
      const s = (a.status || "").toUpperCase();
      return ["PAST", "CANCELLED", "COMPLETED"].includes(s);
    }), [filteredItems]
  );

  const latestUpcomingAppointment = useMemo(() => 
    (upcomingAppointments.length > 0 ? upcomingAppointments[0] : null), [upcomingAppointments]
  );

  const openDetailsModal = (item) => {
    setSelectedItem(item);
    setUpdateError("");
    setIsEditMode(false);
    setEditForm({
      petName: item.pet?.name || item.petName || "",
      petType: item.pet?.species || item.petSpecies || "",
      appointmentType: item.appointmentType || "",
      date: item.date || "",
      time: item.timeSlot || "",
      doctor: item.doctor || "",
      vetId: item.vetId || null,
      notes: item.notes || "",
      petId: item.pet?.petId || item.petId || "",
    });
    setShowDetailsModal(true);
  };

  const confirmUpdate = async (e) => {
    e.preventDefault();
    setUpdateError("");
    try {
      if (selectedItem.isReminder) {
         await axios.put(`/api/reminders/${selectedItem.id}`, {
            dueDate: editForm.date,
            description: editForm.notes,
            status: selectedItem.status
         });
      } else {
         await axios.put(`/api/appointments/${selectedItem.id}`, {
            ...editForm,
            userId,
            timeSlot: editForm.time,
         });
      }
      await fetchAppointments();
      setShowDetailsModal(false);
      setShowSuccessModal(true);
    } catch (error) {
      setUpdateError(error.response?.data?.message || "Failed to update. Please try again.");
    }
  };

  const openCancelPrompt = () => {
    setCancelForm({ reason: "" });
    setShowDetailsModal(false);
    setShowCancelModal(true);
  };

  const confirmCancel = async (e) => {
    e.preventDefault();
    try {
      if (selectedItem.isReminder) {
         await axios.put(`/api/reminders/${selectedItem.id}`, {
             dueDate: selectedItem.date,
             description: selectedItem.notes,
             status: "CANCELLED"
         });
      } else {
         await axios.patch(`/api/appointments/${selectedItem.id}/cancel`, { reason: cancelForm.reason });
      }
      await fetchAppointments();
      setShowCancelModal(false);
      setShowCancelSuccessModal(true);
    } catch (error) { setCancelError("Cancellation failed."); }
  };

  const openFeedbackModal = (item) => {
    setSelectedItem(item);
    setFeedbackForm({ rating: 0, comment: "" });
    setFeedbackError("");
    setShowDetailsModal(false);
    setShowFeedbackModal(true);
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (feedbackForm.rating < 1 || feedbackForm.rating > 5) {
      setFeedbackError("Please select a rating between 1 and 5 stars.");
      return;
    }
    setFeedbackError("");
    try {
      await submitFeedback({
        rating: feedbackForm.rating,
        comment: feedbackForm.comment,
        appointmentId: selectedItem.id,
        ownerId: userId
      });
      setShowFeedbackModal(false);
      setShowFeedbackSuccess(true);
    } catch (error) {
       const respData = error.response?.data;
       const errMessage = typeof respData === 'object' && respData !== null 
          ? (respData.message || "Failed to submit feedback.")
          : (respData || "Failed to submit feedback.");
       setFeedbackError(errMessage);
    }
  };

  return (
    <div className="appointments-container">
      <div className="appointments-header">
        <h1>My Appointments</h1>
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
            <div className="latest-appointment-card" onClick={() => openDetailsModal(latestUpcomingAppointment)} style={{ cursor: 'pointer', border: (calculateOverdue(latestUpcomingAppointment.date) > 0 && (latestUpcomingAppointment.status==='UPCOMING'||latestUpcomingAppointment.status==='PENDING')) ? '2px solid #dc2626' : undefined }}>
              <div className="latest-badge">Latest Upcoming Appointment</div>
              <div className="latest-details">
                <AppointmentDetails appointment={latestUpcomingAppointment} showUpdatedTag={true} />
              </div>
            </div>
          )}

          <div className="appointments-grid">
            <div className="appointment-section">
              <h2>Upcoming Bookings & Reminders</h2>
              {upcomingAppointments.length === 0 ? <p className="empty-text">No upcoming schedules.</p> :  
                upcomingAppointments.map(item => {
                  const overdueDays = calculateOverdue(item.date);
                  const isOverdue = overdueDays > 0;
                  return (
                  <div 
                    className="appointment-box" 
                    key={(item.isReminder ? 'rem-' : 'appt-') + item.id} 
                    onClick={() => openDetailsModal(item)}
                    style={{ cursor: 'pointer', border: isOverdue ? '2px solid #dc2626' : undefined }}
                  >
                    <AppointmentDetails appointment={item} showUpdatedTag={true} />
                  </div>
                )})}
            </div>

            <div className="appointment-section">
              <h2>Past / Cancelled</h2>
              {pastAppointments.length === 0 ? <p className="empty-text">No history found.</p> :  
                pastAppointments.map(item => (
                  <div className="appointment-box" key={(item.isReminder ? 'rem-' : 'appt-') + item.id} onClick={() => openDetailsModal(item)} style={{cursor: 'pointer'}}>
                    <AppointmentDetails appointment={item} />
                  </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Unified Details & Edit Modal */}
      {showDetailsModal && selectedItem && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="update-modal" onClick={e => e.stopPropagation()}>
            <div className="update-modal__header">
              <h2 className="update-modal__title">{isEditMode ? "Edit Details" : "Record Details"}</h2>
              <button
                type="button"
                className="update-modal__close"
                onClick={() => setShowDetailsModal(false)}
              >&times;</button>
            </div>

            <form onSubmit={confirmUpdate} className="update-modal__form">
              <div className="update-modal__row">
                <div className="update-modal__field">
                  <label className="update-modal__label">Pet Name</label>
                  <input type="text" className="update-modal__input update-modal__input--readonly" value={editForm.petName} readOnly />
                </div>
                <div className="update-modal__field">
                  <label className="update-modal__label">Pet Type</label>
                  <input type="text" className="update-modal__input update-modal__input--readonly" value={editForm.petType} readOnly />
                </div>
              </div>

              <div className="update-modal__row">
                <div className="update-modal__field">
                  <label className="update-modal__label">Type</label>
                  {!isEditMode || selectedItem.isReminder ? (
                      <input type="text" className="update-modal__input update-modal__input--readonly" value={editForm.appointmentType} readOnly />
                  ) : (
                      <select className="update-modal__input" value={editForm.appointmentType} onChange={e => setEditForm({ ...editForm, appointmentType: e.target.value })} required>
                        <option value="">Select type</option>
                        {APPOINTMENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                  )}
                </div>
                {!selectedItem.isReminder && (
                    <div className="update-modal__field">
                      <label className="update-modal__label">Doctor</label>
                      {!isEditMode ? (
                          <input type="text" className="update-modal__input update-modal__input--readonly" value={editForm.doctor || ''} readOnly />
                      ) : (
                          <select className="update-modal__input" value={editForm.vetId || ""} onChange={e => {
                              const selected = vets.find(v => String(v.userId) === e.target.value);
                              setEditForm({
                                ...editForm,
                                vetId: selected ? selected.userId : null,
                                doctor: selected ? `${selected.firstName} ${selected.lastName}` : "",
                              });
                            }} required>
                            <option value="">Select a doctor</option>
                            {vets.map(v => (
                              <option key={v.userId} value={v.userId}>Dr. {v.firstName} {v.lastName}</option>
                            ))}
                          </select>
                      )}
                    </div>
                )}
              </div>

              <div className="update-modal__row">
                <div className="update-modal__field">
                  <label className="update-modal__label">{selectedItem.isReminder ? "Due Date" : "Date"}</label>
                  <input type="date" className={`update-modal__input ${!isEditMode ? 'update-modal__input--readonly' : ''}`} min={today} value={editForm.date} onChange={e => setEditForm({ ...editForm, date: e.target.value })} readOnly={!isEditMode} required />
                </div>
                {!selectedItem.isReminder && (
                    <div className="update-modal__field">
                      <label className="update-modal__label">Time</label>
                      {!isEditMode ? (
                          <input type="text" className="update-modal__input update-modal__input--readonly" value={editForm.time || ''} readOnly />
                      ) : (
                          <select className="update-modal__input" value={editForm.time} onChange={e => setEditForm({ ...editForm, time: e.target.value })} required>
                            <option value="">Select a time</option>
                            {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                      )}
                    </div>
                )}
              </div>

              <div className="update-modal__field update-modal__field--full">
                <label className="update-modal__label">Notes & Description</label>
                <textarea className={`update-modal__textarea ${!isEditMode ? 'update-modal__input--readonly' : ''}`} rows={3} value={editForm.notes} onChange={e => setEditForm({ ...editForm, notes: e.target.value })} readOnly={!isEditMode} />
              </div>

              {/* Status Section in Modal */}
              <div style={{marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px'}}>
                 <strong>Status:</strong>
                 {(selectedItem.status === 'UPCOMING' || selectedItem.status === 'PENDING') && calculateOverdue(selectedItem.date) > 0 ? (
                    <span className="status-badge" style={{ color: '#dc2626', background: 'rgba(239, 68, 68, 0.1)' }}>Overdue by {calculateOverdue(selectedItem.date)} days</span>
                 ) : (
                    <span className="status-badge">{selectedItem.status}</span>
                 )}
              </div>

              {updateError && <div className="error-box" style={{ marginTop: '12px' }}>{updateError}</div>}

              <div className="update-modal__footer" style={{ marginTop: '24px' }}>
                {!isEditMode ? (
                   <>
                     { (selectedItem.status === 'UPCOMING' || selectedItem.status === 'PENDING') && (
                         <button type="button" className="btn btn-white" onClick={openCancelPrompt} style={{ color: '#dc2626', borderColor: 'rgba(239, 68, 68, 0.2)' }}>Cancel Booking</button>
                     )}
                     { (selectedItem.status === 'COMPLETED') && (
                         <button type="button" className="btn btn-white" onClick={() => openFeedbackModal(selectedItem)} style={{ color: '#4f46e5', borderColor: 'rgba(79, 70, 229, 0.2)' }}>Leave Feedback</button>
                     )}
                     <div style={{ flex: 1 }}></div>
                     { (selectedItem.status === 'UPCOMING' || selectedItem.status === 'PENDING') && (
                         <button type="button" className="btn btn-teal" onClick={() => setIsEditMode(true)}>Update</button>
                     )}
                   </>
                ) : (
                   <>
                     <button type="button" className="btn btn-white" onClick={() => setIsEditMode(false)}>Discard</button>
                     <button type="submit" className="btn btn-teal">Confirm Update</button>
                   </>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="update-modal" onClick={e => e.stopPropagation()}>
            <div className="update-modal__header">
              <h2 className="update-modal__title">Cancel Booking</h2>
              <button type="button" className="update-modal__close" onClick={() => setShowCancelModal(false)}>&times;</button>
            </div>
            <form onSubmit={confirmCancel} className="update-modal__form">
              <div className="update-modal__field update-modal__field--full">
                <label className="update-modal__label">Reason for Cancellation</label>
                <textarea className="update-modal__textarea" rows={4} placeholder="e.g. Change of plans..." value={cancelForm.reason} onChange={e => setCancelForm({ ...cancelForm, reason: e.target.value })} required={!selectedItem?.isReminder} />
              </div>
              {cancelError && <div className="error-box" style={{ marginBottom: '12px' }}>{cancelError}</div>}
              <div className="update-modal__footer">
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
            <div className="success-icon" style={{ fontSize: '3rem', color: '#2dd4bf', margin: '0 auto 1rem' }}>✓</div>
            <h2>Successfully Cancelled</h2>
            <p>Your booking has been removed from the schedule.</p>
            <button className="btn btn-teal" onClick={() => setShowCancelSuccessModal(false)} style={{ marginTop: '1.5rem' }}>Done</button>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="modal-overlay" onClick={() => setShowSuccessModal(false)}>
          <div className="success-modal" style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="success-icon" style={{ fontSize: '3rem', color: '#2dd4bf', margin: '0 auto 1rem' }}>✓</div>
            <h2>Successfully Updated</h2>
            <p>The details have been saved.</p>
            <button className="btn btn-teal" onClick={() => setShowSuccessModal(false)} style={{ marginTop: '1.5rem' }}>Done</button>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="modal-overlay" onClick={() => setShowFeedbackModal(false)}>
          <div className="update-modal" onClick={e => e.stopPropagation()}>
            <div className="update-modal__header">
              <h2 className="update-modal__title">Leave Feedback</h2>
              <button type="button" className="update-modal__close" onClick={() => setShowFeedbackModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleFeedbackSubmit} className="update-modal__form">
              <div className="update-modal__field update-modal__field--full">
                <label className="update-modal__label">Rating (1-5 stars)</label>
                <StarRating rating={feedbackForm.rating} setRating={(r) => setFeedbackForm({...feedbackForm, rating: r})} />
              </div>

              <div className="update-modal__field update-modal__field--full">
                <label className="update-modal__label">Comment (Optional)</label>
                <textarea className="update-modal__textarea" rows={4} placeholder="Share your experience..." value={feedbackForm.comment} onChange={e => setFeedbackForm({ ...feedbackForm, comment: e.target.value })} />
              </div>
              
              {feedbackError && <div className="error-box" style={{ marginBottom: '12px' }}>{feedbackError}</div>}
              
              <div className="update-modal__footer">
                <button type="button" className="btn btn-white" onClick={() => setShowFeedbackModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-teal">Submit Feedback</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showFeedbackSuccess && (
        <div className="modal-overlay" onClick={() => setShowFeedbackSuccess(false)}>
          <div className="success-modal" style={{ textAlign: 'center', padding: '2rem' }}>
            <div className="success-icon" style={{ fontSize: '3rem', color: '#2dd4bf', margin: '0 auto 1rem' }}>✓</div>
            <h2>Feedback Submitted Successfully</h2>
            <p>Thank you for your valuable feedback!</p>
            <button className="btn btn-teal" onClick={() => setShowFeedbackSuccess(false)} style={{ marginTop: '1.5rem' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
