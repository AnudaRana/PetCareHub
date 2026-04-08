package com.petcarehub.cart.controller;

import com.petcarehub.cart.dto.AddCartItemRequest;
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

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<CartResponseDto> getCart(@PathVariable Long userId) {
        return ResponseEntity.ok(cartService.getCart(userId));
    }

    @PostMapping("/{userId}/items")
    public ResponseEntity<CartResponseDto> addItem(
            @PathVariable Long userId,
            @Valid @RequestBody AddCartItemRequest request
    ) {
        return ResponseEntity.ok(cartService.addItem(userId, request.productId, request.quantity));
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
