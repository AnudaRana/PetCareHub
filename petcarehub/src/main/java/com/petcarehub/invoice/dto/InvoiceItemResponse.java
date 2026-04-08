package com.petcarehub.invoice.dto;

import java.math.BigDecimal;

public class InvoiceItemResponse {
    public Long invoiceItemId;
    public Long productId;
    public String productName;
    public BigDecimal unitPrice;
    public Integer quantity;
    public BigDecimal lineTotal;
}
