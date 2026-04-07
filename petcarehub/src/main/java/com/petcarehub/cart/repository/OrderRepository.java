package com.petcarehub.cart.repository;

import com.petcarehub.cart.entity.CustomerOrder;
import com.petcarehub.cart.enums.OrderStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<CustomerOrder, Long> {
    @EntityGraph(attributePaths = {"pet", "items", "items.product"})
    Optional<CustomerOrder> findByOrderIdAndUser_UserId(Long orderId, Long userId);

    List<CustomerOrder> findByUser_UserIdAndOrderStatusOrderByCreatedAtDesc(Long userId, OrderStatus orderStatus);
}
