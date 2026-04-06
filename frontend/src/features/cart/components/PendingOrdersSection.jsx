import React from "react";
import { formatRs } from "../utils/currency";

export default function PendingOrdersSection({ orders, onContinue, onCancel }) {
  if (!orders.length) {
    return null;
  }

  return (
    <div className="pending-orders-card">
      <div className="section-heading">
        <h3>Orders awaiting payment</h3>
        <p>Complete payment later without rebuilding your cart.</p>
      </div>

      <div className="pending-orders-list">
        {orders.map((order) => (
          <div key={order.orderId} className="pending-order-item">
            <div>
              <div className="pending-order-number">{order.orderNumber}</div>
              <div className="pending-order-meta">
                <span>Pet: {order.petName}</span>
                <span>Pickup: {order.pickupDate}</span>
              </div>
            </div>
            <div className="pending-order-right">
              <strong>{formatRs(order.total)}</strong>
              <div className="pending-order-actions">
                <button className="secondary-pill-btn" onClick={() => onContinue(order.orderId)}>
                  Continue Payment
                </button>
                <button className="cart-topbar-btn danger small-btn" onClick={() => onCancel(order.orderId)}>
                  Cancel Order
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
