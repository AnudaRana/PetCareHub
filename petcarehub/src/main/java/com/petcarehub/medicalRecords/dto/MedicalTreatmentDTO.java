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

    //getters
    public Long getId() { return id; }

    public LocalDate getTreatmentDate() { return treatmentDate; }

    public String getDiagnosis() { return diagnosis; }

    public String getDoctorName() { return doctorName; }

    public String getDoctorId() { return doctorId; }

    public String getPrescriptions() { return prescriptions; }

    public String getPhysicalObservation() { return physicalObservation; }

    public Long getPetId() { return petId; }

    //Setters
    public void setId(Long id) { this.id = id; }

    public void setTreatmentDate(LocalDate treatmentDate) { this.treatmentDate = treatmentDate; }

    public void setDiagnosis(String diagnosis) { this.diagnosis = diagnosis; }

    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }

    public void setDoctorId(String doctorId) { this.doctorId = doctorId; }

    public void setPrescriptions(String prescriptions) { this.prescriptions = prescriptions; }

    public void setPhysicalObservation(String physicalObservation) { this.physicalObservation = physicalObservation; }

    public void setPetId(Long petId) { this.petId = petId; }

}
