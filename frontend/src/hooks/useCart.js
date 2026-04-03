import { useEffect, useMemo, useState } from "react";
import { cartService } from "../services/cartService";

export function useCart() {
  const userId = useMemo(() => Number(localStorage.getItem("userId") || 1), []);

  const [cart, setCart] = useState({ items: [], subTotal: 0, shipping: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await cartService.getCart(userId);
      console.log("Cart data received:", data);
      setCart(data);
    } catch (err) {
      console.error("Cart fetch error:", err);
      setError("Failed to load cart. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const inc = async (productId, qty) => {
    const data = await cartService.updateQuantity(userId, productId, qty + 1);
    setCart(data);
  };

  const dec = async (productId, qty) => {
    if (qty <= 1) return;
    const data = await cartService.updateQuantity(userId, productId, qty - 1);
    setCart(data);
  };

  const remove = async (productId) => {
    const data = await cartService.removeItem(userId, productId);
    setCart(data);
  };

  return { cart, loading, error, inc, dec, remove };
}
