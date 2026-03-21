package com.petcarehub.medicalRecords.controller;

import com.petcarehub.medicalRecords.dto.MedicalTreatmentDTO;
import com.petcarehub.medicalRecords.dto.VaccinationDTO;
import com.petcarehub.medicalRecords.service.MedicalTreatmentService;
import com.petcarehub.medicalRecords.service.VaccinationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medical-records")
@CrossOrigin(origins = "*") // Allow frontend requests
public class MedicalRecordController {

    @Autowired
    private MedicalTreatmentService medicalTreatmentService;

    @Autowired
    private VaccinationService vaccinationService;

    @GetMapping("/treatments/pet/{petId}")
    public ResponseEntity<List<MedicalTreatmentDTO>> getTreatmentsByPetId(@PathVariable Long petId) {
        return ResponseEntity.ok(medicalTreatmentService.getAllTreatmentsByPetId(petId));
    }

    @PostMapping("/treatments/pet/{petId}")
    public ResponseEntity<MedicalTreatmentDTO> addTreatment(@PathVariable Long petId, @RequestBody MedicalTreatmentDTO dto) {
        return ResponseEntity.ok(medicalTreatmentService.addTreatment(petId, dto));
    }

    @GetMapping("/vaccinations/pet/{petId}")
    public ResponseEntity<List<VaccinationDTO>> getVaccinationsByPetId(@PathVariable Long petId) {
        return ResponseEntity.ok(vaccinationService.getAllVaccinationsByPetId(petId));
    }

    @PostMapping("/vaccinations/pet/{petId}")
    public ResponseEntity<VaccinationDTO> addVaccination(@PathVariable Long petId, @RequestBody VaccinationDTO dto) {
        return ResponseEntity.ok(vaccinationService.addVaccination(petId, dto));
    }
}