package com.petcarehub.billing.service.impl;

import com.petcarehub.billing.dto.OwnerBillingOrderResponse;
import com.petcarehub.billing.dto.OwnerInvoiceResponse;
import com.petcarehub.billing.mapper.OwnerBillingMapper;
import com.petcarehub.billing.service.OwnerBillingService;
import com.petcarehub.cart.entity.CustomerOrder;
import com.petcarehub.cart.repository.OrderRepository;
import com.petcarehub.invoice.entity.Invoice;
import com.petcarehub.invoice.repository.InvoiceRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class OwnerBillingServiceImpl implements OwnerBillingService {
    
    private final OrderRepository orderRepository;
    private final InvoiceRepository invoiceRepository;
    
    public OwnerBillingServiceImpl(OrderRepository orderRepository,
                                   InvoiceRepository invoiceRepository) {
        this.orderRepository = orderRepository;
        this.invoiceRepository = invoiceRepository;
    }
    
    @Override
    public List<OwnerBillingOrderResponse> getOwnerBillingOrders(Long ownerId) {
        // Load all orders for this owner
        List<CustomerOrder> orders = orderRepository.findByUser_UserIdOrderByCreatedAtDesc(ownerId);
        
        // Map to billing response with invoice info
        return orders.stream()
                .map(order -> OwnerBillingMapper.toBillingOrderResponse(order, invoiceRepository))
                .collect(Collectors.toList());
    }
    
    @Override
    public OwnerInvoiceResponse getInvoiceForOwnerOrder(Long ownerId, Long orderId) {
        // Validate order belongs to this owner
        CustomerOrder order = orderRepository.findByOrderIdAndUser_UserId(orderId, ownerId)
                .orElseThrow(() -> new EntityNotFoundException("Order not found or access denied"));
        
        // Find invoice for this order, scoped to owner
        Invoice invoice = invoiceRepository.findByOrderIdAndOwnerId(orderId, ownerId)
                .orElseThrow(() -> new EntityNotFoundException("Invoice not found for order: " + order.getOrderNumber()));
        
        return OwnerBillingMapper.toInvoiceResponse(invoice);
    }
    
    @Override
    public OwnerInvoiceResponse getInvoiceByIdForOwner(Long ownerId, Long invoiceId) {
        // Find invoice by ID, scoped to owner (security check)
        Invoice invoice = invoiceRepository.findByInvoiceIdAndOwnerId(invoiceId, ownerId)
                .orElseThrow(() -> new EntityNotFoundException("Invoice not found or access denied"));
        
        return OwnerBillingMapper.toInvoiceResponse(invoice);
    }
}
