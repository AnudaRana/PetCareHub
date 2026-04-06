import React from "react";
import { formatRs } from "../utils/currency";

export default function CartItemRow({ item, onInc, onDec, onRemove, readOnly = false }) {
  return (
    <div className="cart-item">
      <div className={`cart-item-img ${!item.imageUrl ? "fallback" : ""}`}>
        {item.imageUrl && (
          <img
            src={item.imageUrl}
            alt={item.name || item.productName}
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.parentElement.classList.add("fallback");
            }}
          />
        )}
        <div className="img-fallback">🐾</div>
      </div>

      <div className="cart-item-info">
        <div className="cart-item-name">{item.name || item.productName}</div>
        <div className="cart-item-price">{formatRs(item.price || item.unitPrice)}</div>
        {!readOnly && (
          <button className="cart-remove" onClick={() => onRemove(item.productId)}>Remove</button>
        )}
      </div>

      <div className="cart-qty">
        {readOnly ? (
          <div className="qty-pill">Qty {item.quantity}</div>
        ) : (
          <>
            <button className="qty-btn" disabled={item.quantity <= 1} onClick={() => onDec(item.productId, item.quantity)}>
              –
            </button>
            <div className="qty-val">{item.quantity}</div>
            <button className="qty-btn" onClick={() => onInc(item.productId, item.quantity)}>+</button>
          </>
        )}
      </div>
    </div>
  );
}
