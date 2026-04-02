import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";

import CartTopbar from "../components/CartTopbar";
import CartStepper from "../components/CartStepper";
import CartItemRow from "../components/CartItemRow";
import CartSummary from "../components/CartSummary";

import "../styles/Cart.css";
import "../styles/variables.css";

export default function Cart() {
  const navigate = useNavigate();
  const { cart, loading, error, inc, dec, remove } = useCart();

  const isEmpty = !cart.items || cart.items.length === 0;

  return (
    <div className="cart-page">
      <CartTopbar onDashboard={() => navigate("/dashboard")} onCancel={() => navigate("/dashboard")} />
      <CartStepper />

      <div className="cart-shell">
        <div className="cart-card">
          <h2 className="cart-title">Your Cart</h2>

          {error && <div className="cart-error">{error}</div>}

          {loading ? (
            <div className="cart-loading">
              <div className="spinner" />
              <p>Loading cart...</p>
            </div>
          ) : isEmpty ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">🛒</div>
              <h3>Your cart is empty</h3>
              <p>Add products to your cart to continue checkout.</p>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cart.items.map((item) => (
                  <CartItemRow key={item.productId} item={item} onInc={inc} onDec={dec} onRemove={remove} />
                ))}
              </div>

              <CartSummary subTotal={cart.subTotal} shipping={cart.shipping} total={cart.total} />

              <button className="cart-primary" onClick={() => navigate("/checkout")}>
                Continue to Payment Information
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
