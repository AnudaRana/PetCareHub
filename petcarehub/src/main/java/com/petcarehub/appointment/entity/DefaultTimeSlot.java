package com.petcarehub.appointment.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "default_time_slots")
public class DefaultTimeSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "time_slot", nullable = false, length = 20)
    private String timeSlot;

    @Column(name = "label", length = 100)
    private String label;

    public DefaultTimeSlot() {}

    public DefaultTimeSlot(String timeSlot, String label) {
        this.timeSlot = timeSlot;
        this.label = label;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTimeSlot() { return timeSlot; }
    public void setTimeSlot(String timeSlot) { this.timeSlot = timeSlot; }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }
}
