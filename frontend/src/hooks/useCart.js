import { useCallback, useEffect, useState } from "react";
import { cartService } from "../services/cartService";
import { getLoggedInUserId } from "../utils/session";

const emptyCart = { items: [], subTotal: 0, shipping: 0, total: 0 };

export function useCart() {
  const userId = getLoggedInUserId();

  const [cart, setCart] = useState(emptyCart);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await cartService.getCart(userId);
      setCart(data);
    } catch (err) {
      console.error("Cart fetch error:", err);
      setError("Failed to load cart. Make sure the backend is running.");
      setCart(emptyCart);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const updateCartState = async (action) => {
    setError("");
    try {
      const data = await action();
      setCart(data);
    } catch (err) {
      console.error("Cart update error:", err);
      setError(err?.response?.data?.message || "Failed to update cart.");
    }
  };

  const inc = async (productId, qty) => {
    await updateCartState(() => cartService.updateQuantity(userId, productId, qty + 1));
  };

  const dec = async (productId, qty) => {
    if (qty <= 1) return;
    await updateCartState(() => cartService.updateQuantity(userId, productId, qty - 1));
  };

  const remove = async (productId) => {
    await updateCartState(() => cartService.removeItem(userId, productId));
  };

  return { userId, cart, loading, error, inc, dec, remove, refresh };
}
