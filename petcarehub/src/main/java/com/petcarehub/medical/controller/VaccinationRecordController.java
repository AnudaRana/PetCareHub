package com.petcarehub.medical.controller;

import com.petcarehub.medical.dto.VaccinationRecordDTO;
import com.petcarehub.medical.service.VaccinationRecordService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medical-records")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class VaccinationRecordController {

    private final VaccinationRecordService vaccinationRecordService;

    public VaccinationRecordController(VaccinationRecordService vaccinationRecordService) {
        this.vaccinationRecordService = vaccinationRecordService;
    }

    @GetMapping("/vaccinations/pet/{petId}")
    public ResponseEntity<List<VaccinationRecordDTO>> getVaccinationsByPetId(@PathVariable Long petId) {
        return ResponseEntity.ok(vaccinationRecordService.getVaccinationsByPetId(petId));
    }

    @PostMapping("/vaccinations/pet/{petId}")
    public ResponseEntity<VaccinationRecordDTO> addVaccination(@PathVariable Long petId,
                                                               @RequestBody VaccinationRecordDTO dto) {
        return ResponseEntity.ok(vaccinationRecordService.addVaccination(petId, dto));
    }
}
