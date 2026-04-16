package com.petcarehub.payment.dto;

public class CreateCheckoutSessionResponse {

    private String checkoutUrl;

    public CreateCheckoutSessionResponse(String checkoutUrl) {
        this.checkoutUrl = checkoutUrl;
    }

    public String getCheckoutUrl() {
        return checkoutUrl;
    }
}