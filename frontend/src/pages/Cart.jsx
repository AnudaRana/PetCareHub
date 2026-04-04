import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { usePendingOrders } from "../hooks/usePendingOrders";

import CartTopbar from "../components/CartTopbar";
import CheckoutStepper from "../components/CheckoutStepper";
import CartItemRow from "../components/CartItemRow";
import CartSummary from "../components/CartSummary";
import PendingOrderCard from "../components/PendingOrderCard";

import "../styles/Cart.css";
import "../styles/variables.css";

export default function Cart() {
  const navigate = useNavigate();
  const { cart, loading, error, inc, dec, remove } = useCart();
  const {
    orders: pendingOrders,
    loading: pendingLoading,
    error: pendingError
  } = usePendingOrders();

  const isEmpty = !cart.items || cart.items.length === 0;

  return (
    <div className="cart-page">
      <CartTopbar onDashboard={() => navigate("/dashboard")} onCancel={() => navigate("/dashboard")} />
      <CheckoutStepper currentStep={1} />

      <div className="cart-shell">
        <div className="cart-card">
          <div className="section-kicker">Stage 1</div>
          <h2 className="cart-title">Your Cart</h2>
          <p className="section-copy">Review the products in your cart before adding pickup and pet details.</p>

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
              <p>Add products to your cart to start a pickup order.</p>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cart.items.map((item) => (
                  <CartItemRow key={item.productId} item={item} onInc={inc} onDec={dec} onRemove={remove} />
                ))}
              </div>

              <CartSummary subTotal={cart.subTotal} shipping={cart.shipping} total={cart.total} />

              <button className="cart-primary" onClick={() => navigate("/checkout/order-details")}>
                Continue to Payment Information
              </button>
            </>
          )}
        </div>

        <section className="cart-card pending-orders-section">
          <div className="section-kicker">Resume Later</div>
          <h2 className="cart-title">Orders Awaiting Payment</h2>
          <p className="section-copy">
            If you already moved an order to checkout, you can return here later and continue with payment.
          </p>

          {pendingError && <div className="cart-error">{pendingError}</div>}

          {pendingLoading ? (
            <div className="cart-loading compact-loading">
              <div className="spinner" />
              <p>Loading pending orders...</p>
            </div>
          ) : pendingOrders.length === 0 ? (
            <div className="pending-order-empty">
              <h3>No pending payment orders</h3>
              <p>Orders you save from the next step will appear here until payment is completed.</p>
            </div>
          ) : (
            <div className="pending-orders-list">
              {pendingOrders.map((order) => (
                <PendingOrderCard
                  key={order.orderId}
                  order={order}
                  onContinuePayment={(orderId) => navigate(`/checkout/payment/${orderId}`)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
