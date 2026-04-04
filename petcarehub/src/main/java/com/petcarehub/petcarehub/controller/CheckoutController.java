package com.petcarehub.petcarehub.controller;

import com.petcarehub.petcarehub.dto.CheckoutContextDto;
import com.petcarehub.petcarehub.dto.CreateOrderRequest;
import com.petcarehub.petcarehub.dto.OrderDetailsDto;
import com.petcarehub.petcarehub.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/checkout")
public class CheckoutController {

    private final OrderService orderService;

    public CheckoutController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping("/users/{userId}/context")
    public ResponseEntity<CheckoutContextDto> getCheckoutContext(@PathVariable Long userId) {
        return ResponseEntity.ok(orderService.getCheckoutContext(userId));
    }

    @PostMapping("/users/{userId}/orders")
    public ResponseEntity<OrderDetailsDto> createOrderFromCart(
            @PathVariable Long userId,
            @Valid @RequestBody CreateOrderRequest request
    ) {
        return ResponseEntity.ok(orderService.createOrderFromCart(userId, request));
    }
}
