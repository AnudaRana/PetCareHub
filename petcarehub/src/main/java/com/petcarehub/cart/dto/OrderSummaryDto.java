package com.petcarehub.cart.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class OrderSummaryDto {
    public Long orderId;
    public String orderNumber;
    public String ownerFullName;
    public String ownerEmail;
    public String contactNumber;
    public Long petId;
    public String petName;
    public String petSpecies;
    public LocalDate pickupDate;
    public String additionalNotes;
    public BigDecimal subTotal;
    public BigDecimal pickupFee;
    public BigDecimal total;
    public String orderStatus;
    public String paymentStatus;
    public String paymentMethod;
    public String bankName;
    public String bankAccountName;
    public String bankAccountNumber;
    public String bankBranch;
    public boolean hasReceipt;
    public boolean paymentPending;
    public LocalDateTime createdAt;
    public LocalDateTime placedAt;
    public List<OrderItemSummaryDto> items;
}
