package com.petcarehub.appointment.dto;

/**
 * Outbound DTO returned from the doctor time slot API endpoints.
 */
public class DoctorTimeSlotResponse {

    private Long id;
    private Long vetId;
    private String vetName;
    private String timeSlot;
    private String label;

    // Default no-args constructor
    public DoctorTimeSlotResponse() {}

    // Returns the unique ID of this time slot record
    public Long getId() {
        return id;
    }

    // Sets the time slot record ID
    public void setId(Long id) {
        this.id = id;
    }

    // Returns the ID of the owning vet
    public Long getVetId() {
        return vetId;
    }

    // Sets the vet ID
    public void setVetId(Long vetId) {
        this.vetId = vetId;
    }

    // Returns the full name of the vet (firstName + lastName)
    public String getVetName() {
        return vetName;
    }

    // Sets the vet's full name
    public void setVetName(String vetName) {
        this.vetName = vetName;
    }

    // Returns the time slot string (e.g. "09:00 AM")
    public String getTimeSlot() {
        return timeSlot;
    }

    // Sets the time slot string
    public void setTimeSlot(String timeSlot) {
        this.timeSlot = timeSlot;
    }

    // Returns the optional display label
    public String getLabel() {
        return label;
    }

    // Sets the optional display label
    public void setLabel(String label) {
        this.label = label;
    }
}
