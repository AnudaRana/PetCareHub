import React from "react";

export default function CartStepper() {
  return (
    <div className="cart-stepper">
      <div className="step active">1</div>
      <div className="step-line" />
      <div className="step active">2</div>
      <div className="step-line dashed" />
      <div className="step">3</div>
    </div>
  );
}
