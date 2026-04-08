package com.petcarehub.cart.repository;

import com.petcarehub.cart.entity.OrderCancellation;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface OrderCancellationRepository extends JpaRepository<OrderCancellation, Long> {
    Optional<OrderCancellation> findByOrder_OrderId(Long orderId);
}
