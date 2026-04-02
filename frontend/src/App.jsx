import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Cart from "./pages/Cart.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/cart" replace />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/dashboard" element={<div style={{ padding: 40 }}>Dashboard Placeholder</div>} />
        <Route path="/checkout" element={<div style={{ padding: 40 }}>Checkout Placeholder</div>} />
      </Routes>
    </BrowserRouter>
  );
}
