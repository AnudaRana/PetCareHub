package com.petcarehub.invoice.service;

import com.petcarehub.invoice.dto.CreateInvoiceRequest;
import com.petcarehub.invoice.dto.InvoiceResponse;

import java.util.List;

public interface InvoiceService {
    
    InvoiceResponse generateInvoiceForOrder(Long orderId, Long staffUserId, CreateInvoiceRequest request);
    
    InvoiceResponse getInvoiceById(Long invoiceId);
    
    List<InvoiceResponse> getAllInvoices();
}
