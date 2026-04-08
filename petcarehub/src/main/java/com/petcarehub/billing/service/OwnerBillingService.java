package com.petcarehub.billing.service;

import com.petcarehub.billing.dto.OwnerBillingOrderResponse;
import com.petcarehub.billing.dto.OwnerInvoiceResponse;

import java.util.List;

public interface OwnerBillingService {
    
    /**
     * Get all billing orders for the logged-in owner
     * @param ownerId The ID of the logged-in owner
     * @return List of billing order responses
     */
    List<OwnerBillingOrderResponse> getOwnerBillingOrders(Long ownerId);
    
    /**
     * Get invoice details for a specific order (owner-scoped)
     * @param ownerId The ID of the logged-in owner
     * @param orderId The order ID to get invoice for
     * @return Invoice response
     */
    OwnerInvoiceResponse getInvoiceForOwnerOrder(Long ownerId, Long orderId);
    
    /**
     * Get invoice details by invoice ID (owner-scoped)
     * @param ownerId The ID of the logged-in owner
     * @param invoiceId The invoice ID
     * @return Invoice response
     */
    OwnerInvoiceResponse getInvoiceByIdForOwner(Long ownerId, Long invoiceId);
}
