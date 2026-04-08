package com.petcarehub.invoice.service;

import java.math.BigDecimal;

public interface InvoiceCalculator {
    
    BigDecimal calculateSubtotal(BigDecimal itemsTotal, BigDecimal pickupFee);
    
    BigDecimal calculateTax(BigDecimal subtotal);
    
    BigDecimal calculateDiscount(BigDecimal subtotal);
    
    BigDecimal calculateTotal(BigDecimal subtotal, BigDecimal tax, BigDecimal discount);
}
