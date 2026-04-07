import React from "react";
import CartItemRow from "./CartItemRow";
import CartSummary from "./CartSummary";

export default function CheckoutOrderSummary({
  title = "Your Cart",
  items = [],
  subTotal = 0,
  shipping = 0,
  total = 0,
  readOnly = true,
  emptyMessage = "No items to show."
}) {
  return (
    <div className="cart-card summary-card">
      <h2 className="cart-title">{title}</h2>

      {items.length === 0 ? (
        <div className="cart-empty compact-empty">
          <div className="cart-empty-icon">📦</div>
          <p>{emptyMessage}</p>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {items.map((item) => (
              <CartItemRow
                key={`${item.productId}-${item.quantity}`}
                item={item}
                readOnly={readOnly}
                onInc={() => {}}
                onDec={() => {}}
                onRemove={() => {}}
              />
            ))}
          </div>
          <CartSummary subTotal={subTotal} shipping={shipping} total={total} shippingLabel="Pickup" />
        </>
      )}
    </div>
  );
}
