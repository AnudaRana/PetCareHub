import React from "react";
import { formatRs } from "../utils/currency";

export default function CartSummary({ subTotal, shipping, total, shippingLabel = "Pickup", hideShipping = false }) {
  return (
    <div className="cart-summary">
      <div className="sum-row"><span className="muted">Sub total</span><span>{formatRs(subTotal)}</span></div>
      {!hideShipping && (
        <div className="sum-row"><span className="muted">{shippingLabel}</span><span>{formatRs(shipping)}</span></div>
      )}
      <div className="sum-divider" />
      <div className="sum-row total"><span>Total</span><span className="cyan">{formatRs(total)}</span></div>
    </div>
  );
}
