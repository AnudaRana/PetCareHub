package com.petcarehub.order.controller;

import com.petcarehub.order.dto.OrderDTO;
import com.petcarehub.order.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @GetMapping("/owner/{userId}")
    public ResponseEntity<List<OrderDTO>> getOrdersByOwner(@PathVariable Long userId) {
        return ResponseEntity.ok(orderService.getOrdersByOwnerId(userId));
    }

    @GetMapping
    public ResponseEntity<List<OrderDTO>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @GetMapping("/pending")
    public ResponseEntity<List<OrderDTO>> getPendingOrders() {
        return ResponseEntity.ok(orderService.getPendingOrders());
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderDTO> getOrderById(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.getOrderById(orderId));
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<OrderDTO> updateOrderStatus(@PathVariable Long orderId, @RequestBody Map<String, String> payload) {
        String status = payload.get("status");
        return ResponseEntity.ok(orderService.updateOrderStatus(orderId, status));
    }

    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<OrderDTO> cancelOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.cancelOrder(orderId));
    }

    @PostMapping("/generate-dummy")
    public ResponseEntity<String> generateDummyOrders() {
        orderService.generateDummyOrders();
        return ResponseEntity.ok("Dummy orders generated successfully.");
    }

    @GetMapping("/check-purchase")
    public ResponseEntity<Boolean> hasPurchasedProduct(@RequestParam Long userId, @RequestParam Long productId) {
        return ResponseEntity.ok(orderService.hasPurchasedProduct(userId, productId));
    }
}
