import React from "react";
import { useNavigate } from "react-router-dom";
import "./PaymentResultPages.css";

export default function PaymentCancel() {
  const navigate = useNavigate();

  return (
    <div className="prp-page">
      {/* Animated background orbs */}
      <div className="prp-orb prp-orb--red prp-orb--1" />
      <div className="prp-orb prp-orb--red prp-orb--2" />

      <div className="prp-card prp-card--cancel">
        {/* Animated X icon */}
        <div className="prp-icon-wrapper prp-icon-wrapper--cancel">
          <svg className="prp-crossmark" viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg">
            <circle className="prp-crossmark__circle" cx="26" cy="26" r="25" fill="none" />
            <path className="prp-crossmark__cross" fill="none" d="M16 16 36 36 M36 16 16 36" />
          </svg>
        </div>

        <h1 className="prp-title prp-title--cancel">Payment Cancelled</h1>
        <p className="prp-subtitle">
          Your payment was not completed. Your appointment has not been confirmed.
          No charges have been made.
        </p>

        <div className="prp-notice">
          <span className="prp-notice__icon">ℹ️</span>
          <p className="prp-notice__text">
            If you experienced an issue, please try again or contact our support team.
            Your session details are still available.
          </p>
        </div>

        <div className="prp-details-grid">
          <div className="prp-detail-item">
            <span className="prp-detail-icon">🚫</span>
            <span className="prp-detail-text">Payment not processed</span>
          </div>
          <div className="prp-detail-item">
            <span className="prp-detail-icon">💳</span>
            <span className="prp-detail-text">No charges applied</span>
          </div>
          <div className="prp-detail-item">
            <span className="prp-detail-icon">🔄</span>
            <span className="prp-detail-text">You can retry anytime</span>
          </div>
        </div>

        <div className="prp-actions">
          <button
            className="prp-btn prp-btn--primary"
            onClick={() => navigate("/dashboard/my-appointments")}
          >
            Try Again
          </button>
          <button
            className="prp-btn prp-btn--secondary"
            onClick={() => navigate("/dashboard")}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
