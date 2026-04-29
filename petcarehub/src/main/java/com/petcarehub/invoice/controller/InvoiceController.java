package com.petcarehub.invoice.controller;

import com.petcarehub.cart.entity.CustomerOrder;
import com.petcarehub.cart.enums.OrderStatus;
import com.petcarehub.cart.repository.OrderRepository;
import com.petcarehub.invoice.dto.CreateInvoiceRequest;
import com.petcarehub.invoice.dto.EligibleOrderDto;
import com.petcarehub.invoice.dto.InvoiceResponse;
import com.petcarehub.invoice.mapper.InvoiceMapper;
import com.petcarehub.invoice.repository.InvoiceRepository;
import com.petcarehub.invoice.service.InvoiceService;
import com.petcarehub.user.entity.User;
import com.petcarehub.user.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/staff/receipts")
@PreAuthorize("hasRole('STAFF') or hasRole('ADMIN')")
public class InvoiceController {
    
    private final InvoiceService invoiceService;
    private final OrderRepository orderRepository;
    private final InvoiceRepository invoiceRepository;
    private final UserService userService;
    
    public InvoiceController(InvoiceService invoiceService,
                             OrderRepository orderRepository,
                             InvoiceRepository invoiceRepository,
                             UserService userService) {
        this.invoiceService = invoiceService;
        this.orderRepository = orderRepository;
        this.invoiceRepository = invoiceRepository;
        this.userService = userService;
    }
    
    /**
     * Get eligible orders that can be invoiced
     */
    @GetMapping("/orders/eligible")
    public ResponseEntity<List<EligibleOrderDto>> getEligibleOrders() {
        // Get orders that are placed, ready, or completed
        List<CustomerOrder> eligibleStatusOrders = orderRepository.findByOrderStatusInOrderByCreatedAtDesc(
                Arrays.asList(OrderStatus.PLACED, OrderStatus.READY, OrderStatus.COMPLETED)
        );
        
        // Filter out orders that already have invoices and exclude CARD payments
        List<EligibleOrderDto> eligibleOrders = eligibleStatusOrders.stream()
                .filter(order -> !invoiceRepository.existsByOrder_OrderId(order.getOrderId()))
                .filter(order -> order.getItems() != null && !order.getItems().isEmpty())
                .filter(order -> order.getPaymentMethod() != null)
                .filter(order -> !"CARD".equals(order.getPaymentMethod().name()))
                .map(InvoiceMapper::toEligibleOrderDto)
                .collect(Collectors.toList());
        
        return ResponseEntity.ok(eligibleOrders);
    }
    
    /**
     * Generate invoice for an order
     */
    @PostMapping("/orders/{orderId}")
    public ResponseEntity<?> generateInvoice(@PathVariable Long orderId,
                                                           @RequestBody(required = false) CreateInvoiceRequest request) {
        try {
            System.out.println("Generating invoice for order ID: " + orderId);
            Long staffUserId = getCurrentUserId();
            System.out.println("Staff user ID: " + staffUserId);
            InvoiceResponse invoice = invoiceService.generateInvoiceForOrder(orderId, staffUserId, request);
            return ResponseEntity.ok(invoice);
        } catch (Exception e) {
            System.err.println("Error generating invoice: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Failed to generate invoice: " + e.getMessage()));
        }
    }
    
    /**
     * Get all invoices
     */
    @GetMapping
    public ResponseEntity<List<InvoiceResponse>> getAllInvoices() {
        List<InvoiceResponse> invoices = invoiceService.getAllInvoices();
        return ResponseEntity.ok(invoices);
    }
    
    /**
     * Get invoice by ID
     */
    @GetMapping("/{invoiceId}")
    public ResponseEntity<InvoiceResponse> getInvoice(@PathVariable Long invoiceId) {
        InvoiceResponse invoice = invoiceService.getInvoiceById(invoiceId);
        return ResponseEntity.ok(invoice);
    }
    
    private Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userService.getUserByEmail(email);
        return user.getUserId();
    }
}
