import React from "react";

export default function CartStepper({ currentStep = 1 }) {
  const steps = [1, 2, 3];

  return (
    <div className="cart-stepper" aria-label="Checkout progress">
      {steps.map((step, index) => {
        const isActive = currentStep >= step;
        const isComplete = currentStep > step;
        return (
          <React.Fragment key={step}>
            <div className={`step ${isActive ? "active" : ""} ${isComplete ? "complete" : ""}`}>{step}</div>
            {index < steps.length - 1 && (
              <div className={`step-line ${currentStep > step + 0 ? "active" : ""} ${currentStep <= step ? "dashed" : ""}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
