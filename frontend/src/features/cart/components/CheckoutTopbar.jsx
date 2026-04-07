import React from "react";

export default function CheckoutTopbar({ onDashboard, onCancel, showCancel = true }) {
  return (
    <div className="cart-topbar">
      <div className="cart-logo">
        <img src="/images/logo/Logo.jpeg" alt="PetCareHub Logo" className="cart-logo-img" />
      </div>
      <div className="cart-topbar-actions">
        <button className="cart-topbar-btn" type="button" onClick={onDashboard}>Go to Dashboard</button>
        {showCancel && (
          <button className="cart-topbar-btn danger" type="button" onClick={onCancel}>Cancel Order</button>
        )}
      </div>
    </div>
  );
}
