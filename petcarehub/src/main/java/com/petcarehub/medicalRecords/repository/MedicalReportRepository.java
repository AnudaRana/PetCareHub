package com.petcarehub.medicalRecords.repository;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/reports")
public class MedicalReportRepository {
    @PostMapping
    public MedicalReport createReport(@RequestBody MedicalReportDTO dto){
        return service.createReport(dto);
    }
}

