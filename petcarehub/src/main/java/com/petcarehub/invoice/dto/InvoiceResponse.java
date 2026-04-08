package com.petcarehub.invoice.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class InvoiceResponse {
    public Long invoiceId;
    public String invoiceNumber;
    public Long orderId;
    public String orderNumber;
    public Long ownerId;
    public String ownerName;
    public String ownerEmail;
    public Long petId;
    public String petName;
    public String petSpecies;
    public Long generatedByStaffId;
    public String generatedByStaffName;
    public String paymentMethod;
    public String paymentStatus;
    public String paymentReference;
    public BigDecimal subtotalAmount;
    public BigDecimal discountAmount;
    public BigDecimal taxAmount;
    public BigDecimal totalAmount;
    public String notes;
    public LocalDateTime createdAt;
    public LocalDateTime updatedAt;
    public java.util.List<InvoiceItemResponse> items;
}
