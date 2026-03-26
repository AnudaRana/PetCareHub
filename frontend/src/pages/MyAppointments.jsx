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

const APPOINTMENT_TYPES = ["Checkup", "Vaccination", "Operation"];
const DOCTORS = ["Dr. Silva", "Dr. Nimal Perera", "Dr. Fernando"];
const TIMES = ["09:00 AM", "11:00 AM", "02:00 PM"];

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

const AppointmentDetails = ({ appointment, showUpdatedTag = false }) => {
  const status = (appointment.status || "").toUpperCase();
  const cancelledBy = (appointment.cancelledBy || "").toUpperCase();

  return (
    <>
      <p>
        <strong>Pet:</strong> {appointment.pet?.name || appointment.petName || "N/A"} ({appointment.pet?.species || appointment.petSpecies || "N/A"})
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
        <span className={status === "CANCELLED" ? "status-cancelled" : ""}>
          {appointment.status}
        </span>
        {showUpdatedTag && appointment.updated && (
          <span className="updated-tag">Updated</span>
        )}
      </p>

      {status === "CANCELLED" && (
        <div className="cancel-info-box">
          <p className="cancel-info-text">
            {cancelledBy === "VET"
              ? "This appointment was cancelled by the veterinarian."
              : cancelledBy === "OWNER"
              ? "You cancelled this appointment."
              : "This appointment was cancelled."}
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
  const [cancelError, setCancelError] = useState("");
  const [updateError, setUpdateError] = useState("");

  const fetchAppointments = async () => {
    try {
      setLoading(true);

      console.log("Current userId:", userId);

      const res = await axios.get(`http://localhost:8081/api/appointments/user/${userId}`);

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
    console.log("Opening update modal for appointment:", appointment);
    setSelectedAppointment(appointment);
    setUpdateForm({
      petName: appointment.pet?.name || appointment.petName || "",
      petType: appointment.pet?.species || appointment.petSpecies || "",
      appointmentType: appointment.appointmentType || appointment.appointment_type || "",
      date: appointment.date || "",
      time: appointment.timeSlot || appointment.time_slot || "",
      doctor: appointment.doctor || "",
      notes: appointment.notes || "",
      petId: appointment.pet?.petId || appointment.pet?.id || appointment.petId || "",
      price: appointment.price || 0,
    });
    setShowUpdateModal(true);
  };

  const closeUpdateModal = () => {
    setShowUpdateModal(false);
    setSelectedAppointment(null);
    setUpdateForm(INITIAL_UPDATE_FORM);
    setUpdateError("");
  };

  const DOCTOR_TIME_MAP = {
    "Dr. Silva": "09:00 AM",
    "Dr. Nimal Perera": "11:00 AM",
    "Dr. Fernando": "02:00 PM",
  };

  const handleUpdateInputChange = (e) => {
    const { name, value } = e.target;

    setUpdateForm((prev) => {
      const next = { ...prev, [name]: value };

      if (name === "appointmentType") {
        next.price = APPOINTMENT_PRICES[value] || 0;
      }

      if (name === "doctor" && DOCTOR_TIME_MAP[value]) {
        next.time = DOCTOR_TIME_MAP[value];
      }

      return next;
    });
  };

  const confirmUpdate = async (e) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    if (updateForm.date < today) {
      setUpdateError("You cannot update an appointment to a past date.");
      return;
    }

    setUpdateError("");

    try {
      const payload = {
        userId,
        vetId: selectedAppointment?.vet?.userId || selectedAppointment?.vetId || null,
        petId: updateForm.petId ? Number(updateForm.petId) : null,
        appointmentType: updateForm.appointmentType,
        doctor: updateForm.doctor,
        date: updateForm.date,
        timeSlot: updateForm.time,
        price: Number(updateForm.price),
        notes: updateForm.notes,
      };

      const res = await axios.put(
        `http://localhost:8081/api/appointments/${selectedAppointment.id}`,
        payload
      );

      setAppointments((prev) =>
        prev.map((appt) =>
          appt.id === selectedAppointment.id ? res.data : appt
        )
      );

      closeUpdateModal();
      setShowSuccessModal(true);
    } catch (error) {
      setUpdateError(error.response?.data?.message || "Please try again.");
    }
  };

  const openCancelModal = () => {
    setCancelForm({
      appointmentId: upcomingAppointments.length > 0 ? upcomingAppointments[0].id : "",
      reason: "",
    });
    setCancelError("");
    setShowCancelModal(true);
  };

  const closeCancelModal = () => {
    setShowCancelModal(false);
    setCancelForm(INITIAL_CANCEL_FORM);
    setCancelError("");
  };

  const handleCancelInputChange = (e) => {
    const { name, value } = e.target;
    setCancelForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    setCancelError("");
  };

  const confirmCancel = async (e) => {
    e.preventDefault();

    try {
      const appointmentId = Number(cancelForm.appointmentId);

      const res = await axios.patch(
        `http://localhost:8081/api/appointments/${appointmentId}/cancel`,
        {
          reason: cancelForm.reason,
        }
      );

      setAppointments((prev) =>
        prev.map((appt) =>
          appt.id === appointmentId ? res.data : appt
        )
      );

      closeCancelModal();
      setShowCancelSuccessModal(true);
    } catch (error) {
      setCancelError(
        error.response?.data?.message || "Cancellation failed. Please try again."
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
                          setUpdateError("You cannot select a past date.");
                          return;
                        }
                        setUpdateError("");
                        handleUpdateInputChange(e);
                      }}
                    />
                  </div>

                  <div className="form-group">
                    <label>Time</label>
                    <select
                      name="time"
                      value={updateForm.time}
                      onChange={handleUpdateInputChange}
                    >
                      {TIMES.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
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

                {updateError && (
                  <div className="error-box">
                    {updateError}
                  </div>
                )}

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
                          {appointment.pet?.name || appointment.petName || "Unknown Pet"} -{" "}
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

                {cancelError && (
                  <div className="error-box">
                    {cancelError}
                  </div>
                )}

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