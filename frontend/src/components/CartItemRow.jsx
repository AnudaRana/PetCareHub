import React from "react";
const formatRs = (val) => `Rs ${Number(val || 0).toFixed(0)}`;

export default function CartItemRow({ item, onInc, onDec, onRemove }) {
  return (
    <div className="cart-item">
      <div className="cart-item-img">
        <img
          src={item.imageUrl}
          alt={item.name}
          onError={(e) => {
            e.currentTarget.style.display = "none";
            e.currentTarget.parentElement.classList.add("fallback");
          }}
        />
        <div className="img-fallback">🐶</div>
      </div>

      <div className="cart-item-info">
        <div className="cart-item-name">{item.name}</div>
        <div className="cart-item-price">{formatRs(item.price)}</div>
        <button className="cart-remove" onClick={() => onRemove(item.productId)}>Remove</button>
      </div>

      <div className="cart-qty">
        <button className="qty-btn" disabled={item.quantity <= 1} onClick={() => onDec(item.productId, item.quantity)}>
          –
        </button>
        <div className="qty-val">{item.quantity}</div>
        <button className="qty-btn" onClick={() => onInc(item.productId, item.quantity)}>+</button>
      </div>
    </div>
  );
}
