package com.petcarehub.petcarehub.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

public class OrderDetailsDto {
    public Long orderId;
    public String orderNumber;
    public String contactName;
    public String contactEmail;
    public String contactNumber;
    public Long petId;
    public String petName;
    public String petSpecies;
    public LocalDate pickupDate;
    public LocalTime pickupTime;
    public String pickupLocation;
    public String notes;
    public String orderStatus;
    public String paymentStatus;
    public Integer itemCount;
    public BigDecimal subTotal;
    public BigDecimal pickupFee;
    public BigDecimal totalAmount;
    public LocalDateTime createdAt;
    public LocalDateTime updatedAt;
    public List<OrderItemSummaryDto> items;
}
