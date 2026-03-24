import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import OwnerSidebar from "../components/owner/OwnerSidebar";
import "../styles/Dashboard.css";
import "../styles/MyAppointments.css";
import useCurrentUser from "../hooks/useCurrentUser";

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

const APPOINTMENT_PRICES = {
  Vaccination: 2500,
  Checkup: 2000,
  Operation: 12000,
  Consultation: 2000,
};

const APPOINTMENT_TYPES = ["Checkup", "Vaccination", "Consultation", "Operation"];
const DOCTORS = ["Dr. Silva", "Dr. Perera", "Dr. Fernando"];
const TIMES = ["09:00 AM", "11:00 AM", "02:00 PM"];

const DOCTOR_TIME_MAP = {
  "Dr. Silva": "09:00 AM",
  "Dr. Perera": "11:00 AM",
  "Dr. Fernando": "02:00 PM",
};

const buildUserData = (user) => ({
  fullName: user?.fullName || "User",
  email: user?.email || "user@petcarehub.com",
  initials: user?.initials || "U",
});

const matchesSearch = (appointment, keyword) => {
  const k = keyword.toLowerCase();

  const petName = appointment.pet?.name || "";
  const petSpecies = appointment.pet?.species || "";
  const appointmentType = appointment.appointmentType || appointment.appointment_type || "";
  const doctor = appointment.doctor || "";
  const notes = appointment.notes || "";
  const status = appointment.status || "";

  return (
    petName.toLowerCase().includes(k) ||
    petSpecies.toLowerCase().includes(k) ||
    appointmentType.toLowerCase().includes(k) ||
    doctor.toLowerCase().includes(k) ||
    notes.toLowerCase().includes(k) ||
    status.toLowerCase().includes(k)
  );
};

const AppointmentDetails = ({ appointment, showUpdatedTag = false }) => (
  <>
    <p>
      <strong>Pet:</strong> {appointment.pet?.name} ({appointment.pet?.species})
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
      <strong>Notes:</strong> {appointment.notes}
    </p>
    <p>
      <strong>Status:</strong> {appointment.status}
      {showUpdatedTag && appointment.updated && (
        <span className="updated-tag">Updated</span>
      )}
    </p>
  </>
);

const InlineNotification = ({ type = "error", message, onClose }) => (
  <div className={`inline-notification inline-notification--${type}`}>
    <span className="inline-notification__icon">
      {type === "error" ? "⚠" : "✓"}
    </span>
    <span className="inline-notification__message">{message}</span>
    <button className="inline-notification__close" onClick={onClose} aria-label="Dismiss">
      ×
    </button>
  </div>
);

const SuccessModal = ({ onClose }) => (
  <div className="success-modal-overlay">
    <div className="success-modal">
      <div className="success-modal__icon">✓</div>
      <h3 className="success-modal__title">Appointment Updated!</h3>
      <p className="success-modal__message">
        Your appointment has been updated successfully. An email confirmation
        has been sent to your registered email address.
      </p>
      <button className="success-modal__btn" onClick={onClose}>
        Done
      </button>
    </div>
  </div>
);

const CancelSuccessModal = ({ onClose }) => (
  <div className="success-modal-overlay">
    <div className="success-modal">
      <div className="success-modal__icon">✓</div>
      <h3 className="success-modal__title">Appointment Cancelled!</h3>
      <p className="success-modal__message">
        Your appointment has been cancelled successfully. An email confirmation
        has been sent to your registered email address.
      </p>
      <button className="success-modal__btn" onClick={onClose}>
        Done
      </button>
    </div>
  </div>
);

