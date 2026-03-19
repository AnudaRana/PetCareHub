package com.petcarehub.medicalRecords.dto;

import java.time.LocalDate;

public class VaccinationDTO {

    private Long id;
    private LocalDate vaccinationDate;
    private String vaccine;
    private String booster;
    private String doctorName;
    private String doctorId;
    private Long petId;

    public VaccinationDTO() {}

    //Getters

    public Long getId() { return id; }

    public LocalDate getVaccinationDate() { return vaccinationDate; }

    public String getVaccine() { return vaccine; }

    public String getBooster() { return booster; }

    public String getDoctorName() { return doctorName; }

    public String getDoctorId() { return doctorId; }

    public Long getPetId() { return petId; }

    //Setters
    public void setId(Long id) { this.id = id; }

    public void setVaccinationDate(LocalDate vaccinationDate) { this.vaccinationDate = vaccinationDate; }

    public void setVaccine(String vaccine) { this.vaccine = vaccine; }

    public void setBooster(String booster) { this.booster = booster; }

    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }

    public void setDoctorId(String doctorId) { this.doctorId = doctorId; }

    public void setPetId(Long petId) { this.petId = petId; }

}
