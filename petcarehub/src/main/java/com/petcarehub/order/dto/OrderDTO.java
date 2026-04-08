package com.petcarehub.order.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDTO {
    private Long orderId;
    private String orderNumber;
    private Long userId;
    private Long petId;
    private String ownerFullName;
    private String ownerEmail;
    private String contactNumber;
    private LocalDate pickupDate;
    private String additionalNotes;
    private BigDecimal subTotal;
    private BigDecimal pickupFee;
    private BigDecimal total;
    private String orderStatus;
    private String paymentStatus;
    private String paymentMethod;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<OrderItemDTO> orderItems;
}
