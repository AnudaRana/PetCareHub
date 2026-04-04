package com.petcarehub.petcarehub.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;
import java.time.LocalTime;

public class CreateOrderRequest {

    @NotBlank(message = "Full name is required")
    @Size(max = 150, message = "Full name must be 150 characters or less")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Enter a valid email address")
    @Size(max = 255, message = "Email must be 255 characters or less")
    private String email;

    @NotBlank(message = "Contact number is required")
    @Size(max = 50, message = "Contact number must be 50 characters or less")
    private String contactNumber;

    @NotNull(message = "Please select a pet")
    private Long petId;

    @NotNull(message = "Pickup date is required")
    @FutureOrPresent(message = "Pickup date cannot be in the past")
    private LocalDate pickupDate;

    @JsonFormat(pattern = "HH:mm")
    private LocalTime pickupTime;

    @Size(max = 150, message = "Pickup location must be 150 characters or less")
    private String pickupLocation;

    @Size(max = 1000, message = "Additional notes must be 1000 characters or less")
    private String notes;

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getContactNumber() {
        return contactNumber;
    }

    public void setContactNumber(String contactNumber) {
        this.contactNumber = contactNumber;
    }

    public Long getPetId() {
        return petId;
    }

    public void setPetId(Long petId) {
        this.petId = petId;
    }

    public LocalDate getPickupDate() {
        return pickupDate;
    }

    public void setPickupDate(LocalDate pickupDate) {
        this.pickupDate = pickupDate;
    }

    public LocalTime getPickupTime() {
        return pickupTime;
    }

    public void setPickupTime(LocalTime pickupTime) {
        this.pickupTime = pickupTime;
    }

    public String getPickupLocation() {
        return pickupLocation;
    }

    public void setPickupLocation(String pickupLocation) {
        this.pickupLocation = pickupLocation;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
