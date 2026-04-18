package com.petcarehub.payment.service;

import com.petcarehub.payment.model.Payment;
import com.petcarehub.payment.repository.PaymentRepository;
import org.springframework.stereotype.Service;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final StripeService stripeService;

    public PaymentService(PaymentRepository paymentRepository, StripeService stripeService) {
        this.paymentRepository = paymentRepository;
        this.stripeService = stripeService;
    }

    public String createCheckoutSession(Long referenceId, String referenceType) {
        double amount = 2000.0; // TEMP value for testing

        // Create the Stripe session first — if it fails, nothing is persisted
        String[] sessionData = stripeService.createCheckoutSession(referenceId, referenceType, amount);
        String checkoutUrl = sessionData[0];
        String stripeSessionId = sessionData[1];

        Payment payment = new Payment();
        payment.setReferenceId(referenceId);
        payment.setReferenceType(referenceType);
        payment.setAmount(amount);
        payment.setStripeSessionId(stripeSessionId);

        paymentRepository.save(payment);

        return checkoutUrl;
    }
}