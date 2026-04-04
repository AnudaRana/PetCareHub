import React from "react";

const steps = [1, 2, 3];

export default function CheckoutStepper({ currentStep }) {
  return (
    <div className="cart-stepper" aria-label="Checkout progress">
      {steps.map((step, index) => {
        const state = step < currentStep ? "completed" : step === currentStep ? "active" : "upcoming";
        const lineState = index < steps.length - 1 ? (index + 1 < currentStep ? "solid" : "dashed") : null;

        return (
          <React.Fragment key={step}>
            <div className={`step ${state}`}>{step}</div>
            {lineState && <div className={`step-line ${lineState}`} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}
