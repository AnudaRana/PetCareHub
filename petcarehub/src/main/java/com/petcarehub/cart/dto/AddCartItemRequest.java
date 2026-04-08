package com.petcarehub.cart.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class AddCartItemRequest {
    @NotNull
    public Long productId;

    @NotNull
    @Min(1)
    public Integer quantity = 1;
}
