package com.petcarehub.cart.repository;

import com.petcarehub.cart.entity.OrderCancellation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface OrderCancellationRepository extends JpaRepository<OrderCancellation, Long> {
    Optional<OrderCancellation> findByOrder_OrderId(Long orderId);
}
