package com.petcarehub.cart.controller;

import com.petcarehub.cart.dto.CartResponseDto;
import com.petcarehub.cart.dto.UpdateCartQuantityRequest;
import com.petcarehub.cart.service.CartService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;
    public CartController(CartService cartService) { this.cartService = cartService; }

    @GetMapping("/{userId}")
    public ResponseEntity<CartResponseDto> getCart(@PathVariable Long userId) {
        return ResponseEntity.ok(cartService.getCart(userId));
    }

    @PutMapping("/{userId}/items/{productId}")
    public ResponseEntity<CartResponseDto> updateQty(
            @PathVariable Long userId,
            @PathVariable Long productId,
            @Valid @RequestBody UpdateCartQuantityRequest req
    ) {
        return ResponseEntity.ok(cartService.updateQuantity(userId, productId, req.quantity));
    }

    @DeleteMapping("/{userId}/items/{productId}")
    public ResponseEntity<CartResponseDto> removeItem(@PathVariable Long userId, @PathVariable Long productId) {
        return ResponseEntity.ok(cartService.removeItem(userId, productId));
    }
}
