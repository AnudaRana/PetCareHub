import React, { useEffect, useState } from "react";
import axios from "axios";
import useCurrentUser from "../hooks/useCurrentUser";
import DoctorSidebar from "../components/doctor/DoctorSidebar";
import "../styles/VetAppointments.css";
import { useNavigate } from "react-router-dom";

const VetAppointments = () => {
  const { userId } = useCurrentUser();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelError, setCancelError] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (!userId) return;

    axios
      .get(`http://localhost:8081/api/appointments/vet/${userId}`)
      .then((res) => {
        setAppointments(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load vet appointments:", err);
        setLoading(false);
      });
  }, [userId]);

  const refreshAppointments = async () => {
    const res = await axios.get(
      `http://localhost:8081/api/appointments/vet/${userId}`
    );
    setAppointments(res.data || []);
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
        `http://localhost:8081/api/appointments/${selectedAppointment.id}/cancel-by-vet`,
        {
          vetId: userId,
          reason: trimmedReason,
        }
      );

      await refreshAppointments();
      closeCancelModal();
    } catch (error) {
      setCancelError(
        error.response?.data?.message || "Failed to cancel appointment."
      );
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="vet-appointments-page">
      <DoctorSidebar
        activeTab="appointments"
        onTabChange={(tab) => {
          if (tab === "home") {
            navigate("/doctor-dashboard");
          } else if (tab === "all-pets") {
            navigate("/doctor-dashboard", { state: { tab: "all-pets" } });
          }
        }}
        doctor={{
          fullName: localStorage.getItem("fullName") || "Doctor",
          email: localStorage.getItem("email") || "doctor@petcarehub.com",
          initials:
            (localStorage.getItem("fullName") || "Doctor")
              .split(" ")
              .map((name) => name[0])
              .join("")
              .toUpperCase()
              .slice(0, 2),
        }}
      />

      <div className="vet-appointments-content">
        <div className="vet-appointments-header">
          <h1>My Appointments</h1>
          <p>View appointments assigned to you</p>
        </div>

        <div className="vet-appointments-card">
          <div className="vet-appointments-card-header">
            <h2 className="section-title">Assigned Appointments</h2>
          </div>

          {loading ? (
            <div className="vet-appointments-loading">
              Loading appointments...
            </div>
          ) : appointments.length === 0 ? (
            <div className="vet-appointments-empty">
              No appointments found.
            </div>
          ) : (
            <div className="vet-appointments-grid">
              {appointments.map((a) => (
                <div key={a.id} className="vet-appointment-item">
                  <h3>
                    {a.pet?.name} ({a.pet?.species})
                  </h3>

                  <div className="vet-appointment-details">
                    <p>
                      <strong>Appointment Type:</strong> {a.appointmentType}
                    </p>
                    <p>
                      <strong>Date:</strong> {a.date}
                    </p>
                    <p>
                      <strong>Time:</strong> {a.timeSlot}
                    </p>
                    <p>
                      <strong>Owner:</strong> {a.owner?.firstName}{" "}
                      {a.owner?.lastName}
                    </p>
                    <p>
                      <strong>Notes:</strong> {a.notes || "None"}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <span className={getStatusClass(a.status)}>
                        {a.status}
                      </span>
                    </p>

                    {a.status === "CANCELLED" && (
                      <>
                        <p>
                          <strong>Cancelled By:</strong> {a.cancelledBy}
                        </p>
                        <p>
                          <strong>Reason:</strong>{" "}
                          {a.cancellationReason || "No reason provided"}
                        </p>
                      </>
                    )}
                  </div>

                  <button
                    className="confirm-btn"
                    disabled={a.status === "CANCELLED"}
                    onClick={() => openCancelModal(a)}
                    type="button"
                  >
                    Cancel Appointment
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedAppointment && (
        <div className="success-modal-overlay">
          <div className="success-modal vet-cancel-modal">
            <h3>Cancel Appointment</h3>
            <p className="vet-cancel-modal-subtitle">
              Please provide a reason for cancelling this appointment.
            </p>

            <div className="vet-cancel-form-group">
              <label htmlFor="cancelReason" className="vet-cancel-label">
                Cancellation Reason
              </label>
              <textarea
                id="cancelReason"
                className="vet-cancel-textarea"
                placeholder="Enter the reason for cancellation"
                value={cancelReason}
                onChange={(e) => {
                  setCancelReason(e.target.value);
                  if (cancelError) setCancelError("");
                }}
                rows={5}
              />
            </div>

            {cancelError && (
              <div className="vet-cancel-error-message">{cancelError}</div>
            )}

            <div className="vet-cancel-modal-actions">
              <button
                className="confirm-btn vet-cancel-confirm-btn"
                onClick={handleCancel}
                type="button"
                disabled={isCancelling}
              >
                {isCancelling ? "Cancelling..." : "Confirm Cancel"}
              </button>

              <button
                className="vet-cancel-close-btn"
                onClick={closeCancelModal}
                type="button"
                disabled={isCancelling}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VetAppointments;