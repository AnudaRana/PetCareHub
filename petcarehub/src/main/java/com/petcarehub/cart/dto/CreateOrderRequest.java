package com.petcarehub.cart.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class CreateOrderRequest {
    @NotBlank(message = "Full name is required")
    public String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Please enter a valid email address")
    public String email;

    @NotBlank(message = "Contact number is required")
    public String contactNumber;

    public Long petId;

    @NotNull(message = "Pickup date is required")
    @FutureOrPresent(message = "Pickup date cannot be in the past")
    @JsonFormat(pattern = "yyyy-MM-dd")
    public LocalDate pickupDate;

    public String additionalNotes;
}
