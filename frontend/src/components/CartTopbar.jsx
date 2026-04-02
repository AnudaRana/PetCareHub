import React from "react";

export default function CartTopbar({ onDashboard, onCancel }) {
  return (
    <div className="cart-topbar">
      <div className="cart-logo">🐾 PetCareHub</div>
      <div className="cart-topbar-actions">
        <button className="cart-topbar-btn" onClick={onDashboard}>Go to Dashboard</button>
        <button className="cart-topbar-btn danger" onClick={onCancel}>Cancel Order</button>
      </div>
    </div>
  );
}
