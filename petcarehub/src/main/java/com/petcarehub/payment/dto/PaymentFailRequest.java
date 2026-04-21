package com.petcarehub.payment.dto;

public class PaymentFailRequest {

    private Long referenceId;
    private String referenceType;
    private String reason;

    public PaymentFailRequest() {
    }

    public PaymentFailRequest(Long referenceId, String referenceType, String reason) {
        this.referenceId = referenceId;
        this.referenceType = referenceType;
        this.reason = reason;
    }

    public Long getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(Long referenceId) {
        this.referenceId = referenceId;
    }

    public String getReferenceType() {
        return referenceType;
    }

    public void setReferenceType(String referenceType) {
        this.referenceType = referenceType;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
