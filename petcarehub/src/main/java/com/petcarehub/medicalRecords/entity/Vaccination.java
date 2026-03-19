package com.petcarehub.medicalRecords.entity;

import com.petcarehub.petcarehub.entity.Pet;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "vaccinations")
public class Vaccination {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "vaccination_date", nullable = false)
    private LocalDate vaccinationDate;

    @Column(nullable = false)
    private String vaccine;

    @Column(nullable = false)
    private String booster;

    @Column(name = "doctor_name", nullable = false)
    private String doctorName;

    @Column(name = "doctor_id", nullable = false)
    private String doctorId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pet_id", nullable = false)
    private Pet pet;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Vaccination() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDate getVaccinationDate() { return vaccinationDate; }
    public void setVaccinationDate(LocalDate vaccinationDate) { this.vaccinationDate = vaccinationDate; }

    public String getVaccine() { return vaccine; }
    public void setVaccine(String vaccine) { this.vaccine = vaccine; }

    public String getBooster() { return booster; }
    public void setBooster(String booster) { this.booster = booster; }

    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }

    public String getDoctorId() { return doctorId; }
    public void setDoctorId(String doctorId) { this.doctorId = doctorId; }

    public Pet getPet() { return pet; }
    public void setPet(Pet pet) { this.pet = pet; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
