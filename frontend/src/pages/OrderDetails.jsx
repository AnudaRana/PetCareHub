import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { useCheckoutContext } from "../hooks/useCheckoutContext";
import { orderService } from "../services/orderService";
import { validateOrderDetails } from "../utils/orderDetailsValidation";

import CartTopbar from "../components/CartTopbar";
import CheckoutStepper from "../components/CheckoutStepper";
import OrderDetailsForm from "../components/OrderDetailsForm";
import OrderSummaryPanel from "../components/OrderSummaryPanel";

import "../styles/Cart.css";
import "../styles/variables.css";

const defaultValues = {
  fullName: "",
  email: "",
  contactNumber: "",
  petId: "",
  pickupDate: "",
  pickupTime: "",
  pickupLocation: "Main clinic pickup counter",
  notes: ""
};

export default function OrderDetails() {
  const navigate = useNavigate();
  const { userId, cart, loading: cartLoading, error: cartError } = useCart();
  const { context, loading: contextLoading, error: contextError } = useCheckoutContext();

  const [values, setValues] = useState(defaultValues);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [prefilled, setPrefilled] = useState(false);

  useEffect(() => {
    if (!contextLoading && !prefilled) {
      setValues((current) => ({
        ...current,
        fullName: context.fullName || current.fullName,
        email: context.email || current.email,
        contactNumber: context.contactNumber || current.contactNumber,
        pickupLocation: context.pickupLocation || current.pickupLocation
      }));
      setPrefilled(true);
    }
  }, [context, contextLoading, prefilled]);

  const selectedPet = useMemo(
    () => context.pets.find((pet) => String(pet.petId) === String(values.petId)),
    [context.pets, values.petId]
  );

  const formLoading = cartLoading || contextLoading;
  const cartIsEmpty = !cartLoading && (!cart.items || cart.items.length === 0);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
    setSubmitError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const validationErrors = validateOrderDetails(values);
    setErrors(validationErrors);
    setSubmitError("");

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    try {
      const order = await orderService.createOrderFromCart(userId, {
        ...values,
        petId: Number(values.petId),
        pickupTime: values.pickupTime || null,
        notes: values.notes?.trim() || null
      });
      navigate(`/checkout/payment/${order.orderId}`);
    } catch (err) {
      console.error("Failed to create order", err);
      const fieldErrors = err?.response?.data?.fieldErrors || {};
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
      }
      setSubmitError(err?.response?.data?.message || "Failed to save order details.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="cart-page">
      <CartTopbar onDashboard={() => navigate("/dashboard")} onCancel={() => navigate("/cart")} />
      <CheckoutStepper currentStep={2} />

      <div className="checkout-shell two-column">
        {cartIsEmpty ? (
          <div className="cart-card checkout-empty-card full-width">
            <h2 className="cart-title">No active cart found</h2>
            <p className="section-copy">
              Your cart is empty, so there is nothing to attach to a new order yet.
            </p>
            <button className="cart-secondary" onClick={() => navigate("/cart")}>
              Back to Cart
            </button>
          </div>
        ) : (
          <>
            <div>
              {contextError && <div className="cart-error standalone-error">{contextError}</div>}
              {cartError && <div className="cart-error standalone-error">{cartError}</div>}
              <OrderDetailsForm
                values={values}
                errors={errors}
                pets={context.pets}
                loading={formLoading}
                submitting={submitting}
                submitError={submitError}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onBack={() => navigate("/cart")}
              />
            </div>

            <OrderSummaryPanel
              title="Your Cart"
              items={cart.items}
              totals={cart}
              selectedPet={selectedPet?.displayName}
              pickupDate={values.pickupDate}
              pickupTime={values.pickupTime}
              pickupLocation={values.pickupLocation}
              emptyMessage="Your active cart is empty."
            />
          </>
        )}
      </div>
    </div>
  );
}
