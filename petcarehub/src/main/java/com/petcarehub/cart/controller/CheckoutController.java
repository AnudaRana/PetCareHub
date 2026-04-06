package com.petcarehub.cart.controller;

import com.petcarehub.cart.dto.CheckoutContextDto;
import com.petcarehub.cart.dto.CreateOrderRequest;
import com.petcarehub.cart.dto.OrderSummaryDto;
import com.petcarehub.cart.dto.PendingOrderDto;
import com.petcarehub.cart.service.CheckoutService;
import jakarta.validation.Valid;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/checkout")
public class CheckoutController {

    private final CheckoutService checkoutService;

    public CheckoutController(CheckoutService checkoutService) {
        this.checkoutService = checkoutService;
    }

    @GetMapping("/{userId}/context")
    public ResponseEntity<CheckoutContextDto> getCheckoutContext(@PathVariable Long userId) {
        return ResponseEntity.ok(checkoutService.getCheckoutContext(userId));
    }

    @PostMapping("/{userId}/orders")
    public ResponseEntity<OrderSummaryDto> createOrder(@PathVariable Long userId,
                                                       @Valid @RequestBody CreateOrderRequest request) {
        return ResponseEntity.ok(checkoutService.createOrderFromCart(userId, request));
    }

    @GetMapping("/{userId}/orders/pending")
    public ResponseEntity<List<PendingOrderDto>> getPendingOrders(@PathVariable Long userId) {
        return ResponseEntity.ok(checkoutService.getPendingOrders(userId));
    }

    @GetMapping("/{userId}/orders/{orderId}")
    public ResponseEntity<OrderSummaryDto> getOrder(@PathVariable Long userId, @PathVariable Long orderId) {
        return ResponseEntity.ok(checkoutService.getOrder(userId, orderId));
    }

    @PostMapping(value = "/{userId}/orders/{orderId}/payment", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<OrderSummaryDto> submitPayment(@PathVariable Long userId,
                                                         @PathVariable Long orderId,
                                                         @RequestParam("paymentMethod") String paymentMethod,
                                                         @RequestPart(value = "receipt", required = false) MultipartFile receipt) {
        return ResponseEntity.ok(checkoutService.submitPayment(userId, orderId, paymentMethod, receipt));
    }

    @DeleteMapping("/{userId}/orders/{orderId}")
    public ResponseEntity<Void> cancelOrder(@PathVariable Long userId, @PathVariable Long orderId) {
        checkoutService.cancelOrder(userId, orderId);
        return ResponseEntity.noContent().build();
    }
}
