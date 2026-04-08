package com.petcarehub.billing.dto;

import java.math.BigDecimal;

public class OwnerInvoiceItemResponse {
    public Long invoiceItemId;
    public Long productId;
    public String productName;
    public BigDecimal unitPrice;
    public Integer quantity;
    public BigDecimal lineTotal;
}
