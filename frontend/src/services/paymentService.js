import axios from "axios";

const PAYMENT_BASE_URL = "http://localhost:8083/api/payments";

export const createCheckoutSession = async (referenceId, referenceType) => {
  try {
    const response = await axios.post(`${PAYMENT_BASE_URL}/create-checkout-session`, {
      referenceId,
      referenceType,
    });

    return response.data.checkoutUrl;
  } catch (error) {
    console.error("Failed to create checkout session:", error);
    throw error;
  }
};

export const confirmPayment = async (sessionId) => {
  try {
    await axios.post(`${PAYMENT_BASE_URL}/confirm`, null, {
      params: { sessionId },
    });
  } catch (error) {
    console.error("Failed to confirm payment:", error);
    throw error;
  }
};

export const failPayment = async (referenceId, referenceType, reason) => {
  try {
    await axios.post(`${PAYMENT_BASE_URL}/fail`, {
      referenceId,
      referenceType,
      reason,
    });
  } catch (error) {
    console.error("Failed to mark payment as failed:", error);
    throw error;
  }
};