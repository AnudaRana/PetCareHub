import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth/contexts/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import CheckoutTopbar from "../components/CheckoutTopbar";
import CartStepper from "../components/CartStepper";
import CheckoutOrderSummary from "../components/CheckoutOrderSummary";
import ConfirmationModal from "../components/ConfirmationModal";
import { orderService } from "../services/orderService";
import { createCheckoutSession } from "../../../services/paymentService";

const PAYMENT_OPTIONS = {
  CASH_ON_PICKUP: {
    label: "Cash on Pickup",
    description: "Pay at the clinic when you collect the order.",
    selectable: true
  },
  BANK_DEPOSIT: {
    label: "Bank Deposit",
    description: "Upload your deposit receipt after transferring the payment.",
    selectable: true
  },
  CARD: {
    label: "Card (Credit/Debit)",
    description: "Pay securely online",
    selectable: true
  }
};

export default function PaymentPage() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const { user, loading: authLoading } = useAuth();
  const userId = useMemo(() => {
    if (user?.userId) return Number(user.userId);
    const s = localStorage.getItem("userId");
    return s ? Number(s) : null;
  }, [user?.userId]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState("");
  const [receiptFile, setReceiptFile] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const loadOrder = async () => {
      if (authLoading) return;
      if (!userId) {
        setError("Unable to detect the logged-in user.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const data = await orderService.getOrder(userId, orderId);
        setOrder(data);

        if (data.paymentMethod) {
          setSelectedMethod(data.paymentMethod);
        }
      } catch (err) {
        console.error(err);
        setError(err?.response?.data?.message || "Failed to load order information.");
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [authLoading, orderId, userId]);

  const canSubmit = Boolean(selectedMethod);
  const orderPlaced = order?.orderStatus === "PLACED";

  const handleMethodSelect = (method) => {
    if (!PAYMENT_OPTIONS[method].selectable || orderPlaced) {
      return;
    }

    setSelectedMethod(method);
    setError("");

    if (method !== "BANK_DEPOSIT") {
      setReceiptFile(null);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedMethod) {
      setError("Please select a payment method.");
      return;
    }

    if (selectedMethod === "BANK_DEPOSIT" && !receiptFile && !order?.hasReceipt) {
      setError("Please upload the bank deposit receipt.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const data = await orderService.submitPayment(userId, orderId, selectedMethod, receiptFile);

      if (selectedMethod === "CARD") {
        const checkoutUrl = await createCheckoutSession(orderId, "ORDER");
        window.location.href = checkoutUrl;
      } else {
        setOrder(data);
      }
    } catch (err) {
      if (err.response?.status === 409) {
        setError("This order has already been paid.");
      } else {
        console.error(err);
        setError(err?.response?.data?.message || err?.message || "Failed to place the order or initialize payment.");
      }
    } finally {
      if (selectedMethod !== "CARD") {
        setSubmitting(false);
      }
    }
  };

  const handleCancelOrderAction = async () => {
    try {
      await orderService.cancelOrder(userId, orderId);
      navigate("/cart");
    } catch (err) {
      console.error(err);
      setError("Failed to cancel the order.");
    }
  };

  return (
    <div className="cart-page">
      <CheckoutTopbar onDashboard={() => navigate("/dashboard")} onCancel={() => setModalOpen(true)} showCancel={true} />
      <CartStepper currentStep={3} />

      <div className="cart-shell checkout-grid payment-grid">
        <div className="cart-card form-card">
          {error && <div className="cart-error">{error}</div>}

          {loading ? (
            <div className="cart-loading">
              <div className="spinner" />
              <p>Loading payment information...</p>
            </div>
          ) : !order ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">💳</div>
              <p>Order details could not be loaded.</p>
            </div>
          ) : orderPlaced ? (
            <div className="confirmation-panel">
              <div className="section-heading left-align">
                <h2 className="cart-title cyan-heading">Order Confirmed</h2>
                <p>Your order has been placed successfully.</p>
              </div>

              <div className="confirmation-summary">
                <div className="info-grid compact-grid">
                  <div className="info-card"><span>Order Number</span><strong>{order.orderNumber}</strong></div>
                  <div className="info-card"><span>Pet</span><strong>{order.petName}</strong></div>
                  <div className="info-card"><span>Pickup Date</span><strong>{order.pickupDate}</strong></div>
                  <div className="info-card"><span>Payment Method</span><strong>{PAYMENT_OPTIONS[order.paymentMethod]?.label || order.paymentMethod}</strong></div>
                </div>
                <div className="notes-panel">
                  <h4>Additional Notes</h4>
                  <p>{order.additionalNotes || "No additional notes were provided."}</p>
                </div>
              </div>

              <div className="form-actions top-gap">
                <button type="button" className="secondary-pill-btn" onClick={() => navigate("/cart")}>Back to Cart</button>
                <button type="button" className="cart-primary" onClick={() => navigate("/dashboard")}>
                  Go to Dashboard
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="section-heading left-align">
                <h2 className="cart-title cyan-heading">Select Payment Option</h2>
                <p>Choose a payment method to place the order.</p>
              </div>

              <div className="payment-options-list">
                {Object.entries(PAYMENT_OPTIONS).map(([key, option]) => {
                  const selected = selectedMethod === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      className={`payment-option ${selected ? "selected" : ""} ${!option.selectable ? "disabled" : ""}`}
                      onClick={() => handleMethodSelect(key)}
                    >
                      <span className={`payment-radio ${selected ? "checked" : ""}`} />
                      <span className="payment-option-copy">
                        <strong>{option.label}</strong>
                        <small>{option.description}</small>
                      </span>
                    </button>
                  );
                })}
              </div>

              {selectedMethod === "BANK_DEPOSIT" && (
                <div className="bank-panel">
                  <h4>Bank Deposit Details</h4>
                  <div className="bank-details-grid">
                    <div><span>Bank</span><strong>Nations Trust Bank</strong></div>
                    <div><span>Account Name</span><strong>N T WARNAKULA</strong></div>
                    <div><span>Account Number</span><strong>200060151902</strong></div>
                    <div><span>Branch</span><strong>UNION PLACE</strong></div>
                  </div>

                  <div className="form-field top-gap-sm">
                    <label htmlFor="receipt">Upload Payment Receipt*</label>
                    <input
                      id="receipt"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(event) => setReceiptFile(event.target.files?.[0] || null)}
                    />
                    {receiptFile && <span className="helper-text">Selected file: {receiptFile.name}</span>}
                  </div>
                </div>
              )}

              <div className="disclaimer-card">
                <h4>Disclaimer / Cancellation Policy</h4>
                <p>
                  Orders are prepared for pickup only. Please contact the clinic if you need to change the pickup date or have questions about your payment.
                </p>
              </div>

              <div className="form-actions">
                <button type="button" className="secondary-pill-btn" onClick={() => navigate("/cart")}>Back to Cart</button>
                <button type="button" className="cart-primary" disabled={!canSubmit || submitting} onClick={handlePlaceOrder}>
                  {submitting ? (selectedMethod === "CARD" ? "Redirecting..." : "Placing Order...") : (order?.paymentMethod === "CARD" && selectedMethod === "CARD" ? "Retry Payment" : "Place Order")}
                </button>
              </div>
            </>
          )}
        </div>

        <CheckoutOrderSummary
          title="Order Summary"
          items={order?.items || []}
          subTotal={order?.subTotal || 0}
          shipping={order?.pickupFee || 0}
          total={order?.total || 0}
          emptyMessage="Order details will appear here."
        />
      </div>

      <ConfirmationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={handleCancelOrderAction}
        title="Cancel Order"
        message="Are you sure you want to cancel this order? This action cannot be undone."
        confirmText="Cancel Order"
        isDanger={true}
      />
    </div>
  );
}
