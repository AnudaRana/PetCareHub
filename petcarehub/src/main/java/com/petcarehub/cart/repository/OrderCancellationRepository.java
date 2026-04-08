package com.petcarehub.cart.repository;

import com.petcarehub.cart.entity.OrderCancellation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OrderCancellationRepository extends JpaRepository<OrderCancellation, Long> {
}
