package com.petcarehub.cart.service;

import org.springframework.stereotype.Component;
import java.math.BigDecimal;

@Component
public class FlatRateShippingPolicy implements ShippingPolicy {
    private static final BigDecimal SHIPPING = BigDecimal.valueOf(600);

    @Override
    public BigDecimal calculate(BigDecimal subTotal) {
        return subTotal.compareTo(BigDecimal.ZERO) > 0 ? SHIPPING : BigDecimal.ZERO;
    }
}
