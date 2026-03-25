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

  useEffect(() => {
    if (!userId) return;

    axios
      .get(`http://localhost:8083/api/appointments/vet/${userId}`)
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
      `http://localhost:8083/api/appointments/vet/${userId}`
    );
    setAppointments(res.data || []);
  };

  const getStatusClass = (status) => {
    if (status === "CANCELLED") return "status-badge status-cancelled";
    if (status === "UPDATED") return "status-badge status-updated";
    return "status-badge status-upcoming";
  };

  const handleCancel = async () => {
    if (!cancelReason) {
      alert("Please enter a cancellation reason");
      return;
    }

    try {
      await axios.patch(
        `http://localhost:8083/api/appointments/${selectedAppointment.id}/cancel-by-vet`,
        {
          vetId: userId,
          reason: cancelReason,
        }
      );

      await refreshAppointments();

      setSelectedAppointment(null);
      setCancelReason("");
    } catch (error) {
      alert(
        error.response?.data?.message || "Failed to cancel appointment"
      );
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

                    {/* ✅ Show cancellation info */}
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

                  {/* ✅ Cancel button */}
                  <button
                    className="confirm-btn"
                    disabled={a.status === "CANCELLED"}
                    onClick={() => setSelectedAppointment(a)}
                  >
                    Cancel Appointment
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ✅ Cancel Modal */}
      {selectedAppointment && (
        <div className="success-modal-overlay">
          <div className="success-modal">
            <h3>Cancel Appointment</h3>

            <textarea
              placeholder="Enter cancellation reason"
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              style={{ width: "100%", marginBottom: "15px" }}
            />

            <button className="confirm-btn" onClick={handleCancel}>
              Confirm Cancel
            </button>

            <button
              className="confirm-btn"
              style={{ marginTop: "10px", background: "#ccc", color: "#000" }}
              onClick={() => {
                setSelectedAppointment(null);
                setCancelReason("");
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VetAppointments;