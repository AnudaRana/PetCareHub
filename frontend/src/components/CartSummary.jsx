import React from "react";
import { formatCurrency } from "../utils/formatters";

export default function CartSummary({ subTotal, shipping, total, feeLabel = "Pickup" }) {
  return (
    <div className="cart-summary">
      <div className="sum-row"><span className="muted">Sub total</span><span>{formatCurrency(subTotal)}</span></div>
      <div className="sum-row"><span className="muted">{feeLabel}</span><span>{formatCurrency(shipping)}</span></div>
      <div className="sum-divider" />
      <div className="sum-row total"><span>Total</span><span className="cyan">{formatCurrency(total)}</span></div>
    </div>
  );
}
