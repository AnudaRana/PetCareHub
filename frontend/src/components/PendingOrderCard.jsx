import React from "react";
import { formatCurrency, formatDate, formatDateTime, formatTime } from "../utils/formatters";

export default function PendingOrderCard({ order, onContinuePayment }) {
  return (
    <article className="pending-order-card">
      <div className="pending-order-header">
        <div>
          <div className="pending-order-number">{order.orderNumber}</div>
          <div className="pending-order-meta">Created {formatDateTime(order.createdAt)}</div>
        </div>
        <span className="status-badge warning">Payment Pending</span>
      </div>

      <div className="pending-order-grid">
        <div>
          <span className="pending-label">Pet</span>
          <strong>{order.petName}</strong>
        </div>
        <div>
          <span className="pending-label">Pickup date</span>
          <strong>{formatDate(order.pickupDate)}</strong>
        </div>
        <div>
          <span className="pending-label">Pickup time</span>
          <strong>{formatTime(order.pickupTime)}</strong>
        </div>
        <div>
          <span className="pending-label">Total</span>
          <strong>{formatCurrency(order.totalAmount)}</strong>
        </div>
      </div>

      <div className="pending-order-items">
        {order.items?.map((item) => (
          <div className="pending-order-item" key={`${order.orderId}-${item.productId}`}>
            <span>{item.productName}</span>
            <span>x{item.quantity}</span>
          </div>
        ))}
      </div>

      {order.notes && <p className="pending-order-notes">Note: {order.notes}</p>}

      <button className="cart-secondary" onClick={() => onContinuePayment(order.orderId)}>
        Complete Payment
      </button>
    </article>
  );
}
