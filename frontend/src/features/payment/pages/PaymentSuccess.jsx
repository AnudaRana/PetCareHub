import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./PaymentResultPages.css";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [count, setCount] = useState(5);

  // Auto-redirect countdown
  useEffect(() => {
    if (count <= 0) {
      navigate("/dashboard");
      return;
    }
    const timer = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [count, navigate]);

  return (
    <div className="prp-page">
      {/* Animated background orbs */}
      <div className="prp-orb prp-orb--green prp-orb--1" />
      <div className="prp-orb prp-orb--green prp-orb--2" />

      <div className="prp-card prp-card--success">
        {/* Animated checkmark */}
        <div className="prp-icon-wrapper prp-icon-wrapper--success">
          <svg className="prp-checkmark" viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg">
            <circle className="prp-checkmark__circle" cx="26" cy="26" r="25" fill="none" />
            <path className="prp-checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
          </svg>
        </div>

        <h1 className="prp-title">Payment Successful!</h1>
        <p className="prp-subtitle">
          Your appointment payment has been processed successfully.
          You'll receive a confirmation email shortly.
        </p>

        {sessionId && (
          <div className="prp-reference">
            <span className="prp-reference__label">Reference ID</span>
            <span className="prp-reference__value">{sessionId.slice(-12).toUpperCase()}</span>
          </div>
        )}

        <div className="prp-details-grid">
          <div className="prp-detail-item">
            <span className="prp-detail-icon">📅</span>
            <span className="prp-detail-text">Appointment confirmed</span>
          </div>
          <div className="prp-detail-item">
            <span className="prp-detail-icon">📧</span>
            <span className="prp-detail-text">Email notification sent</span>
          </div>
          <div className="prp-detail-item">
            <span className="prp-detail-icon">🔒</span>
            <span className="prp-detail-text">Secure transaction</span>
          </div>
        </div>

        <div className="prp-actions">
          <button className="prp-btn prp-btn--primary" onClick={() => navigate("/dashboard")}>
            Go to Dashboard
          </button>
          <button className="prp-btn prp-btn--secondary" onClick={() => navigate("/dashboard/my-appointments")}>
            View Appointments
          </button>
        </div>

        <p className="prp-redirect">
          Redirecting to dashboard in <strong>{count}s</strong>…
        </p>
      </div>
    </div>
  );
}
