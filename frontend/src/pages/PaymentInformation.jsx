import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { orderService } from "../services/orderService";
import { getLoggedInUserId } from "../utils/session";

import CartTopbar from "../components/CartTopbar";
import CheckoutStepper from "../components/CheckoutStepper";
import OrderSummaryPanel from "../components/OrderSummaryPanel";

import "../styles/Cart.css";
import "../styles/variables.css";

export default function PaymentInformation() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const userId = getLoggedInUserId();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOrder = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await orderService.getOrder(userId, orderId);
        setOrder(data);
      } catch (err) {
        console.error("Failed to load order", err);
        setError(err?.response?.data?.message || "Failed to load the saved order.");
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId, userId]);

  return (
    <div className="cart-page">
      <CartTopbar onDashboard={() => navigate("/dashboard")} onCancel={() => navigate("/cart")} />
      <CheckoutStepper currentStep={3} />

      <div className="checkout-shell two-column">
        <div className="checkout-form-card">
          <div className="section-kicker">Stage 3</div>
          <h2 className="checkout-section-title">Payment Information</h2>
          <p className="checkout-section-copy">
            The order has already been created and saved. This page is reserved for payment details, which you asked not
            to implement yet.
          </p>

          {loading ? (
            <div className="cart-loading compact-loading">
              <div className="spinner" />
              <p>Loading order...</p>
            </div>
          ) : error ? (
            <div className="cart-error">{error}</div>
          ) : (
            <>
              <div className="order-saved-banner">
                <strong>Order saved successfully</strong>
                <span>
                  {order.orderNumber} is waiting for payment. You can safely leave now and continue payment later from
                  the cart page.
                </span>
              </div>

              <div className="placeholder-details-card">
                <div className="placeholder-row"><span>Order number</span><strong>{order.orderNumber}</strong></div>
                <div className="placeholder-row"><span>Owner</span><strong>{order.contactName}</strong></div>
                <div className="placeholder-row"><span>Email</span><strong>{order.contactEmail}</strong></div>
                <div className="placeholder-row"><span>Contact number</span><strong>{order.contactNumber}</strong></div>
                <div className="placeholder-row"><span>Payment status</span><strong>Pending</strong></div>
              </div>

              <div className="checkout-form-actions split-actions">
                <button className="cart-secondary" onClick={() => navigate("/cart")}>
                  Back to Cart
                </button>
                <button className="cart-primary" onClick={() => navigate("/cart")}>
                  View Pending Orders
                </button>
              </div>
            </>
          )}
        </div>

        <OrderSummaryPanel
          title="Saved Order"
          items={order?.items || []}
          totals={{
            subTotal: order?.subTotal || 0,
            pickupFee: order?.pickupFee || 0,
            totalAmount: order?.totalAmount || 0
          }}
          selectedPet={order?.petName ? `${order.petName} (${order.petSpecies})` : ""}
          pickupDate={order?.pickupDate}
          pickupTime={order?.pickupTime}
          pickupLocation={order?.pickupLocation}
          emptyMessage="This order does not contain any items."
        />
      </div>
    </div>
  );
}
