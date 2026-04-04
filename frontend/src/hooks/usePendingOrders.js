import { useCallback, useEffect, useState } from "react";
import { orderService } from "../services/orderService";
import { getLoggedInUserId } from "../utils/session";

export function usePendingOrders() {
  const userId = getLoggedInUserId();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await orderService.getPendingOrders(userId);
      setOrders(data);
    } catch (err) {
      console.error("Failed to load pending orders", err);
      setError("Failed to load pending payment orders.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { userId, orders, loading, error, refresh };
}
