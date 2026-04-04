package com.petcarehub.petcarehub.controller;

import com.petcarehub.petcarehub.dto.OrderDetailsDto;
import com.petcarehub.petcarehub.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping("/users/{userId}/pending-payment")
    public ResponseEntity<List<OrderDetailsDto>> getPendingPaymentOrders(@PathVariable Long userId) {
        return ResponseEntity.ok(orderService.getPendingOrders(userId));
    }

    @GetMapping("/users/{userId}/{orderId}")
    public ResponseEntity<OrderDetailsDto> getOrderForUser(
            @PathVariable Long userId,
            @PathVariable Long orderId
    ) {
        return ResponseEntity.ok(orderService.getOrderForUser(userId, orderId));
    }
}
