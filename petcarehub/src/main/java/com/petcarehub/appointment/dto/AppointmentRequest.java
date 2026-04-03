package com.petcarehub.appointment.dto;

public class AppointmentRequest {
    private Long userId;
    private Long petId;
    private String appointmentType;
    private String doctor;
    private String date;
    private String timeSlot;
    private double price;
    private String notes;
    private Long vetId;


    // Default no-args constructor
    public AppointmentRequest() {
    }

    // Returns the ID of the user making the appointment
    public Long getUserId() {
        return userId;
    }

    // Sets the user ID
    public void setUserId(Long userId) {
        this.userId = userId;
    }

    // Returns the ID of the pet for this appointment
    public Long getPetId() {
        return petId;
    }

    // Sets the pet ID
    public void setPetId(Long petId) {
        this.petId = petId;
    }

    // Returns the type of appointment (e.g. checkup, vaccination)
    public String getAppointmentType() {
        return appointmentType;
    }

    // Sets the appointment type
    public void setAppointmentType(String appointmentType) {
        this.appointmentType = appointmentType;
    }

    // Returns the name of the doctor
    public String getDoctor() {
        return doctor;
    }

    // Sets the doctor name
    public void setDoctor(String doctor) {
        this.doctor = doctor;
    }

    // Returns the appointment date
    public String getDate() {
        return date;
    }

    // Sets the appointment date
    public void setDate(String date) {
        this.date = date;
    }

    // Returns the selected time slot
    public String getTimeSlot() {
        return timeSlot;
    }

    // Sets the time slot
    public void setTimeSlot(String timeSlot) {
        this.timeSlot = timeSlot;
    }

    // Returns the price of the appointment
    public double getPrice() {
        return price;
    }

    // Sets the price
    public void setPrice(double price) {
        this.price = price;
    }

    // Returns any additional notes for the appointment
    public String getNotes() {
        return notes;
    }

    // Sets the notes
    public void setNotes(String notes) {
        this.notes = notes;
    }

    // Returns the ID of the assigned vet
    public Long getVetId() {
        return vetId;
    }

    // Sets the vet ID
    public void setVetId(Long vetId) {
        this.vetId = vetId;
    }


}
