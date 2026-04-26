import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import "../../../styles/MyAppointments.css";
import { useAuth } from "../../auth/contexts/AuthContext";
import { getAllVets } from "../../../services/vetService";
import AddFeedbackForm from "../../feedback/components/AddFeedbackForm";
import { getFeedbackByAppointment } from "../../../services/feedbackApi";

// --- CONSTANTS ---
const TIME_SLOTS = ["09:00 AM", "11:00 AM", "02:00 PM"];

const INITIAL_UPDATE_FORM = {
  petName: "",
  petType: "",
  appointmentType: "",
  date: "",
  time: "",
  doctor: "",
  vetId: null,
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
  const paymentStatus = (appointment.paymentStatus || "").toUpperCase();
  const isPaid = appointment.paid === true || paymentStatus === "PAID";

  return (
    <>
      <p>
        <strong>Pet:</strong> {appointment.pet?.name || appointment.petName || "N/A"} (
        {appointment.pet?.species || appointment.petSpecies || "N/A"})
      </p>
      <p>
        <strong>Type:</strong> {appointment.appointmentType || appointment.appointment_type}
      </p>
      <p>
        <strong>Date:</strong> {appointment.date}
      </p>
      <p>
        <strong>Time:</strong> {appointment.timeSlot || appointment.time_slot}
      </p>
      <p>
        <strong>Doctor:</strong> {appointment.doctor}
      </p>
      <p>
        <strong>Notes:</strong> {appointment.notes || "-"}
      </p>
      <p>
        <strong>Status:</strong>{" "}
        <span className={status === "CANCELLED" ? "status-cancelled" : "status-badge"}>
          {appointment.status}
        </span>
        {showUpdatedTag && appointment.updated && <span className="updated-tag">Updated</span>}
      </p>

      <p>
        <strong>Payment:</strong>{" "}
        {isPaid ? (
          <span className="updated-tag" style={{ backgroundColor: "#dcfce7", color: "#166534" }}>
            PAID
          </span>
        ) : paymentStatus === "FAILED" ? (
          <span className="updated-tag" style={{ backgroundColor: "#fee2e2", color: "#b91c1c" }}>
            FAILED
          </span>
        ) : paymentStatus === "PENDING" ? (
          <span className="updated-tag" style={{ backgroundColor: "#fef3c7", color: "#b45309" }}>
            PENDING
          </span>
        ) : (
          <span className="updated-tag" style={{ backgroundColor: "#f3f4f6", color: "#374151" }}>
            UNPAID
          </span>
        )}
      </p>

      {status === "CANCELLED" && (
        <div className="cancel-info-box">
          <p className="cancel-info-text">
            {cancelledBy === "VET"
              ? "Cancelled by veterinarian."
              : cancelledBy === "OWNER"
                ? "You cancelled this."
                : "Cancelled."}
          </p>
          {appointment.cancellationReason && (
            <p className="cancel-reason">
              <strong>Reason:</strong> {appointment.cancellationReason}
            </p>
          )}
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
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
    now.getDate()
  ).padStart(2, "0")}`;

  const [appointments, setAppointments] = useState([]);
  const [vets, setVets] = useState([]);
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

  const [notification, setNotification] = useState({
    show: false,
    title: "",
    message: "",
    type: "info",
  });

  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [appointmentForFeedback, setAppointmentForFeedback] = useState(null);
  const [existingFeedback, setExistingFeedback] = useState(null);
  const [showFeedbackSuccess, setShowFeedbackSuccess] = useState(false);

  const fetchAppointments = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await axios.get(`/api/appointments/user/${userId}`);
      const appts = Array.isArray(res.data) ? res.data : [];

      // Fetch upcoming vaccinations and merge them
      const { getUpcomingVaccinationsByOwner } = await import("../../../services/vaccinationApi");
      const vacRes = await getUpcomingVaccinationsByOwner(userId);
      const vacs = Array.isArray(vacRes) ? vacRes : (Array.isArray(vacRes?.data) ? vacRes.data : []);

      const mappedVacs = vacs.map(v => ({
         id: `vac-${v.id}`,
         pet: { name: v.petName, species: v.petSpecies, petId: v.petId },
         petName: v.petName,
         petSpecies: v.petSpecies,
         appointmentType: "Vaccination: " + v.vaccinationName,
         doctor: v.doctorName || "Staff",
         date: v.dueDate,
         timeSlot: "Pending",
         status: new Date(v.dueDate) < new Date(today) ? "OVERDUE" : "UPCOMING",
         paid: true,
         paymentStatus: "PAID", // Vaccinations are paid at clinic
         isVaccination: true
      }));

      setAppointments([...appts, ...mappedVacs]);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [userId]);

  useEffect(() => {
    getAllVets()
      .then((res) => setVets(Array.isArray(res) ? res : res.data || []))
      .catch((err) => console.error("Failed to load vets:", err));
  }, []);

  const filteredAppointments = useMemo(
    () =>
      appointments.filter((appt) => {
        const k = searchTerm.toLowerCase();
        const petName = (appt.pet?.name || appt.petName || "").toLowerCase();
        const type = (appt.appointmentType || "").toLowerCase();
        return petName.includes(k) || type.includes(k);
      }),
    [appointments, searchTerm]
  );

  const upcomingAppointments = useMemo(
    () => filteredAppointments.filter((a) => {
        const s = (a.status || "").toUpperCase();
        return s === "UPCOMING" || s === "OVERDUE" || s === "PENDING";
    }),
    [filteredAppointments]
  );

  const pastAppointments = useMemo(
    () =>
      filteredAppointments.filter((a) =>
        ["PAST", "CANCELLED", "COMPLETED"].includes((a.status || "").toUpperCase())
      ),
    [filteredAppointments]
  );

  const latestUpcomingAppointment = useMemo(
    () => (upcomingAppointments.length > 0 ? upcomingAppointments[0] : null),
    [upcomingAppointments]
  );

  const openUpdateModal = (appointment) => {
    setSelectedAppointment(appointment);
    setUpdateError("");
    setUpdateForm({
      petName: appointment.pet?.name || appointment.petName || "",
      petType: appointment.pet?.species || appointment.petSpecies || "",
      appointmentType: appointment.appointmentType || "",
      date: appointment.date || "",
      time: appointment.timeSlot || "",
      doctor: appointment.doctor || "",
      vetId: appointment.vetId || null,
      notes: appointment.notes || "",
      petId: appointment.pet?.petId || appointment.petId || "",
      price: appointment.price || 0,
    });
    setShowUpdateModal(true);
  };

  const confirmUpdate = async (e) => {
    e.preventDefault();
    setUpdateError("");
    try {
      const res = await axios.put(`/api/appointments/${selectedAppointment.id}`, {
        ...updateForm,
        userId,
        timeSlot: updateForm.time,
      });
      setAppointments((prev) => prev.map((a) => (a.id === selectedAppointment.id ? res.data : a)));
      setShowUpdateModal(false);
      setShowSuccessModal(true);
    } catch (error) {
      setUpdateError(error.response?.data?.message || "Failed to update. Please try again.");
    }
  };

  const confirmCancel = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.patch(`/api/appointments/${cancelForm.appointmentId}/cancel`, {
        reason: cancelForm.reason,
      });
      setAppointments((prev) =>
        prev.map((a) => (a.id === Number(cancelForm.appointmentId) ? res.data : a))
      );
      setShowCancelModal(false);
      setShowCancelSuccessModal(true);
    } catch (error) {
      setCancelError("Cancellation failed.");
    }
  };

  const handlePayment = async (appointment) => {
    const paymentStatus = (appointment.paymentStatus || "").toUpperCase();
    const isPaid = appointment.paid === true || paymentStatus === "PAID";
    const status = (appointment.status || "").toUpperCase();

    if (isPaid) {
      setNotification({
        show: true,
        title: "PAID",
        message: "This appointment is already paid.",
        type: "success",
      });
      return;
    }

    if (status === "CANCELLED" || status === "COMPLETED") {
      setNotification({
        show: true,
        title: "Payment Not Available",
        message: "Payment is not available for this appointment.",
        type: "warning",
      });
      return;
    }

    try {
      const checkoutUrl = await createCheckoutSession(appointment.id, "APPOINTMENT");
      window.location.href = checkoutUrl;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data ||
        "Failed to start payment. Please try again.";

      if (String(message).trim().toUpperCase() === "PAID") {
        setNotification({
          show: true,
          title: "PAID",
          message: "This appointment is already paid.",
          type: "success",
        });
        return;
      }

      setNotification({
        show: true,
        title: "Payment Error",
        message: message,
        type: "error",
      });
    }
  };

  const openAppointmentDetails = async (appointment) => {
    setSelectedAppointment(appointment);
    setExistingFeedback(null);
    setShowDetailModal(true);

    // Check if feedback already exists for this completed appointment
    const status = (appointment.status || "").toUpperCase();
    if (status === "COMPLETED" && !appointment.isVaccination) {
      try {
        const feedbacks = await getFeedbackByAppointment(appointment.id);
        if (feedbacks && feedbacks.length > 0) {
          setExistingFeedback(feedbacks[0]);
        }
      } catch (err) {
        console.error("Error checking feedback:", err);
      }
    }
  };

  const handleOpenFeedbackForm = (appointment) => {
    setAppointmentForFeedback(appointment);
    setShowFeedbackForm(true);
  };

  const handleFeedbackSuccess = () => {
    setShowFeedbackForm(false);
    setAppointmentForFeedback(null);
    setShowFeedbackSuccess(true);
    
    // Refresh feedback status
    setTimeout(() => {
      openAppointmentDetails(selectedAppointment);
      setShowFeedbackSuccess(false);
    }, 2000);
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
              {upcomingAppointments.length === 0 ? (
                <p className="empty-text">No upcoming appointments.</p>
              ) : (
                upcomingAppointments.map((appt) => {
                  const paymentStatus = (appt.paymentStatus || "").toUpperCase();
                  const isPaid = appt.paid === true || paymentStatus === "PAID";

                  return (
                    <div className="appointment-box" key={appt.id}>
                      <AppointmentDetails appointment={appt} showUpdatedTag={true} />
                      <button className="btn btn-teal" onClick={() => openUpdateModal(appt)}>
                        Update
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            <div className="appointment-section">
              <h2>Past / Cancelled</h2>
              {pastAppointments.length === 0 ? (
                <p className="empty-text">No history found.</p>
              ) : (
                pastAppointments.map((appt) => {
                  const status = (appt.status || "").toUpperCase();
                  const isCompleted = status === "COMPLETED";
                  
                  return (
                    <div 
                      key={appt.id}
                      className={`appointment-box ${isCompleted ? 'clickable' : ''}`}
                      onClick={() => isCompleted && openAppointmentDetails(appt)}
                      style={{ cursor: isCompleted ? 'pointer' : 'default' }}
                    >
                      <AppointmentDetails appointment={appt} />
                      {isCompleted && (
                        <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: '#6b7280' }}>
                          Click to add feedback
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}

      {showUpdateModal && (
        <div className="modal-overlay" onClick={() => setShowUpdateModal(false)}>
          <div className="update-modal" onClick={(e) => e.stopPropagation()}>
            <div className="update-modal__header">
              <h2 className="update-modal__title">Update Appointment</h2>
              <button
                type="button"
                className="update-modal__close"
                onClick={() => setShowUpdateModal(false)}
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            <form onSubmit={confirmUpdate} className="update-modal__form">
              <div className="update-modal__row">
                <div className="update-modal__field">
                  <label className="update-modal__label">Pet Name</label>
                  <input
                    type="text"
                    className="update-modal__input update-modal__input--readonly"
                    value={updateForm.petName}
                    readOnly
                  />
                </div>
                <div className="update-modal__field">
                  <label className="update-modal__label">Pet Type</label>
                  <input
                    type="text"
                    className="update-modal__input update-modal__input--readonly"
                    value={updateForm.petType}
                    readOnly
                  />
                </div>
              </div>

              <div className="update-modal__row">
                <div className="update-modal__field">
                  <label className="update-modal__label">Appointment Type</label>
                  <select
                    className="update-modal__input"
                    value={updateForm.appointmentType}
                    onChange={(e) =>
                      setUpdateForm({ ...updateForm, appointmentType: e.target.value })
                    }
                    required
                  >
                    <option value="">Select type</option>
                    {APPOINTMENT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="update-modal__field">
                  <label className="update-modal__label">Doctor</label>
                  <select
                    className="update-modal__input"
                    value={updateForm.vetId || ""}
                    onChange={(e) => {
                      const selected = vets.find((v) => String(v.userId) === e.target.value);
                      setUpdateForm({
                        ...updateForm,
                        vetId: selected ? selected.userId : null,
                        doctor: selected ? `${selected.firstName} ${selected.lastName}` : "",
                      });
                    }}
                    required
                  >
                    <option value="">Select a doctor</option>
                    {vets.map((v) => (
                      <option key={v.userId} value={v.userId}>
                        Dr. {v.firstName} {v.lastName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="update-modal__row">
                <div className="update-modal__field">
                  <label className="update-modal__label">Date</label>
                  <input
                    type="date"
                    className="update-modal__input"
                    min={today}
                    value={updateForm.date}
                    onChange={(e) => setUpdateForm({ ...updateForm, date: e.target.value })}
                    required
                  />
                </div>
                <div className="update-modal__field">
                  <label className="update-modal__label">Time</label>
                  <select
                    className="update-modal__input"
                    value={updateForm.time}
                    onChange={(e) => setUpdateForm({ ...updateForm, time: e.target.value })}
                    required
                  >
                    <option value="">Select a time</option>
                    {TIME_SLOTS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="update-modal__field update-modal__field--full">
                <label className="update-modal__label">Notes</label>
                <textarea
                  className="update-modal__textarea"
                  rows={3}
                  placeholder="Enter any additional notes..."
                  value={updateForm.notes}
                  onChange={(e) => setUpdateForm({ ...updateForm, notes: e.target.value })}
                />
              </div>

              {updateError && <div className="error-box" style={{ marginBottom: "12px" }}>{updateError}</div>}

              <div className="update-modal__footer">
                <button
                  type="button"
                  className="btn btn-white"
                  onClick={() => setShowUpdateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-teal">
                  Confirm Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCancelModal && (
        <div className="modal-overlay" onClick={() => setShowCancelModal(false)}>
          <div className="update-modal" onClick={(e) => e.stopPropagation()}>
            <div className="update-modal__header">
              <h2 className="update-modal__title">Cancel Appointment</h2>
              <button
                type="button"
                className="update-modal__close"
                onClick={() => setShowCancelModal(false)}
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            <form onSubmit={confirmCancel} className="update-modal__form">
              <div className="update-modal__field update-modal__field--full">
                <label className="update-modal__label">Select Appointment</label>
                <select
                  className="update-modal__input"
                  value={cancelForm.appointmentId}
                  onChange={(e) => setCancelForm({ ...cancelForm, appointmentId: e.target.value })}
                  required
                >
                  <option value="">Choose an upcoming appointment</option>
                  {upcomingAppointments.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.pet?.name || a.petName || "Pet"} — {a.date} at {a.timeSlot} ({a.appointmentType})
                    </option>
                  ))}
                </select>
              </div>

              <div className="update-modal__field update-modal__field--full">
                <label className="update-modal__label">Reason for Cancellation</label>
                <textarea
                  className="update-modal__textarea"
                  rows={4}
                  placeholder="e.g. Pet is feeling better, change of plans..."
                  value={cancelForm.reason}
                  onChange={(e) => setCancelForm({ ...cancelForm, reason: e.target.value })}
                  required
                />
              </div>

              {cancelError && <div className="error-box" style={{ marginBottom: "12px" }}>{cancelError}</div>}

              <div className="update-modal__footer">
                <button
                  type="button"
                  className="btn btn-white"
                  onClick={() => setShowCancelModal(false)}
                >
                  Close
                </button>
                <button type="submit" className="btn btn-teal">
                  Confirm Cancellation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCancelSuccessModal && (
        <div className="modal-overlay" onClick={() => setShowCancelSuccessModal(false)}>
          <div className="success-modal" style={{ textAlign: "center", padding: "2rem" }}>
            <div className="success-icon" style={{ fontSize: "3rem", color: "#2dd4bf", marginBottom: "1rem" }}>
              ✓
            </div>
            <h2>Successfully Cancelled</h2>
            <p>Your appointment has been removed from the schedule.</p>
            <button
              className="btn btn-teal"
              onClick={() => setShowCancelSuccessModal(false)}
              style={{ marginTop: "1.5rem" }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {showSuccessModal && (
        <div className="modal-overlay" onClick={() => setShowSuccessModal(false)}>
          <div className="success-modal" style={{ textAlign: "center", padding: "2rem" }}>
            <div className="success-icon" style={{ fontSize: "3rem", color: "#2dd4bf", marginBottom: "1rem" }}>
              ✓
            </div>
            <h2>Appointment Updated</h2>
            <p>Your appointment has been updated successfully.</p>
            <button
              className="btn btn-teal"
              onClick={() => setShowSuccessModal(false)}
              style={{ marginTop: "1.5rem" }}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {notification.show && (
        <div className="modal-overlay" onClick={() => setNotification({ ...notification, show: false })}>
          <div
            className="success-modal"
            style={{ textAlign: "center", padding: "2rem", maxWidth: "500px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="success-icon"
              style={{
                fontSize: "3rem",
                marginBottom: "1rem",
                color:
                  notification.type === "success"
                    ? "#22c55e"
                    : notification.type === "warning"
                      ? "#f59e0b"
                      : "#ef4444",
              }}
            >
              {notification.type === "success"
                ? "✓"
                : notification.type === "warning"
                  ? "!"
                  : "✕"}
            </div>

            <h2>{notification.title}</h2>
            <p>{notification.message}</p>

            <button
              className="btn btn-teal"
              onClick={() => setNotification({ ...notification, show: false })}
              style={{ marginTop: "1.5rem" }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Appointment Details Modal */}
      {showDetailModal && selectedAppointment && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="update-modal" onClick={(e) => e.stopPropagation()}>
            <div className="update-modal__header">
              <h2 className="update-modal__title">Appointment Details</h2>
              <button
                type="button"
                className="update-modal__close"
                onClick={() => setShowDetailModal(false)}
                aria-label="Close"
              >
                &times;
              </button>
            </div>

            <div className="update-modal__form" style={{ padding: "1.5rem" }}>
              <AppointmentDetails appointment={selectedAppointment} />

              {/* Feedback Section */}
              {(selectedAppointment.status || "").toUpperCase() === "COMPLETED" && !selectedAppointment.isVaccination && (
                <div style={{ marginTop: "1.5rem", borderTop: "1px solid #e5e7eb", paddingTop: "1.5rem" }}>
                  {existingFeedback ? (
                    <div style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "6px", padding: "1rem" }}>
                      <p style={{ margin: "0 0 0.5rem 0", color: "#166534", fontWeight: "600" }}>
                        ✓ Your feedback has been submitted
                      </p>
                      <div className="feedback-stars" style={{ marginBottom: "0.5rem" }}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <span key={star} className={star <= existingFeedback.rating ? 'star filled' : 'star'} style={{ color: '#fbbf24', marginRight: '0.25rem' }}>★</span>
                        ))}
                      </div>
                      {existingFeedback.comment && (
                        <p style={{ margin: "0.5rem 0 0 0", color: "#374151", fontStyle: "italic" }}>
                          "{existingFeedback.comment}"
                        </p>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-teal"
                      onClick={() => handleOpenFeedbackForm(selectedAppointment)}
                      style={{ width: "100%" }}
                    >
                      Add Feedback
                    </button>
                  )}
                </div>
              )}

              <div className="update-modal__footer" style={{ marginTop: "1.5rem" }}>
                <button
                  type="button"
                  className="btn btn-white"
                  onClick={() => setShowDetailModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showFeedbackForm && appointmentForFeedback && (
        <AddFeedbackForm
          appointment={appointmentForFeedback}
          ownerId={userId}
          onClose={() => setShowFeedbackForm(false)}
          onSubmitSuccess={handleFeedbackSuccess}
          feedbackType="APPOINTMENT"
          isVerified={true}
        />
      )}

      {/* Feedback Success Modal */}
      {showFeedbackSuccess && (
        <div className="modal-overlay" onClick={() => setShowFeedbackSuccess(false)}>
          <div className="success-modal" style={{ textAlign: "center", padding: "2rem" }}>
            <div className="success-icon" style={{ fontSize: "3rem", color: "#22c55e", marginBottom: "1rem" }}>
              ✓
            </div>
            <h2>Feedback Submitted</h2>
            <p>Thank you for your feedback!</p>
            <button
              className="btn btn-teal"
              onClick={() => setShowFeedbackSuccess(false)}
              style={{ marginTop: "1.5rem" }}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyAppointments;