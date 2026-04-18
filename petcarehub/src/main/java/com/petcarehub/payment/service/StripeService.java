package com.petcarehub.payment.service;

import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import org.springframework.stereotype.Service;

@Service
public class StripeService {

    public String[] createCheckoutSession(Long referenceId, String referenceType, Double amount) {
        try {
            long unitAmount = Math.round(amount * 100); // convert LKR to cents

            SessionCreateParams params =
                    SessionCreateParams.builder()
                            .setMode(SessionCreateParams.Mode.PAYMENT)
                            .setSuccessUrl("http://localhost:3000/payment-success")
                            .setCancelUrl("http://localhost:3000/payment-cancel")
                            .addLineItem(
                                    SessionCreateParams.LineItem.builder()
                                            .setQuantity(1L)
                                            .setPriceData(
                                                    SessionCreateParams.LineItem.PriceData.builder()
                                                            .setCurrency("lkr")
                                                            .setUnitAmount(unitAmount)
                                                            .setProductData(
                                                                    SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                            .setName(referenceType + " Payment")
                                                                            .build()
                                                            )
                                                            .build()
                                            )
                                            .build()
                            )
                            .build();

            Session session = Session.create(params);
            return new String[]{session.getUrl(), session.getId()};

        } catch (Exception e) {
            throw new RuntimeException("Stripe session creation failed", e);
        }
    }
}