package com.petcarehub.cart.service;

import com.petcarehub.cart.dto.CartResponseDto;

public interface CartService {
    CartResponseDto getCart(Long userId);
    CartResponseDto updateQuantity(Long userId, Long productId, Integer quantity);
    CartResponseDto removeItem(Long userId, Long productId);
}
