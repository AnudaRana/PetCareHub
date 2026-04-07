package com.petcarehub.cart.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class UpdateCartQuantityRequest {
    @NotNull
    @Min(1)
    public Integer quantity;
}
