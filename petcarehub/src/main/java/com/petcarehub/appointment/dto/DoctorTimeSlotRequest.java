package com.petcarehub.appointment.dto;

/**
 * Inbound DTO for creating or updating a doctor time slot.
 */
public class DoctorTimeSlotRequest {

    // Time string, e.g. "09:00 AM" or "14:30"
    private String timeSlot;

    // Optional human-readable label
    private String label;

    // Default no-args constructor
    public DoctorTimeSlotRequest() {}

    // Returns the requested time slot string
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
