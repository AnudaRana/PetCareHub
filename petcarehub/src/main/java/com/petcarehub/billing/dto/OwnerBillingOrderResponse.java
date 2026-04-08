package com.petcarehub.billing.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class OwnerBillingOrderResponse {
    public Long orderId;
    public String orderNumber;
    public String petName;
    public LocalDate pickupDate;
    public BigDecimal orderTotal;
    public String orderStatus;
    public boolean invoiceAvailable;
    public String invoiceNumber;
    public String paymentMethod;
    public String paymentStatus;
    public LocalDateTime orderedAt;
}
