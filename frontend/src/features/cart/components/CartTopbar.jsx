import React from "react";

export default function CartTopbar({ onDashboard, onCancel, showCancel = true }) {
  return (
    <div className="cart-topbar">
      <div className="cart-logo">
        <img src="/images/logo/Logo.jpeg" alt="PetCareHub Logo" className="cart-logo-img" />
      </div>
      <div className="cart-topbar-actions">
        <button className="cart-topbar-btn" onClick={onDashboard}>Go to Dashboard</button>
        {showCancel && (
          <button className="cart-topbar-btn danger" onClick={onCancel}>Cancel Order</button>
        )}
      </div>
    </div>
  );
}
