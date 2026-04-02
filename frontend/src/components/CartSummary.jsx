import React from "react";
const formatRs = (val) => `Rs ${Number(val || 0).toFixed(0)}`;

export default function CartSummary({ subTotal, shipping, total }) {
  return (
    <div className="cart-summary">
      <div className="sum-row"><span className="muted">Sub total</span><span>{formatRs(subTotal)}</span></div>
      <div className="sum-row"><span className="muted">Shipping</span><span>{formatRs(shipping)}</span></div>
      <div className="sum-divider" />
      <div className="sum-row total"><span>Total</span><span className="cyan">{formatRs(total)}</span></div>
    </div>
  );
}
