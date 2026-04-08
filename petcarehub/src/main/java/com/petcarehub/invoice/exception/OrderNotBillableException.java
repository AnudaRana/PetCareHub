package com.petcarehub.invoice.exception;

public class OrderNotBillableException extends RuntimeException {
    public OrderNotBillableException(String message) {
        super(message);
    }
}
