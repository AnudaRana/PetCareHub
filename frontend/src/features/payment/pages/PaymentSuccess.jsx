import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { confirmPayment } from "../../../services/paymentService";
import "./PaymentResultPages.css";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const sessionId = searchParams.get("session_id");
  const paymentType = searchParams.get("type"); // e.g. "ORDER" or "APPOINTMENT"

  const [confirming, setConfirming] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const runConfirmation = async () => {
      if (!sessionId) {
        setError("Missing payment session reference.");
        setConfirming(false);
        return;
      }

      try {
        await confirmPayment(sessionId);
        setConfirmed(true);
        // Clear draft appointment data on success
        sessionStorage.removeItem("draftAppointment");
        sessionStorage.removeItem("draftAppointment_vetId");
      } catch (err) {
        console.error("Payment confirmation failed:", err);
        const backendMessage =
          err?.response?.data?.message ||
          err?.response?.data ||
          err?.message ||
          "Payment was successful, but confirmation failed.";
        setError(backendMessage);
      } finally {
        setConfirming(false);
      }
    };

    runConfirmation();
  }, [sessionId]);

  return (
    <div className="prp-page">
      <div className="prp-orb prp-orb--green prp-orb--1" />
      <div className="prp-orb prp-orb--green prp-orb--2" />

      <div className="prp-card prp-card--success">
        <div className="prp-icon-wrapper prp-icon-wrapper--success">
          <svg className="prp-checkmark" viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg">
            <circle className="prp-checkmark__circle" cx="26" cy="26" r="25" fill="none" />
            <path className="prp-checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
          </svg>
        </div>

        <h1 className="prp-title">
          {confirming ? "Confirming Payment..." : confirmed ? "Payment Successful!" : "Payment Completed"}
        </h1>

        <p className="prp-subtitle">
          {confirming && `Please wait while we verify and update your ${paymentType === 'ORDER' ? 'order' : 'appointment'} payment status.`}
          {!confirming && confirmed && `Your ${paymentType === 'ORDER' ? 'order' : 'appointment'} payment has been processed successfully and marked as PAID.`}
          {!confirming && error && error}
        </p>

        {sessionId && (
          <div className="prp-reference">
            <span className="prp-reference__label">Reference ID</span>
            <span className="prp-reference__value">{sessionId.slice(-12).toUpperCase()}</span>
          </div>
        )}

        <div className="prp-details-grid">
          <div className="prp-detail-item">
            <span className="prp-detail-icon">{paymentType === 'ORDER' ? '🛍️' : '📅'}</span>
            <span className="prp-detail-text">
              {paymentType === 'ORDER' ? 'Order payment recorded' : 'Appointment payment recorded'}
            </span>
          </div>
          <div className="prp-detail-item">
            <span className="prp-detail-icon">💳</span>
            <span className="prp-detail-text">Payment status updated to PAID</span>
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

          {paymentType === 'ORDER' ? (
            <button className="prp-btn prp-btn--secondary" onClick={() => navigate("/store")}>
              Go to Shop
            </button>
          ) : (
            <button className="prp-btn prp-btn--secondary" onClick={() => navigate("/dashboard/my-appointments")}>
              View Appointments
            </button>
          )}
        </div>
      </div>
    </div>
  );
}