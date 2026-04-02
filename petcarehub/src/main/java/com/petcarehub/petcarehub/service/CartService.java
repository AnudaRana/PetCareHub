package com.petcarehub.petcarehub.service;

import com.petcarehub.petcarehub.dto.CartResponseDto;

public interface CartService {
    CartResponseDto getCart(Long userId);
    CartResponseDto updateQuantity(Long userId, Long productId, Integer quantity);
    CartResponseDto removeItem(Long userId, Long productId);
}
