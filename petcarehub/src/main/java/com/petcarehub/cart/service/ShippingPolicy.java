package com.petcarehub.cart.service;

import java.math.BigDecimal;

public interface ShippingPolicy {
    BigDecimal calculate(BigDecimal subTotal);
}
