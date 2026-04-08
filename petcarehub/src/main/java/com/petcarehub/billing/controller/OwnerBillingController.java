package com.petcarehub.billing.controller;

import com.petcarehub.billing.dto.OwnerBillingOrderResponse;
import com.petcarehub.billing.dto.OwnerInvoiceResponse;
import com.petcarehub.billing.service.OwnerBillingService;
import com.petcarehub.user.entity.User;
import com.petcarehub.user.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/owner/billing")
@PreAuthorize("hasRole('OWNER')")
public class OwnerBillingController {
    
    private final OwnerBillingService ownerBillingService;
    private final UserService userService;
    
    public OwnerBillingController(OwnerBillingService ownerBillingService,
                                  UserService userService) {
        this.ownerBillingService = ownerBillingService;
        this.userService = userService;
    }
    
    /**
     * Get all billing orders for the logged-in owner
     */
    @GetMapping("/orders")
    public ResponseEntity<List<OwnerBillingOrderResponse>> getBillingOrders() {
        Long ownerId = getCurrentOwnerId();
        List<OwnerBillingOrderResponse> orders = ownerBillingService.getOwnerBillingOrders(ownerId);
        return ResponseEntity.ok(orders);
    }
    
    /**
     * Get invoice for a specific order
     */
    @GetMapping("/orders/{orderId}/invoice")
    public ResponseEntity<OwnerInvoiceResponse> getOrderInvoice(@PathVariable Long orderId) {
        Long ownerId = getCurrentOwnerId();
        OwnerInvoiceResponse invoice = ownerBillingService.getInvoiceForOwnerOrder(ownerId, orderId);
        return ResponseEntity.ok(invoice);
    }
    
    /**
     * Get invoice by invoice ID
     */
    @GetMapping("/invoices/{invoiceId}")
    public ResponseEntity<OwnerInvoiceResponse> getInvoice(@PathVariable Long invoiceId) {
        Long ownerId = getCurrentOwnerId();
        OwnerInvoiceResponse invoice = ownerBillingService.getInvoiceByIdForOwner(ownerId, invoiceId);
        return ResponseEntity.ok(invoice);
    }
    
    private Long getCurrentOwnerId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userService.getUserByEmail(email);
        return user.getUserId();
    }
}
