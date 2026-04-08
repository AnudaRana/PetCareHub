package com.petcarehub.invoice.service.impl;

import com.petcarehub.invoice.service.InvoiceCalculator;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class DefaultInvoiceCalculator implements InvoiceCalculator {
    
    @Override
    public BigDecimal calculateSubtotal(BigDecimal itemsTotal, BigDecimal pickupFee) {
        if (itemsTotal == null) itemsTotal = BigDecimal.ZERO;
        if (pickupFee == null) pickupFee = BigDecimal.ZERO;
        return itemsTotal.add(pickupFee);
    }
    
    @Override
    public BigDecimal calculateTax(BigDecimal subtotal) {
        // For now, tax is 0. Can be extended later based on business rules.
        return BigDecimal.ZERO;
    }
    
    @Override
    public BigDecimal calculateDiscount(BigDecimal subtotal) {
        // For now, discount is 0. Can be extended later for promotions.
        return BigDecimal.ZERO;
    }
    
    @Override
    public BigDecimal calculateTotal(BigDecimal subtotal, BigDecimal tax, BigDecimal discount) {
        if (subtotal == null) subtotal = BigDecimal.ZERO;
        if (tax == null) tax = BigDecimal.ZERO;
        if (discount == null) discount = BigDecimal.ZERO;
        return subtotal.subtract(discount).add(tax);
    }
}
