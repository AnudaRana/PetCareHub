package com.petcarehub.cart.controller;

import com.petcarehub.cart.entity.CustomerOrder;
import com.petcarehub.cart.entity.OrderCancellation;
import com.petcarehub.cart.enums.OrderStatus;
import com.petcarehub.cart.service.OrderManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController("cartOrderController")
@RequestMapping("/api/shop/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderManagementService orderManagementService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<CustomerOrder>> getMyOrders(@PathVariable Long userId) {
        return ResponseEntity.ok(orderManagementService.getOrdersByUser(userId));
    }

    @GetMapping("/all")
    public ResponseEntity<List<CustomerOrder>> getAllOrders() {
        return ResponseEntity.ok(orderManagementService.getAllOrders());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getOrderDetails(@PathVariable Long id) {
        CustomerOrder order = orderManagementService.getOrderById(id);
        OrderCancellation cancellation = orderManagementService.getOrderCancellation(id);
        
        Map<String, Object> response = new HashMap<>();
        response.put("order", order);
        if (cancellation != null) {
            response.put("cancellationReason", cancellation.getReason());
            response.put("cancelledBy", cancellation.getCancelledBy());
        }
        
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<CustomerOrder> cancelOrder(
            @PathVariable Long id, 
            @RequestBody Map<String, Object> payload) {
        
        String reason = (String) payload.getOrDefault("reason", "No reason provided");
        String roles = (String) payload.get("roles");
        
        Object userIdObj = payload.get("userId");
        Long userId = null;
        if (userIdObj != null) {
            userId = Long.valueOf(userIdObj.toString());
        }
        
        CustomerOrder cancelledOrder = orderManagementService.cancelOrder(id, reason, roles, userId);
        return ResponseEntity.ok(cancelledOrder);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<CustomerOrder> updateStatus(
            @PathVariable Long id, 
            @RequestBody Map<String, String> payload) {
        
        String statusStr = payload.get("status");
        if (statusStr == null) return ResponseEntity.badRequest().build();
        
        OrderStatus status = OrderStatus.valueOf(statusStr.toUpperCase());
        CustomerOrder updatedOrder = orderManagementService.updateOrderStatus(id, status);
        return ResponseEntity.ok(updatedOrder);
    }

    @PutMapping("/{id}/verify-payment")
    public ResponseEntity<CustomerOrder> verifyPayment(@PathVariable Long id) {
        return ResponseEntity.ok(orderManagementService.verifyPayment(id));
    }

    @GetMapping("/{id}/receipt")
    public ResponseEntity<byte[]> getPaymentReceipt(@PathVariable Long id) {
        CustomerOrder order = orderManagementService.getOrderById(id);
        byte[] receipt = orderManagementService.getPaymentReceipt(id);
        
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(order.getPaymentReceiptContentType()))
                .body(receipt);
    }
}
