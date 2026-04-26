package com.petcarehub.order.repository;

import com.petcarehub.order.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ViewOrderItemRepository extends JpaRepository<OrderItem, Long> {
    @Query("SELECT COUNT(oi) > 0 FROM OrderItem oi WHERE oi.order.user.userId = :userId AND oi.product.productId = :productId")
    boolean hasPurchasedProduct(Long userId, Long productId);
}
