import { useCallback, useEffect, useState } from "react";
import { orderService } from "../services/orderService";
import { getLoggedInUserId } from "../utils/session";

const defaultContext = {
  fullName: "",
  email: "",
  contactNumber: "",
  pickupLocation: "Main clinic pickup counter",
  pets: []
};

export function useCheckoutContext() {
  const userId = getLoggedInUserId();
  const [context, setContext] = useState(defaultContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await orderService.getCheckoutContext(userId);
      setContext({ ...defaultContext, ...data });
    } catch (err) {
      console.error("Failed to load checkout context", err);
      setError("Failed to load owner and pet details.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { userId, context, loading, error, refresh };
}
