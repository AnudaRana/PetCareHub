package com.petcarehub.exception;

public class PetNotFoundException extends RuntimeException {

    public PetNotFoundException(String message) {
        super(message);
    }

    public PetNotFoundException(Long petId) {
        super("Pet not found with ID: " + petId);
    }
}
