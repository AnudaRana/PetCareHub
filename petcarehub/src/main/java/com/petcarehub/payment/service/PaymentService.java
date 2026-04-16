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

        Payment payment = new Payment();
        payment.setReferenceId(referenceId);
        payment.setReferenceType(referenceType);
        payment.setAmount(amount);

        paymentRepository.save(payment);

        return stripeService.createCheckoutSession(referenceId, referenceType, amount);
    }
}