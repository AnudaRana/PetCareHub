// File: src/main/java/com/petcarehub/petcarehub/exception/PetNotFoundException.java
package com.petcarehub.petcarehub.exception;

public class PetNotFoundException extends RuntimeException {

    public PetNotFoundException(String message) {
        super(message);
    }

    public PetNotFoundException(Long petId) {
        super("Pet not found with ID: " + petId);
    }
}
