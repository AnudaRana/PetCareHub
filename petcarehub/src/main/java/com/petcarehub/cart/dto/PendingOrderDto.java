package com.petcarehub.cart.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class PendingOrderDto {
    public Long orderId;
    public String orderNumber;
    public String petName;
    public LocalDate pickupDate;
    public BigDecimal total;
    public String orderStatus;
    public String paymentStatus;
    public LocalDateTime createdAt;
}
