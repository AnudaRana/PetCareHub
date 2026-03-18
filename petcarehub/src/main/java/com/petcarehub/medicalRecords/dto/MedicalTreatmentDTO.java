package com.petcarehub.medicalRecords.dto;

import java.time.LocalDate;

public class MedicalTreatmentDTO {

    private Long id;
    private LocalDate treatmentDate;
    private String diagnosis;
    private String doctorName;
    private String doctorId;
    private String prescriptions;
    private String physicalObservation;
    private Long petId;

    public MedicalTreatmentDTO() {}

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

    public String getPrescriptions() { return prescriptions; }
    public void setPrescriptions(String prescriptions) { this.prescriptions = prescriptions; }

    public String getPhysicalObservation() { return physicalObservation; }
    public void setPhysicalObservation(String physicalObservation) { this.physicalObservation = physicalObservation; }

    public Long getPetId() { return petId; }
    public void setPetId(Long petId) { this.petId = petId; }
}
