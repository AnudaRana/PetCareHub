package com.petcarehub.appointment.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.petcarehub.user.entity.User;
import com.petcarehub.pet.entity.Pet;
import jakarta.persistence.*;
import java.time.LocalDateTime;


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
    private String status = "AWAITING_PAYMENT";

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    @Column(nullable = false)
    private boolean updated = false;

    @Column(name = "cancellation_reason")
    private String cancellationReason;

    @Column(name = "cancelled_by")
    private String cancelledBy;


    public Appointment() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Pet getPet() {
        return pet;
    }

    public void setPet(Pet pet) {
        this.pet = pet;
    }

    public String getAppointmentType() {
        return appointmentType;
    }

    public void setAppointmentType(String appointmentType) {
        this.appointmentType = appointmentType;
    }

    public String getDoctor() {
        return doctor;
    }

    public void setDoctor(String doctor) {
        this.doctor = doctor;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getTimeSlot() {
        return timeSlot;
    }

    public void setTimeSlot(String timeSlot) {
        this.timeSlot = timeSlot;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public boolean isUpdated() {
        return updated;
    }

    public void setUpdated(boolean updated) {
        this.updated = updated;
    }

    public User getOwner() {
    return owner;
}

public void setOwner(User owner) {
    this.owner = owner;
}

public User getVet() {
    return vet;
}

public void setVet(User vet) {
    this.vet = vet;
}

public String getCancellationReason() {
    return cancellationReason;
}

public void setCancellationReason(String cancellationReason) {
    this.cancellationReason = cancellationReason;
}

public String getCancelledBy() {
    return cancelledBy;
}

public void setCancelledBy(String cancelledBy) {
    this.cancelledBy = cancelledBy;
}

public LocalDateTime getCreatedAt() {
    return createdAt;
}

public void setCreatedAt(LocalDateTime createdAt) {
    this.createdAt = createdAt;
}

public LocalDateTime getUpdatedAt() {
    return updatedAt;
}

public void setUpdatedAt(LocalDateTime updatedAt) {
    this.updatedAt = updatedAt;
}
}