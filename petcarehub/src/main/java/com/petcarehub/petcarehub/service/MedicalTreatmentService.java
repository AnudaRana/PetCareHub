package com.petcarehub.medicalRecords.service;

import com.petcarehub.medicalRecords.dto.MedicalTreatmentDTO;
import com.petcarehub.medicalRecords.entity.MedicalTreatment;
import com.petcarehub.medicalRecords.repository.MedicalTreatmentRepository;
import com.petcarehub.petcarehub.entity.Pet;
import com.petcarehub.petcarehub.repository.PetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MedicalTreatmentService {

    @Autowired
    private MedicalTreatmentRepository medicalTreatmentRepository;

    @Autowired
    private PetRepository petRepository;

    public List<MedicalTreatmentDTO> getAllTreatmentsByPetId(Long petId) {
        return medicalTreatmentRepository.findByPetPetIdOrderByTreatmentDateDesc(petId)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public MedicalTreatmentDTO addTreatment(Long petId, MedicalTreatmentDTO dto) {
        Pet pet = petRepository.findById(petId).orElseThrow(() -> new RuntimeException("Pet not found"));
        MedicalTreatment treatment = new MedicalTreatment();
        treatment.setTreatmentDate(dto.getTreatmentDate());
        treatment.setDiagnosis(dto.getDiagnosis());
        treatment.setDoctorName(dto.getDoctorName());
        treatment.setDoctorId(dto.getDoctorId());
        treatment.setTreatmentNotes(dto.getTreatmentNotes());
        treatment.setPrescriptions(dto.getPrescriptions());
        treatment.setPhysicalObservation(dto.getPhysicalObservation());
        treatment.setPet(pet);

        MedicalTreatment saved = medicalTreatmentRepository.save(treatment);
        return mapToDTO(saved);
    }

    private MedicalTreatmentDTO mapToDTO(MedicalTreatment treatment) {
        MedicalTreatmentDTO dto = new MedicalTreatmentDTO();
        dto.setId(treatment.getId());
        dto.setTreatmentDate(treatment.getTreatmentDate());
        dto.setDiagnosis(treatment.getDiagnosis());
        dto.setDoctorName(treatment.getDoctorName());
        dto.setDoctorId(treatment.getDoctorId());
        dto.setTreatmentNotes(treatment.getTreatmentNotes());
        dto.setPrescriptions(treatment.getPrescriptions());
        dto.setPhysicalObservation(treatment.getPhysicalObservation());
        dto.setPetId(treatment.getPet().getPetId());
        return dto;
    }
}
