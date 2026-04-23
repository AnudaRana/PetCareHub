package com.petcarehub.medical.entity;

import com.petcarehub.pet.entity.Pet;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "vaccinations")
public class VaccinationRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "vaccination_date", nullable = false)
    private LocalDate vaccinationDate;

    @Column(name = "vaccination_name", nullable = false)
    private String vaccinationName;

    @Column(nullable = false)
    private String dose;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "doctor_name", nullable = false)
    private String doctorName;

    @Column(name = "doctor_id", nullable = false)
    private String doctorId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pet_id", nullable = false)
    private Pet pet;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "reminder_status")
    private String reminderStatus;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public VaccinationRecord() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getVaccinationDate() {
        return vaccinationDate;
    }

    public void setVaccinationDate(LocalDate vaccinationDate) {
        this.vaccinationDate = vaccinationDate;
    }

    public String getVaccinationName() {
        return vaccinationName;
    }

    public void setVaccinationName(String vaccinationName) {
        this.vaccinationName = vaccinationName;
    }

    public String getDose() {
        return dose;
    }

    public void setDose(String dose) {
        this.dose = dose;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getDoctorName() {
        return doctorName;
    }

    public void setDoctorName(String doctorName) {
        this.doctorName = doctorName;
    }

    public String getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(String doctorId) {
        this.doctorId = doctorId;
    }

    public Pet getPet() {
        return pet;
    }

    public void setPet(Pet pet) {
        this.pet = pet;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public String getReminderStatus() {
        return reminderStatus;
    }

    public void setReminderStatus(String reminderStatus) {
        this.reminderStatus = reminderStatus;
    }
}
