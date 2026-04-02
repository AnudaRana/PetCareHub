package com.petcarehub.petcarehub.service;

import java.math.BigDecimal;

public interface ShippingPolicy {
    BigDecimal calculate(BigDecimal subTotal);
}
