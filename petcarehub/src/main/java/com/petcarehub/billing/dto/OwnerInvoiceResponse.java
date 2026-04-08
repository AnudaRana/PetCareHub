package com.petcarehub.billing.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class OwnerInvoiceResponse {
    public Long invoiceId;
    public String invoiceNumber;
    public Long orderId;
    public String orderNumber;
    public String ownerName;
    public String petName;
    public LocalDate pickupDate;
    public String paymentMethod;
    public String paymentStatus;
    public BigDecimal subtotalAmount;
    public BigDecimal discountAmount;
    public BigDecimal taxAmount;
    public BigDecimal totalAmount;
    public String notes;
    public LocalDateTime createdAt;
    public List<OwnerInvoiceItemResponse> items;
}
