import React from "react";
import CartSummary from "./CartSummary";
import { formatCurrency, formatDate, formatTime } from "../utils/formatters";

export default function OrderSummaryPanel({
  title,
  items = [],
  totals,
  selectedPet,
  pickupDate,
  pickupTime,
  pickupLocation,
  emptyMessage = "No items available."
}) {
  return (
    <div className="checkout-summary-card">
      <h2 className="cart-title">{title}</h2>

      {(selectedPet || pickupDate || pickupLocation) && (
        <div className="summary-detail-block">
          {selectedPet && (
            <div className="summary-detail-row">
              <span>Pet</span>
              <strong>{selectedPet}</strong>
            </div>
          )}
          {pickupDate && (
            <div className="summary-detail-row">
              <span>Pickup</span>
              <strong>
                {formatDate(pickupDate)} {pickupTime ? `• ${formatTime(pickupTime)}` : ""}
              </strong>
            </div>
          )}
          {pickupLocation && (
            <div className="summary-detail-row">
              <span>Location</span>
              <strong>{pickupLocation}</strong>
            </div>
          )}
        </div>
      )}

      <div className="summary-item-list compact">
        {items.length === 0 ? (
          <div className="summary-empty">{emptyMessage}</div>
        ) : (
          items.map((item) => (
            <div className="summary-item" key={`summary-${item.productId}`}>
              <div>
                <div className="summary-item-name">{item.name || item.productName}</div>
                <div className="summary-item-meta">Qty {item.quantity}</div>
              </div>
              <strong>{formatCurrency(item.lineTotal || (item.price || item.unitPrice) * item.quantity)}</strong>
            </div>
          ))
        )}
      </div>

      <CartSummary
        subTotal={totals.subTotal}
        shipping={totals.shipping ?? totals.pickupFee}
        total={totals.total ?? totals.totalAmount}
      />
    </div>
  );
}
