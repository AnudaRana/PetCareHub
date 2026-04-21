package com.petcarehub.payment.dto;

import com.petcarehub.payment.enums.PaymentStatus;

public class PaymentStatusResponse {

    private Long paymentId;
    private Long referenceId;
    private String referenceType;
    private Double amount;
    private PaymentStatus status;
    private String stripeSessionId;

    public PaymentStatusResponse() {}

    public PaymentStatusResponse(Long paymentId, Long referenceId, String referenceType,
                                  Double amount, PaymentStatus status, String stripeSessionId) {
        this.paymentId = paymentId;
        this.referenceId = referenceId;
        this.referenceType = referenceType;
        this.amount = amount;
        this.status = status;
        this.stripeSessionId = stripeSessionId;
    }

    public Long getPaymentId() { return paymentId; }
    public Long getReferenceId() { return referenceId; }
    public String getReferenceType() { return referenceType; }
    public Double getAmount() { return amount; }
    public PaymentStatus getStatus() { return status; }
    public String getStripeSessionId() { return stripeSessionId; }
}
