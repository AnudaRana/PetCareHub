package com.petcarehub.billing.mapper;

import com.petcarehub.billing.dto.OwnerBillingOrderResponse;
import com.petcarehub.billing.dto.OwnerInvoiceItemResponse;
import com.petcarehub.billing.dto.OwnerInvoiceResponse;
import com.petcarehub.cart.entity.CustomerOrder;
import com.petcarehub.invoice.entity.Invoice;
import com.petcarehub.invoice.entity.InvoiceItem;
import com.petcarehub.invoice.repository.InvoiceRepository;

import java.util.List;
import java.util.stream.Collectors;

public class OwnerBillingMapper {
    
    public static OwnerBillingOrderResponse toBillingOrderResponse(CustomerOrder order, InvoiceRepository invoiceRepository) {
        OwnerBillingOrderResponse response = new OwnerBillingOrderResponse();
        response.orderId = order.getOrderId();
        response.orderNumber = order.getOrderNumber();
        response.petName = order.getPet() != null ? order.getPet().getName() : "N/A";
        response.pickupDate = order.getPickupDate();
        response.orderTotal = order.getTotal();
        response.orderStatus = order.getOrderStatus() != null ? order.getOrderStatus().name() : "UNKNOWN";
        response.orderedAt = order.getCreatedAt();
        
        // Check if invoice exists for this order
        boolean invoiceExists = invoiceRepository.existsByOrder_OrderId(order.getOrderId());
        response.invoiceAvailable = invoiceExists;
        
        if (invoiceExists) {
            Invoice invoice = invoiceRepository.findByOrder_OrderId(order.getOrderId()).orElse(null);
            if (invoice != null) {
                response.invoiceNumber = invoice.getInvoiceNumber();
                response.paymentMethod = invoice.getPaymentMethod();
            }
        }
        
        // Prioritize order's payment status (e.g. if paid via Stripe online)
        if (order.getPaymentStatus() != null && "PAID".equals(order.getPaymentStatus().name())) {
            response.paymentStatus = "PAID";
        } else if (invoiceExists) {
            Invoice invoice = invoiceRepository.findByOrder_OrderId(order.getOrderId()).orElse(null);
            response.paymentStatus = invoice != null && invoice.getPaymentStatus() != null 
                ? invoice.getPaymentStatus().name() 
                : "PENDING";
        } else {
            response.paymentStatus = "AWAITING_INVOICE";
        }
        
        return response;
    }
    
    public static OwnerInvoiceResponse toInvoiceResponse(Invoice invoice) {
        OwnerInvoiceResponse response = new OwnerInvoiceResponse();
        response.invoiceId = invoice.getInvoiceId();
        response.invoiceNumber = invoice.getInvoiceNumber();
        response.orderId = invoice.getOrder().getOrderId();
        response.orderNumber = invoice.getOrder().getOrderNumber();
        response.ownerName = invoice.getOwner().getFirstName() + " " + invoice.getOwner().getLastName();
        response.petName = invoice.getPet() != null ? invoice.getPet().getName() : "N/A";
        response.pickupDate = invoice.getOrder().getPickupDate();
        response.paymentMethod = invoice.getPaymentMethod();
        response.paymentStatus = invoice.getPaymentStatus() != null ? invoice.getPaymentStatus().name() : "PENDING";
        response.subtotalAmount = invoice.getSubtotalAmount();
        response.discountAmount = invoice.getDiscountAmount();
        response.taxAmount = invoice.getTaxAmount();
        response.totalAmount = invoice.getTotalAmount();
        response.notes = invoice.getNotes();
        response.createdAt = invoice.getCreatedAt();
        
        if (invoice.getItems() != null) {
            response.items = invoice.getItems().stream()
                    .map(OwnerBillingMapper::toInvoiceItemResponse)
                    .collect(Collectors.toList());
        }
        
        return response;
    }
    
    public static OwnerInvoiceItemResponse toInvoiceItemResponse(InvoiceItem item) {
        OwnerInvoiceItemResponse response = new OwnerInvoiceItemResponse();
        response.invoiceItemId = item.getInvoiceItemId();
        response.productId = item.getProductId();
        response.productName = item.getProductName();
        response.unitPrice = item.getUnitPrice();
        response.quantity = item.getQuantity();
        response.lineTotal = item.getLineTotal();
        return response;
    }
}