const MyAppointments = () => {
  const { userId, fullName, email, initials } = useCurrentUser();

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
  const [notification, setNotification] = useState(null);

  const showNotification = (message, type = "error") => {
    setNotification({ type, message });
  };

  const dismissNotification = () => setNotification(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);

      console.log("Current userId:", userId);

      const res = await axios.get(`http://localhost:8083/api/appointments/user/${userId}`);

      console.log("Appointments from API:", res.data);

      const mapped = Array.isArray(res.data) ? res.data : [];

      setAppointments(mapped);
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchAppointments();
    }
  }, [userId]);

  const filteredAppointments = useMemo(
    () => appointments.filter((appointment) => matchesSearch(appointment, searchTerm)),
    [appointments, searchTerm]
  );

  const upcomingAppointments = useMemo(
    () =>
      filteredAppointments.filter(
        (appointment) => (appointment.status || "").toUpperCase() === "UPCOMING"
      ),
    [filteredAppointments]
  );

  const pastAppointments = useMemo(
    () =>
      filteredAppointments.filter((appointment) =>
        ["PAST", "CANCELLED", "COMPLETED"].includes((appointment.status || "").toUpperCase())
      ),
    [filteredAppointments]
  );

  const latestUpcomingAppointment =
    upcomingAppointments.length > 0 ? upcomingAppointments[0] : null;

  const openUpdateModal = (appointment) => {
    const doctorName = appointment.doctor || "";
    const validTime =
      DOCTOR_TIME_MAP[doctorName] ||
      appointment.timeSlot ||
      appointment.time_slot ||
      "";

    setSelectedAppointment(appointment);
    setUpdateForm({
      petName: appointment.pet?.name || "",
      petType: appointment.pet?.species || "",
      appointmentType: appointment.appointmentType || appointment.appointment_type || "",
      date: appointment.date || "",
      time: validTime,
      doctor: doctorName,
      notes: appointment.notes || "",
      petId: appointment.pet?.petId || appointment.pet?.id || "",
      price: appointment.price || 0,
    });
    dismissNotification();
    setShowUpdateModal(true);
  };

  const closeUpdateModal = () => {
    setShowUpdateModal(false);
    setSelectedAppointment(null);
    setUpdateForm(INITIAL_UPDATE_FORM);
    dismissNotification();
  };

  const handleUpdateInputChange = (e) => {
    const { name, value } = e.target;

    setUpdateForm((prev) => {
      const next = { ...prev, [name]: value };

      if (name === "appointmentType") {
        next.price = APPOINTMENT_PRICES[value] || 0;
      }

      if (name === "doctor") {
        next.time = DOCTOR_TIME_MAP[value] || "";
      }

      return next;
    });
  };

  const confirmUpdate = async (e) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    if (updateForm.date < today) {
      showNotification("You cannot update an appointment to a past date.");
      return;
    }

    if (updateForm.time !== DOCTOR_TIME_MAP[updateForm.doctor]) {
      showNotification("Selected doctor is only available at their assigned time slot.");
      return;
    }

    try {
      const payload = {
        userId,
        petId: Number(updateForm.petId),
        appointmentType: updateForm.appointmentType,
        doctor: updateForm.doctor,
        date: updateForm.date,
        timeSlot: updateForm.time,
        price: Number(updateForm.price),
        notes: updateForm.notes,
      };

      const res = await axios.put(
        `http://localhost:8083/api/appointments/${selectedAppointment.id}`,
        payload
      );

      setAppointments((prev) =>
        prev.map((appt) =>
          appt.id === selectedAppointment.id ? { ...res.data } : appt
        )
      );

      closeUpdateModal();
      setShowSuccessModal(true);
    } catch (error) {
      showNotification(
        "Update failed: " + (error.response?.data?.message || "Please try again.")
      );
    }
  };

  const openCancelModal = () => {
    setCancelForm({
      appointmentId: upcomingAppointments.length > 0 ? upcomingAppointments[0].id : "",
      reason: "",
    });
    setShowCancelModal(true);
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setCancelForm(INITIAL_CANCEL_FORM);
    dismissNotification();
  };

  const handleCancelInputChange = (e) => {
    const { name, value } = e.target;
    setCancelForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const confirmCancel = async (e) => {
    e.preventDefault();

    try {
      const appointmentId = Number(cancelForm.appointmentId);

      const res = await axios.patch(
        `http://localhost:8083/api/appointments/${appointmentId}/cancel`,
        {
          reason: cancelForm.reason,
        }
      );

      setAppointments((prev) =>
        prev.map((appt) =>
          appt.id === appointmentId ? { ...res.data } : appt
        )
      );

      closeCancelModal();
      setShowCancelSuccessModal(true);
    } catch (error) {
      showNotification(
        "Cancel failed: " + (error.response?.data?.message || "Please try again.")
      );
    }
  };

  return (
    <div className="dashboard-layout">
      <OwnerSidebar
        activeTab="my-appointments"
        user={buildUserData({ fullName, email, initials })}
      />

      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <div className="topbar-breadcrumb">
            <span className="breadcrumb-home">Dashboard</span>
            <span className="breadcrumb-sep">›</span>
            <span className="breadcrumb-current">My Appointments</span>
          </div>

          <div className="topbar-right">
            <div className="topbar-user-section">
              <span className="topbar-greeting">
                Welcome, <strong>{fullName}</strong>
              </span>
              <div className="topbar-avatar" title="Profile">
                {initials}
              </div>
            </div>
          </div>
        </header>

        <main className="dashboard-content">
          <div className="appointments-header">
            <h1>My Appointments</h1>
            <button className="top-cancel-btn" onClick={openCancelModal}>
              Cancel Appointments
            </button>
          </div>

          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Search appointment by pet, type, doctor or keyword..."
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
                    <AppointmentDetails
                      appointment={latestUpcomingAppointment}
                      showUpdatedTag={true}
                    />
                  </div>
                </div>
              )}

              <div className="appointments-grid">
                <div className="appointment-section">
                  <h2>Past Appointments</h2>

                  {pastAppointments.length === 0 ? (
                    <p className="empty-text">No past appointments found.</p>
                  ) : (
                    pastAppointments.map((appointment) => (
                      <div className="appointment-box" key={appointment.id}>
                        <AppointmentDetails appointment={appointment} />
                      </div>
                    ))
                  )}
                </div>

                <div className="appointment-section">
                  <h2>Upcoming Appointments</h2>

                  {upcomingAppointments.length === 0 ? (
                    <p className="empty-text">No upcoming appointments found.</p>
                  ) : (
                    upcomingAppointments.map((appointment) => (
                      <div className="appointment-box" key={appointment.id}>
                        <AppointmentDetails
                          appointment={appointment}
                          showUpdatedTag={true}
                        />

                        <button
                          className="cancel-btn"
                          onClick={() => openUpdateModal(appointment)}
                        >
                          Update Appointment
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </main>

        {showUpdateModal && (
          <div className="modal-overlay" onClick={closeUpdateModal}>
            <div className="update-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Update Appointment</h2>
                <button className="close-btn" onClick={closeUpdateModal}>
                  ×
                </button>
              </div>
              {notification && (
                <InlineNotification
                  type={notification.type}
                  message={notification.message}
                  onClose={dismissNotification}
                />
              )}

              <form className="update-form" onSubmit={confirmUpdate}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Pet Name</label>
                    <input type="text" value={updateForm.petName} readOnly />
                  </div>

                  <div className="form-group">
                    <label>Pet Type</label>
                    <input type="text" value={updateForm.petType} readOnly />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Appointment Type</label>
                    <select
                      name="appointmentType"
                      value={updateForm.appointmentType}
                      onChange={handleUpdateInputChange}
                    >
                      {APPOINTMENT_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Doctor</label>
                    <select
                      name="doctor"
                      value={updateForm.doctor}
                      onChange={handleUpdateInputChange}
                    >
                      {DOCTORS.map((doctor) => (
                        <option key={doctor} value={doctor}>
                          {doctor}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Date</label>
                    <input
                      type="date"
                      name="date"
                      value={updateForm.date}
                      min={today}
                      onChange={(e) => {
                        if (e.target.value < today) {
                          showNotification("You cannot select a past date.");
                          return;
                        }
                        handleUpdateInputChange(e);
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label>Time</label>
                    <select name="time" value={updateForm.time} disabled>
                      <option value={DOCTOR_TIME_MAP[updateForm.doctor] || ""}>
                        {DOCTOR_TIME_MAP[updateForm.doctor] || "Select doctor first"}
                      </option>
                    </select>
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>Notes</label>
                  <textarea
                    name="notes"
                    rows="4"
                    value={updateForm.notes}
                    onChange={handleUpdateInputChange}
                  />
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={closeUpdateModal}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="primary-btn">
                    Confirm Update
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showCancelModal && (
          <div className="modal-overlay" onClick={closeCancelModal}>
            <div className="update-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Cancel Appointment</h2>
                <button className="close-btn" onClick={closeCancelModal}>
                  ×
                </button>
              </div>
              {notification && (
                <InlineNotification
                  type={notification.type}
                  message={notification.message}
                  onClose={dismissNotification}
                />
              )}

              <form className="update-form" onSubmit={confirmCancel}>
                <div className="form-group full-width">
                  <label>Select Appointment</label>
                  <select
                    name="appointmentId"
                    value={cancelForm.appointmentId}
                    onChange={handleCancelInputChange}
                  >
                    {upcomingAppointments.length === 0 ? (
                      <option value="">No upcoming appointments</option>
                    ) : (
                      upcomingAppointments.map((appointment) => (
                        <option key={appointment.id} value={appointment.id}>
                          {appointment.pet?.name} -{" "}
                          {appointment.appointmentType || appointment.appointment_type} -{" "}
                          {appointment.date} -{" "}
                          {appointment.timeSlot || appointment.time_slot}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div className="form-group full-width">
                  <label>Reason for cancellation</label>
                  <textarea
                    name="reason"
                    rows="4"
                    value={cancelForm.reason}
                    onChange={handleCancelInputChange}
                    placeholder="Enter cancellation reason"
                  />
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={closeCancelModal}
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="primary-btn"
                    disabled={upcomingAppointments.length === 0}
                  >
                    Confirm Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showSuccessModal && (
          <SuccessModal onClose={() => setShowSuccessModal(false)} />
        )}

        {showCancelSuccessModal && (
          <CancelSuccessModal onClose={() => setShowCancelSuccessModal(false)} />
        )}
      </div>
    </div>
  );
};

export default MyAppointments;