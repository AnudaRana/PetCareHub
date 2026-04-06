import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Cart from "./features/cart/pages/Cart.jsx";
import OrderDetails from "./features/cart/pages/OrderDetails.jsx";
import PaymentPage from "./features/cart/pages/PaymentPage.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/cart" replace />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout/order-details" element={<OrderDetails />} />
        <Route path="/checkout/payment/:orderId" element={<PaymentPage />} />
        <Route path="/dashboard" element={<div style={{ padding: 40 }}>Dashboard Placeholder</div>} />
        <Route path="*" element={<Navigate to="/cart" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
