package com.petcarehub.payment.repository;

import com.petcarehub.payment.enums.PaymentStatus;
import com.petcarehub.payment.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByStripeSessionId(String stripeSessionId);

    Optional<Payment> findTopByReferenceIdAndReferenceTypeOrderByPaymentIdDesc(
            Long referenceId,
            String referenceType
    );

    boolean existsByReferenceIdAndReferenceTypeAndStatus(
            Long referenceId,
            String referenceType,
            PaymentStatus status
    );

    java.util.List<Payment> findByReferenceIdAndReferenceTypeAndStatus(
            Long referenceId,
            String referenceType,
            PaymentStatus status
    );

    java.util.List<Payment> findByStatusAndCreatedAtBefore(
            PaymentStatus status,
            java.time.LocalDateTime dateTime
    );
}