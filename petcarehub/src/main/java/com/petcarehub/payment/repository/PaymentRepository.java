package com.petcarehub.payment.repository;

import com.petcarehub.payment.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByStripeSessionId(String stripeSessionId);

    Optional<Payment> findByReferenceIdAndReferenceType(Long referenceId, String referenceType);
}