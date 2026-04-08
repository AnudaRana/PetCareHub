package com.petcarehub.invoice.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class EligibleOrderDto {
    public Long orderId;
    public String orderNumber;
    public String ownerName;
    public String ownerEmail;
    public Long petId;
    public String petName;
    public String petSpecies;
    public java.time.LocalDate pickupDate;
    public String paymentMethod;
    public BigDecimal total;
    public LocalDateTime createdAt;
}
