import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../auth/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import CheckoutTopbar from "../components/CheckoutTopbar";
import CartStepper from "../components/CartStepper";
import CheckoutOrderSummary from "../components/CheckoutOrderSummary";
import { cartService } from "../services/cartService";
import { orderService } from "../services/orderService";

const initialForm = {
  fullName: "",
  email: "",
  contactNumber: "",
  petId: "",
  pickupDate: "",
  additionalNotes: ""
};

export default function OrderDetails() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const userId = useMemo(() => {
    if (user?.userId) return Number(user.userId);
    const s = localStorage.getItem("userId");
    return s ? Number(s) : null;
  }, [user?.userId]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [context, setContext] = useState({ pets: [] });
  const [cart, setCart] = useState({ items: [], subTotal: 0, shipping: 0, total: 0 });
  const [form, setForm] = useState(initialForm);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    const loadPage = async () => {
      if (authLoading) return;
      if (!userId) {
        setError("Unable to detect the logged-in user.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");
      try {
        const [contextData, cartData] = await Promise.all([
          orderService.getCheckoutContext(userId),
          cartService.getCart(userId)
        ]);

        setContext(contextData);
        setCart(cartData);
        setForm((prev) => ({
          ...prev,
          fullName: contextData.fullName || "",
          email: contextData.email || "",
          contactNumber: contextData.contactNumber || "",
          petId: contextData.pets?.[0]?.petId ? String(contextData.pets[0].petId) : ""
        }));
      } catch (err) {
        console.error(err);
        setError(err?.response?.data?.message || "Failed to load order details.");
      } finally {
        setLoading(false);
      }
    };

    loadPage();
  }, [authLoading, userId]);

  const validate = () => {
    const nextErrors = {};
    if (!form.fullName.trim()) nextErrors.fullName = "Full name is required.";
    if (!form.email.trim()) nextErrors.email = "Email is required.";
    if (!form.contactNumber.trim()) nextErrors.contactNumber = "Contact number is required.";
    if (!form.pickupDate) nextErrors.pickupDate = "Pickup date is required.";
    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) {
      setError("Please complete the required fields before continuing.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const order = await orderService.createOrderFromCart(userId, {
        ...form,
        petId: form.petId ? Number(form.petId) : null
      });
      navigate(`/checkout/payment/${order.orderId}`);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to create the order.");
    } finally {
      setSaving(false);
    }
  };

  const isCartEmpty = !cart.items?.length;

  return (
    <div className="cart-page">
      <CheckoutTopbar onDashboard={() => navigate("/dashboard")} onCancel={() => {}} showCancel={false} />
      <CartStepper currentStep={2} />

      <div className="cart-shell checkout-grid">
        <div className="cart-card form-card">
          <h2 className="cart-title cyan-heading">Order Details</h2>

          {error && <div className="cart-error">{error}</div>}

          {loading ? (
            <div className="cart-loading">
              <div className="spinner" />
              <p>Loading checkout details...</p>
            </div>
          ) : isCartEmpty ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">🧾</div>
              <h3>Your cart is empty</h3>
              <p>Return to the cart page and add products before continuing.</p>
              <button className="secondary-pill-btn" onClick={() => navigate("/cart")}>Back to Cart</button>
            </div>
          ) : (
            <form className="checkout-form" onSubmit={handleSubmit}>
              <div className="form-field">
                <label htmlFor="fullName">Full name*</label>
                <input id="fullName" name="fullName" value={form.fullName} onChange={handleChange} />
                {fieldErrors.fullName && <span className="field-error">{fieldErrors.fullName}</span>}
              </div>

              <div className="form-field">
                <label htmlFor="email">Email*</label>
                <input id="email" name="email" type="email" value={form.email} onChange={handleChange} />
                {fieldErrors.email && <span className="field-error">{fieldErrors.email}</span>}
              </div>

              <div className="form-field">
                <label htmlFor="contactNumber">Contact Number*</label>
                <input id="contactNumber" name="contactNumber" value={form.contactNumber} onChange={handleChange} />
                {fieldErrors.contactNumber && <span className="field-error">{fieldErrors.contactNumber}</span>}
              </div>

              <div className="form-field">
                <label htmlFor="petId">Pet (Optional)</label>
                <select id="petId" name="petId" value={form.petId} onChange={handleChange}>
                  <option value="">No pet selected</option>
                  {context.pets.map((pet) => (
                    <option key={pet.petId} value={pet.petId}>{pet.displayName}</option>
                  ))}
                </select>
                {fieldErrors.petId && <span className="field-error">{fieldErrors.petId}</span>}
              </div>

              <div className="form-field">
                <label htmlFor="pickupDate">Pickup Date*</label>
                <input id="pickupDate" name="pickupDate" type="date" min={new Date().toISOString().split("T")[0]} value={form.pickupDate} onChange={handleChange} />
                {fieldErrors.pickupDate && <span className="field-error">{fieldErrors.pickupDate}</span>}
              </div>

              <div className="form-field">
                <label htmlFor="additionalNotes">Additional Notes</label>
                <textarea id="additionalNotes" name="additionalNotes" rows="4" value={form.additionalNotes} onChange={handleChange} />
              </div>

              <div className="form-actions">
                <button type="button" className="secondary-pill-btn" onClick={() => navigate("/cart")}>Back to Cart</button>
                <button type="submit" className="cart-primary" disabled={saving}>
                  {saving ? "Saving Order..." : "Continue to Payment"}
                </button>
              </div>
            </form>
          )}
        </div>

        <CheckoutOrderSummary
          title="Your Cart"
          items={cart.items || []}
          subTotal={cart.subTotal}
          shipping={cart.shipping}
          total={cart.total}
          emptyMessage="Cart summary will appear here."
        />
      </div>
    </div>
  );
}
