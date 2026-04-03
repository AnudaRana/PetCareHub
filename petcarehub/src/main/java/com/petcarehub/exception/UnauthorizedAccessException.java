package com.petcarehub.exception;

public class UnauthorizedAccessException extends RuntimeException {

    public UnauthorizedAccessException(String message) {
        super(message);
    }

    public UnauthorizedAccessException(Long userId, Long petId) {
        super("User " + userId + " is not authorized to access pet " + petId);
    }
}
