package com.petcarehub.medical.entity;

//import com.petcarehub.entity.Pet;
import com.petcarehub.pet.entity.Pet;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "medical_treatments")
public class MedicalTreatment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "treatment_date", nullable = false)
    private LocalDate treatmentDate;

    @Column(columnDefinition = "TEXT")
    private String diagnosis;

    @Column(name = "doctor_name", nullable = false)
    private String doctorName;

    @Column(name = "doctor_id", nullable = false)
    private String doctorId;

    @Column(name = "treatment_notes", columnDefinition = "TEXT")
    private String treatmentNotes;

    @Column(columnDefinition = "TEXT")
    private String prescriptions;

    @Column(name = "physical_observation", columnDefinition = "TEXT")
    private String physicalObservation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pet_id", nullable = false)
    private Pet pet;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public MedicalTreatment() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public LocalDate getTreatmentDate() { return treatmentDate; }
    public void setTreatmentDate(LocalDate treatmentDate) { this.treatmentDate = treatmentDate; }

    public String getDiagnosis() { return diagnosis; }
    public void setDiagnosis(String diagnosis) { this.diagnosis = diagnosis; }

    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }

    public String getDoctorId() { return doctorId; }
    public void setDoctorId(String doctorId) { this.doctorId = doctorId; }

    public String getTreatmentNotes() { return treatmentNotes; }
    public void setTreatmentNotes(String treatmentNotes) { this.treatmentNotes = treatmentNotes; }

    public String getPrescriptions() { return prescriptions; }
    public void setPrescriptions(String prescriptions) { this.prescriptions = prescriptions; }

    public String getPhysicalObservation() { return physicalObservation; }
    public void setPhysicalObservation(String physicalObservation) { this.physicalObservation = physicalObservation; }

    public Pet getPet() { return pet; }
    public void setPet(Pet pet) { this.pet = pet; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
