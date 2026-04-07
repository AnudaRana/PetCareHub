package com.petcarehub.cart.dto;

import java.math.BigDecimal;

public class CartItemDto {
    public Long productId;
    public String name;
    public BigDecimal price;
    public Integer quantity;
    public String imageUrl;

    public BigDecimal lineTotal() {
        return price.multiply(BigDecimal.valueOf(quantity));
    }
}
