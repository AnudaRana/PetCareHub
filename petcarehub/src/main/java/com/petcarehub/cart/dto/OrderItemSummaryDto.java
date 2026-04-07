package com.petcarehub.cart.dto;

import java.math.BigDecimal;

public class OrderItemSummaryDto {
    public Long productId;
    public String productName;
    public BigDecimal unitPrice;
    public Integer quantity;
    public BigDecimal lineTotal;
    public String imageUrl;
}
