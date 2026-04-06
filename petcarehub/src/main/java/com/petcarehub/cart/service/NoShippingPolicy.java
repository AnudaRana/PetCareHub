package com.petcarehub.cart.service;

import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@Primary
public class NoShippingPolicy implements ShippingPolicy {
    @Override
    public BigDecimal calculate(BigDecimal subTotal) {
        return BigDecimal.ZERO;
    }
}
