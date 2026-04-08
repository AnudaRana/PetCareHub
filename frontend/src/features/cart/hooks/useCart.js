import { useCallback, useEffect, useMemo, useState } from "react";
import { cartService } from "../services/cartService";
import { useAuth } from "../../auth/contexts/AuthContext";

export function useCart() {
  const { user, loading: authLoading } = useAuth();

  const userId = useMemo(() => {
    if (user?.userId) return Number(user.userId);
    const stored = localStorage.getItem("userId");
    return stored ? Number(stored) : null;
  }, [user?.userId]);

  const [cart, setCart] = useState({ items: [], subTotal: 0, shipping: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    if (authLoading) return;

    if (!userId) {
      setCart({ items: [], subTotal: 0, shipping: 0, total: 0 });
      setLoading(false);
      setError("Unable to detect the logged-in user.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await cartService.getCart(userId);
      setCart(data);
    } catch (err) {
      console.error("Cart fetch error:", err);
      setError(err?.response?.data?.message || "Failed to load cart. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  }, [authLoading, userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const inc = async (productId, qty) => {
    if (!userId) return;
    const data = await cartService.updateQuantity(userId, productId, qty + 1);
    setCart(data);
  };

  const dec = async (productId, qty) => {
    if (!userId || qty <= 1) return;
    const data = await cartService.updateQuantity(userId, productId, qty - 1);
    setCart(data);
  };

  const remove = async (productId) => {
    if (!userId) return;
    const data = await cartService.removeItem(userId, productId);
    setCart(data);
  };

  return { userId, cart, loading: loading || authLoading, error, refresh, inc, dec, remove };
}
