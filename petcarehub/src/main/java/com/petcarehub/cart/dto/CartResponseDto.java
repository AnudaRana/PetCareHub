package com.petcarehub.cart.dto;

import java.math.BigDecimal;
import java.util.List;

public class CartResponseDto {
    public List<CartItemDto> items;
    public BigDecimal subTotal;
    public BigDecimal shipping;
    public BigDecimal total;
}
