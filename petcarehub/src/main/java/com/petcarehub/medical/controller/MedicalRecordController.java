package com.petcarehub.medical.controller;

import com.petcarehub.medical.dto.MedicalTreatmentDTO;
import com.petcarehub.medical.service.MedicalTreatmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medical-records")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class MedicalRecordController {

    @Autowired
    private MedicalTreatmentService medicalTreatmentService;

    @GetMapping("/treatments/pet/{petId}")
    public ResponseEntity<List<MedicalTreatmentDTO>> getTreatmentsByPetId(@PathVariable Long petId) {
        return ResponseEntity.ok(medicalTreatmentService.getAllTreatmentsByPetId(petId));
    }

    @PostMapping("/treatments/pet/{petId}")
    public ResponseEntity<MedicalTreatmentDTO> addTreatment(@PathVariable Long petId, @RequestBody MedicalTreatmentDTO dto) {
        return ResponseEntity.ok(medicalTreatmentService.addTreatment(petId, dto));
    }

    @DeleteMapping("/treatments/{id}")
    public ResponseEntity<Void> deleteTreatment(@PathVariable Long id) {
        medicalTreatmentService.deleteTreatment(id);
        return ResponseEntity.noContent().build();
    }

}
