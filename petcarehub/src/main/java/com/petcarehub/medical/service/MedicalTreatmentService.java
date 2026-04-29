package com.petcarehub.medical.service;

import com.petcarehub.medical.dto.MedicalTreatmentDTO;
import com.petcarehub.medical.entity.MedicalTreatment;
import com.petcarehub.medical.repository.MedicalTreatmentRepository;
import com.petcarehub.pet.entity.Pet;
import com.petcarehub.pet.repository.PetRepository;
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
        if (dto.getTreatmentDate() == null) {
            throw new IllegalArgumentException("treatmentDate is required and cannot be null or empty.");
        }
        if (dto.getDoctorName() == null || dto.getDoctorName().isBlank()) {
            throw new IllegalArgumentException("doctorName is required.");
        }
        if (dto.getDoctorId() == null || dto.getDoctorId().isBlank()) {
            throw new IllegalArgumentException("doctorId is required.");
        }
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

    public void deleteTreatment(Long id) {
        if (!medicalTreatmentRepository.existsById(id)) {
            throw new RuntimeException("Treatment not found");
        }
        medicalTreatmentRepository.deleteById(id);
    }
}
