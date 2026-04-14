package com.petcarehub.appointment.entity;

import com.petcarehub.user.entity.User;
import jakarta.persistence.*;

/**
 * Represents a time slot that a specific veterinarian has made available for appointments.
 * Each slot belongs to exactly one vet; duplicate (vetId + timeSlot) pairs are prevented
 * at the database level via a unique constraint.
 */
@Entity
@Table(
    name = "doctor_time_slots",
    uniqueConstraints = @UniqueConstraint(columnNames = {"vet_id", "time_slot"})
)
public class DoctorTimeSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // The veterinarian who owns this slot
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "vet_id", nullable = false)
    private User vet;

    // Time string such as "09:00 AM", "02:30 PM"
    @Column(name = "time_slot", nullable = false, length = 20)
    private String timeSlot;

    // Optional human-readable label for the slot (e.g. "Morning Consultation")
    @Column(name = "label", length = 100)
    private String label;

    // --- Constructors ---

    public DoctorTimeSlot() {}

    // --- Getters & Setters ---

    // Returns the primary key of this time slot record
    public Long getId() {
        return id;
    }

    // Sets the primary key
    public void setId(Long id) {
        this.id = id;
    }

    // Returns the veterinarian who owns this slot
    public User getVet() {
        return vet;
    }

    // Sets the owning veterinarian
    public void setVet(User vet) {
        this.vet = vet;
    }

    // Returns the time string for this slot (e.g. "09:00 AM")
    public String getTimeSlot() {
        return timeSlot;
    }

    // Sets the time string for this slot
    public void setTimeSlot(String timeSlot) {
        this.timeSlot = timeSlot;
    }

    // Returns the optional display label for this slot
    public String getLabel() {
        return label;
    }

    // Sets the optional display label
    public void setLabel(String label) {
        this.label = label;
    }
}
