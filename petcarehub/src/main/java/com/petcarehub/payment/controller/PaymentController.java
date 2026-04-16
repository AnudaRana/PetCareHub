package com.petcarehub.payment.controller;

import com.petcarehub.payment.dto.CreateCheckoutSessionRequest;
import com.petcarehub.payment.dto.CreateCheckoutSessionResponse;
import com.petcarehub.payment.service.PaymentService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/create-checkout-session")
    public CreateCheckoutSessionResponse createCheckoutSession(
            @RequestBody CreateCheckoutSessionRequest request) {

        String url = paymentService.createCheckoutSession(
                request.getReferenceId(),
                request.getReferenceType()
        );

        return new CreateCheckoutSessionResponse(url);
    }
}