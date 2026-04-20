import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import "../../../styles/MyAppointments.css";
import { useAuth } from "../../auth/contexts/AuthContext";
import { getAllVets } from "../../../services/vetService";
import { createCheckoutSession } from "../../../services/paymentService";

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
    () => filteredAppointments.filter((a) => (a.status || "").toUpperCase() === "UPCOMING"),
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

                      {isPaid ? (
                        <button className="btn btn-white" onClick={() => handlePayment(appt)}>
                          PAID
                        </button>
                      ) : (
                        <button className="btn btn-teal" onClick={() => handlePayment(appt)}>
                          {paymentStatus === "FAILED" || paymentStatus === "PENDING" ? "Retry Payment" : "Pay Now"}
                        </button>
                      )}
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
                pastAppointments.map((appt) => (
                  <div className="appointment-box" key={appt.id}>
                    <AppointmentDetails appointment={appt} />
                  </div>
                ))
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
    </div>
  );
};

export default MyAppointments;