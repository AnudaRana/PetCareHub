package com.petcarehub.order.repository;

import com.petcarehub.order.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ViewOrderItemRepository extends JpaRepository<OrderItem, Long> {
}
