import axios from "axios";

export const createCheckoutSession = async (referenceId, referenceType) => {
  const response = await axios.post("http://localhost:8083/api/payments/create-checkout-session", {
    referenceId,
    referenceType,
  });

  return response.data.checkoutUrl;
};