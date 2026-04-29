package com.petcarehub.appointment.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "appointment_types")
public class AppointmentType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name; // e.g. "Vaccination", "Operation", "Grooming"

    @Column(nullable = false)
    private double price;

    @Column(nullable = false)
    private boolean requiresVet = true;

    @Column(nullable = false)
    private String icon; // e.g. "💉", "🔪", "🛁"

    public AppointmentType() {}

    public AppointmentType(String name, double price, boolean requiresVet, String icon) {
        this.name = name;
        this.price = price;
        this.requiresVet = requiresVet;
        this.icon = icon;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }

    public boolean isRequiresVet() { return requiresVet; }
    public void setRequiresVet(boolean requiresVet) { this.requiresVet = requiresVet; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }
}
