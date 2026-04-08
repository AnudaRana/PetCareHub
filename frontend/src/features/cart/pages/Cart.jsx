import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { orderService } from "../services/orderService";

import CheckoutTopbar from "../components/CheckoutTopbar";
import CartStepper from "../components/CartStepper";
import CartItemRow from "../components/CartItemRow";
import CartSummary from "../components/CartSummary";
import PendingOrdersSection from "../components/PendingOrdersSection";

import "../styles/Cart.css";
import "../styles/variables.css";

import ConfirmationModal from "../components/ConfirmationModal";

export default function Cart() {
  const navigate = useNavigate();
  const { userId, cart, loading, error, inc, dec, remove } = useCart();
  const [pendingOrders, setPendingOrders] = useState([]);
  const [pendingError, setPendingError] = useState("");

  const [modal, setModal] = useState({ 
    isOpen: false, 
    onConfirm: () => {}, 
    title: "", 
    message: "", 
    confirmText: "Confirm" 
  });

  const loadPendingOrders = async () => {
    if (!userId) {
      setPendingOrders([]);
      setPendingError("");
      return;
    }

    try {
      const data = await orderService.getPendingOrders(userId);
      setPendingOrders(data);
      setPendingError("");
    } catch (err) {
      console.error(err);
      setPendingError("Failed to load orders awaiting payment.");
    }
  };

  useEffect(() => {
    loadPendingOrders();
  }, [userId]);

  const isEmpty = !cart.items || cart.items.length === 0;

  const handleCancelOrder = (orderId) => {
    setModal({
      isOpen: true,
      title: "Cancel Order",
      message: "Are you sure you want to cancel this order? This will permanently delete it from your records.",
      confirmText: "Cancel Order",
      onConfirm: async () => {
        try {
          await orderService.cancelOrder(userId, orderId);
          await loadPendingOrders();
        } catch (err) {
          console.error(err);
          setPendingError("Failed to cancel the order.");
        }
      }
    });
  };

  const handleRemoveItem = (productId, productName) => {
    setModal({
      isOpen: true,
      title: "Remove Item",
      message: `Are you sure you want to remove "${productName}" from your cart?`,
      confirmText: "Remove",
      onConfirm: () => remove(productId)
    });
  };

  return (
    <div className="cart-page">
      <CheckoutTopbar onDashboard={() => navigate("/dashboard")} onCancel={() => {}} showCancel={false} />
      <CartStepper currentStep={1} />

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
                  <CartItemRow 
                    key={item.productId} 
                    item={item} 
                    onInc={inc} 
                    onDec={dec} 
                    onRemove={() => handleRemoveItem(item.productId, item.name)} 
                  />
                ))}
              </div>

              <CartSummary subTotal={cart.subTotal} shipping={cart.shipping} total={cart.total} shippingLabel="Pickup" />

              <div className="cart-actions-center">
                <button className="cart-primary" onClick={() => navigate("/checkout/order-details")}>
                  Continue to Payment Information
                </button>
              </div>
            </>
          )}
        </div>

        {pendingError && <div className="cart-error section-spacer">{pendingError}</div>}
        <PendingOrdersSection
          orders={pendingOrders}
          onContinue={(orderId) => navigate(`/checkout/payment/${orderId}`)}
          onCancel={handleCancelOrder}
        />
      </div>

      <ConfirmationModal
        isOpen={modal.isOpen}
        title={modal.title}
        message={modal.message}
        confirmText={modal.confirmText}
        onConfirm={modal.onConfirm}
        onClose={() => setModal({ ...modal, isOpen: false })}
        isDanger={true}
      />
    </div>
  );
}
