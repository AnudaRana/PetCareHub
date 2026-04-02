package com.petcarehub.petcarehub.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@Entity
@Table(name = "appointments")
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties(value = {"password", "roles"}, allowSetters = true)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "pet_id", nullable = false)
    @JsonIgnoreProperties({"owner"})
    private Pet pet;

    @ManyToOne
    @JoinColumn(name = "owner_id")
    @JsonIgnoreProperties(value = {"password", "roles"}, allowSetters = true)
    private User owner;

    @ManyToOne
    @JoinColumn(name = "vet_id")
    @JsonIgnoreProperties(value = {"password", "roles"}, allowSetters = true)
    private User vet;


    private String appointmentType;
    private String doctor;
    private String date;
    private String timeSlot;
    private double price;
    private String notes;

    @Column(nullable = false)
    private String status = "UPCOMING";

    @Column(nullable = false)
    private boolean updated = false;

    @Column(name = "cancellation_reason")
    private String cancellationReason;

    @Column(name = "cancelled_by")
    private String cancelledBy;


    // Default no-args constructor
    public Appointment() {
    }

    // Returns the appointment ID
    public Long getId() {
        return id;
    }

    // Sets the appointment ID
    public void setId(Long id) {
        this.id = id;
    }

    // Returns the user who booked the appointment
    public User getUser() {
        return user;
    }

    // Sets the user
    public void setUser(User user) {
        this.user = user;
    }

    // Returns the pet associated with this appointment
    public Pet getPet() {
        return pet;
    }

    // Sets the pet
    public void setPet(Pet pet) {
        this.pet = pet;
    }

    // Returns the type of appointment
    public String getAppointmentType() {
        return appointmentType;
    }

    // Sets the appointment type
    public void setAppointmentType(String appointmentType) {
        this.appointmentType = appointmentType;
    }

    // Returns the doctor's name
    public String getDoctor() {
        return doctor;
    }

    // Sets the doctor's name
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

    // Returns the booked time slot
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

    // Returns any additional notes
    public String getNotes() {
        return notes;
    }

    // Sets the notes
    public void setNotes(String notes) {
        this.notes = notes;
    }

    // Returns the current status (UPCOMING, CANCELLED, etc.)
    public String getStatus() {
        return status;
    }

    // Sets the appointment status
    public void setStatus(String status) {
        this.status = status;
    }

    // Returns true if this appointment has been modified after creation
    public boolean isUpdated() {
        return updated;
    }

    // Marks the appointment as updated
    public void setUpdated(boolean updated) {
        this.updated = updated;
    }

    // Returns the owner (pet owner) of the appointment
    public User getOwner() {
    return owner;
}

// Sets the owner
public void setOwner(User owner) {
    this.owner = owner;
}

// Returns the vet assigned to this appointment
public User getVet() {
    return vet;
}

// Sets the vet
public void setVet(User vet) {
    this.vet = vet;
}

// Returns the reason provided for cancellation
public String getCancellationReason() {
    return cancellationReason;
}

// Sets the cancellation reason
public void setCancellationReason(String cancellationReason) {
    this.cancellationReason = cancellationReason;
}

// Returns who cancelled the appointment (OWNER or VET)
public String getCancelledBy() {
    return cancelledBy;
}

// Sets who cancelled the appointment
public void setCancelledBy(String cancelledBy) {
    this.cancelledBy = cancelledBy;
}
}