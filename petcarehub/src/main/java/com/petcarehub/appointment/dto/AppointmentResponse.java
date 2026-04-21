package com.petcarehub.appointment.dto;

/**
 * Safe, flat DTO returned by the owner appointments endpoint.
 * Contains no nested entity references — eliminates all serialization issues.
 */
public class AppointmentResponse {

    private Long id;
    private String appointmentType;
    private String doctor;
    private String date;
    private String timeSlot;
    private double price;
    private String notes;
    private String status;
    private boolean updated;
    private String cancellationReason;
    private String cancelledBy;

    // Payment fields
    private boolean paid;
    private String paymentStatus;

    // Pet fields (flat)
    private Long petId;
    private String petName;
    private String petSpecies;

    // Owner fields (flat)
    private Long ownerId;
    private String ownerFirstName;
    private String ownerLastName;

    // Vet fields (flat)
    private Long vetId;
    private String vetFirstName;
    private String vetLastName;

    public AppointmentResponse() {
    }

    // ── Getters ──────────────────────────────────────────────────────────────

    public Long getId() {
        return id;
    }

    public String getAppointmentType() {
        return appointmentType;
    }

    public String getDoctor() {
        return doctor;
    }

    public String getDate() {
        return date;
    }

    public String getTimeSlot() {
        return timeSlot;
    }

    public double getPrice() {
        return price;
    }

    public String getNotes() {
        return notes;
    }

    public String getStatus() {
        return status;
    }

    public boolean isUpdated() {
        return updated;
    }

    public String getCancellationReason() {
        return cancellationReason;
    }

    public String getCancelledBy() {
        return cancelledBy;
    }

    public boolean isPaid() {
        return paid;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public Long getPetId() {
        return petId;
    }

    public String getPetName() {
        return petName;
    }

    public String getPetSpecies() {
        return petSpecies;
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public String getOwnerFirstName() {
        return ownerFirstName;
    }

    public String getOwnerLastName() {
        return ownerLastName;
    }

    public Long getVetId() {
        return vetId;
    }

    public String getVetFirstName() {
        return vetFirstName;
    }

    public String getVetLastName() {
        return vetLastName;
    }

    // ── Setters ──────────────────────────────────────────────────────────────

    public void setId(Long id) {
        this.id = id;
    }

    public void setAppointmentType(String appointmentType) {
        this.appointmentType = appointmentType;
    }

    public void setDoctor(String doctor) {
        this.doctor = doctor;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public void setTimeSlot(String timeSlot) {
        this.timeSlot = timeSlot;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setUpdated(boolean updated) {
        this.updated = updated;
    }

    public void setCancellationReason(String cancellationReason) {
        this.cancellationReason = cancellationReason;
    }

    public void setCancelledBy(String cancelledBy) {
        this.cancelledBy = cancelledBy;
    }

    public void setPaid(boolean paid) {
        this.paid = paid;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public void setPetId(Long petId) {
        this.petId = petId;
    }

    public void setPetName(String petName) {
        this.petName = petName;
    }

    public void setPetSpecies(String petSpecies) {
        this.petSpecies = petSpecies;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }

    public void setOwnerFirstName(String ownerFirstName) {
        this.ownerFirstName = ownerFirstName;
    }

    public void setOwnerLastName(String ownerLastName) {
        this.ownerLastName = ownerLastName;
    }

    public void setVetId(Long vetId) {
        this.vetId = vetId;
    }

    public void setVetFirstName(String vetFirstName) {
        this.vetFirstName = vetFirstName;
    }

    public void setVetLastName(String vetLastName) {
        this.vetLastName = vetLastName;
    }
}