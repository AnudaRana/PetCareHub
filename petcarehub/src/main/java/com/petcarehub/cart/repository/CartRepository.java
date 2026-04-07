package com.petcarehub.cart.repository;

import com.petcarehub.cart.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CartRepository extends JpaRepository<Cart, Long> {
    List<Cart> findByUser_UserId(Long userId);
    List<Cart> findByUser_UserIdAndProduct_ProductId(Long userId, Long productId);
    void deleteByUser_UserIdAndProduct_ProductId(Long userId, Long productId);
    void deleteByUser_UserId(Long userId);
}
