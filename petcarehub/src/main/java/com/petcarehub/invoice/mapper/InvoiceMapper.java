package com.petcarehub.invoice.mapper;

import com.petcarehub.cart.entity.CustomerOrder;
import com.petcarehub.invoice.dto.EligibleOrderDto;
import com.petcarehub.invoice.dto.InvoiceItemResponse;
import com.petcarehub.invoice.dto.InvoiceResponse;
import com.petcarehub.invoice.entity.Invoice;
import com.petcarehub.invoice.entity.InvoiceItem;

import java.util.List;
import java.util.stream.Collectors;

public class InvoiceMapper {
    
    public static InvoiceResponse toResponse(Invoice invoice) {
        InvoiceResponse response = new InvoiceResponse();
        response.invoiceId = invoice.getInvoiceId();
        response.invoiceNumber = invoice.getInvoiceNumber();
        response.orderId = invoice.getOrder().getOrderId();
        response.orderNumber = invoice.getOrder().getOrderNumber();
        response.ownerId = invoice.getOwner().getUserId();
        response.ownerName = invoice.getOwner().getFirstName() + " " + invoice.getOwner().getLastName();
        response.ownerEmail = invoice.getOwner().getEmail();
        
        if (invoice.getPet() != null) {
            response.petId = invoice.getPet().getPetId();
            response.petName = invoice.getPet().getName();
            response.petSpecies = invoice.getPet().getSpecies();
        }
        
        response.generatedByStaffId = invoice.getGeneratedByStaff().getUserId();
        response.generatedByStaffName = invoice.getGeneratedByStaff().getFirstName() + " " + invoice.getGeneratedByStaff().getLastName();
        response.paymentMethod = invoice.getPaymentMethod();
        response.paymentStatus = invoice.getPaymentStatus().name();
        response.paymentReference = invoice.getPaymentReference();
        response.subtotalAmount = invoice.getSubtotalAmount();
        response.discountAmount = invoice.getDiscountAmount();
        response.taxAmount = invoice.getTaxAmount();
        response.totalAmount = invoice.getTotalAmount();
        response.notes = invoice.getNotes();
        response.createdAt = invoice.getCreatedAt();
        response.updatedAt = invoice.getUpdatedAt();
        
        if (invoice.getItems() != null) {
            response.items = invoice.getItems().stream()
                    .map(InvoiceMapper::toItemResponse)
                    .collect(Collectors.toList());
        }
        
        return response;
    }
    
    public static InvoiceItemResponse toItemResponse(InvoiceItem item) {
        InvoiceItemResponse response = new InvoiceItemResponse();
        response.invoiceItemId = item.getInvoiceItemId();
        response.productId = item.getProductId();
        response.productName = item.getProductName();
        response.unitPrice = item.getUnitPrice();
        response.quantity = item.getQuantity();
        response.lineTotal = item.getLineTotal();
        return response;
    }
    
    public static EligibleOrderDto toEligibleOrderDto(CustomerOrder order) {
        EligibleOrderDto dto = new EligibleOrderDto();
        dto.orderId = order.getOrderId();
        dto.orderNumber = order.getOrderNumber();
        dto.ownerName = order.getOwnerFullName();
        dto.ownerEmail = order.getOwnerEmail();
        dto.petId = order.getPet().getPetId();
        dto.petName = order.getPet().getName();
        dto.petSpecies = order.getPet().getSpecies();
        dto.pickupDate = order.getPickupDate();
        dto.paymentMethod = order.getPaymentMethod() != null ? order.getPaymentMethod().name() : null;
        dto.total = order.getTotal();
        dto.createdAt = order.getCreatedAt();
        return dto;
    }
}
