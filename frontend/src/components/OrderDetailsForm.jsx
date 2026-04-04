import React from "react";

const today = new Date().toISOString().split("T")[0];

function FieldMessage({ message }) {
  if (!message) return null;
  return <div className="field-error">{message}</div>;
}

export default function OrderDetailsForm({
  values,
  errors,
  pets,
  loading,
  submitting,
  submitError,
  onChange,
  onSubmit,
  onBack
}) {
  const hasPets = pets.length > 0;

  return (
    <div className="checkout-form-card">
      <div className="section-kicker">Order Details</div>
      <h2 className="checkout-section-title">Contact Information</h2>
      <p className="checkout-section-copy">
        Tell the clinic who is collecting the order, which pet the order is for, and when you would like to pick it up.
      </p>

      {submitError && <div className="cart-error">{submitError}</div>}
      {!hasPets && !loading && (
        <div className="cart-error">
          No pets are registered under this account yet. Please add a pet before continuing.
        </div>
      )}

      <form className="checkout-form" onSubmit={onSubmit}>
        <label className="form-field">
          <span>Full name*</span>
          <input
            name="fullName"
            value={values.fullName}
            onChange={onChange}
            placeholder="Enter the pet owner name"
            disabled={loading || submitting}
          />
          <FieldMessage message={errors.fullName} />
        </label>

        <label className="form-field">
          <span>Email*</span>
          <input
            type="email"
            name="email"
            value={values.email}
            onChange={onChange}
            placeholder="owner@email.com"
            disabled={loading || submitting}
          />
          <FieldMessage message={errors.email} />
        </label>

        <label className="form-field">
          <span>Contact number*</span>
          <input
            name="contactNumber"
            value={values.contactNumber}
            onChange={onChange}
            placeholder="07X XXX XXXX"
            disabled={loading || submitting}
          />
          <FieldMessage message={errors.contactNumber} />
        </label>

        <label className="form-field">
          <span>Selected pet*</span>
          <select name="petId" value={values.petId} onChange={onChange} disabled={loading || submitting || !hasPets}>
            <option value="">Choose one of your registered pets</option>
            {pets.map((pet) => (
              <option key={pet.petId} value={pet.petId}>
                {pet.displayName}
              </option>
            ))}
          </select>
          <FieldMessage message={errors.petId} />
        </label>

        <div className="form-row split">
          <label className="form-field">
            <span>Pickup date*</span>
            <input
              type="date"
              name="pickupDate"
              min={today}
              value={values.pickupDate}
              onChange={onChange}
              disabled={loading || submitting}
            />
            <FieldMessage message={errors.pickupDate} />
          </label>

          <label className="form-field">
            <span>Preferred pickup time</span>
            <input
              type="time"
              name="pickupTime"
              value={values.pickupTime}
              onChange={onChange}
              disabled={loading || submitting}
            />
            <FieldMessage message={errors.pickupTime} />
          </label>
        </div>

        <label className="form-field">
          <span>Pickup location</span>
          <input
            name="pickupLocation"
            value={values.pickupLocation}
            onChange={onChange}
            disabled={loading || submitting}
          />
          <FieldMessage message={errors.pickupLocation} />
        </label>

        <label className="form-field">
          <span>Additional notes</span>
          <textarea
            name="notes"
            value={values.notes}
            onChange={onChange}
            placeholder="Medication preferences, pet allergies, or anything the clinic should know"
            disabled={loading || submitting}
            rows={4}
          />
          <FieldMessage message={errors.notes} />
        </label>

        <div className="checkout-form-actions">
          <button type="button" className="cart-secondary" onClick={onBack} disabled={submitting}>
            Back to Cart
          </button>
          <button type="submit" className="cart-primary" disabled={loading || submitting || !hasPets}>
            {submitting ? "Saving Order..." : "Continue to Payment"}
          </button>
        </div>
      </form>
    </div>
  );
}
