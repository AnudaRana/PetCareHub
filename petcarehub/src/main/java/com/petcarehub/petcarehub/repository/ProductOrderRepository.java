package com.petcarehub.petcarehub.repository;

import com.petcarehub.petcarehub.entity.ProductOrder;
import com.petcarehub.petcarehub.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductOrderRepository extends JpaRepository<ProductOrder, Long> {
    List<ProductOrder> findByOwner_UserIdAndPaymentStatusOrderByCreatedAtDesc(Long ownerId, PaymentStatus paymentStatus);
    Optional<ProductOrder> findByOrderIdAndOwner_UserId(Long orderId, Long ownerId);
}
