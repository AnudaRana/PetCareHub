package com.petcarehub.medical.service;

import com.petcarehub.medical.dto.VaccinationRecordDTO;
import com.petcarehub.medical.entity.VaccinationRecord;
import com.petcarehub.medical.repository.VaccinationRecordRepository;
import com.petcarehub.pet.entity.Pet;
import com.petcarehub.pet.repository.PetRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class VaccinationRecordService {

    private final VaccinationRecordRepository vaccinationRecordRepository;
    private final PetRepository petRepository;

    public VaccinationRecordService(VaccinationRecordRepository vaccinationRecordRepository,
                                    PetRepository petRepository) {
        this.vaccinationRecordRepository = vaccinationRecordRepository;
        this.petRepository = petRepository;
    }

    public List<VaccinationRecordDTO> getVaccinationsByPetId(Long petId) {
        return vaccinationRecordRepository.findByPetPetIdOrderByVaccinationDateDesc(petId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public VaccinationRecordDTO addVaccination(Long petId, VaccinationRecordDTO dto) {
        if (dto.getVaccinationDate() == null) {
            throw new IllegalArgumentException("vaccinationDate is required and cannot be null.");
        }
        if (dto.getVaccinationName() == null || dto.getVaccinationName().isBlank()) {
            throw new IllegalArgumentException("vaccinationName is required.");
        }
        if (dto.getDose() == null || dto.getDose().isBlank()) {
            throw new IllegalArgumentException("dose is required.");
        }
        if (dto.getDoctorName() == null || dto.getDoctorName().isBlank()) {
            throw new IllegalArgumentException("doctorName is required.");
        }
        if (dto.getDoctorId() == null || dto.getDoctorId().isBlank()) {
            throw new IllegalArgumentException("doctorId is required.");
        }

        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new RuntimeException("Pet not found"));

        VaccinationRecord vaccination = new VaccinationRecord();
        vaccination.setVaccinationDate(dto.getVaccinationDate());
        vaccination.setVaccinationName(dto.getVaccinationName());
        vaccination.setDose(dto.getDose());
        vaccination.setDescription(dto.getDescription());
        vaccination.setDoctorName(dto.getDoctorName());
        vaccination.setDoctorId(dto.getDoctorId());
        vaccination.setPet(pet);

        VaccinationRecord saved = vaccinationRecordRepository.save(vaccination);
        return mapToDTO(saved);
    }

    private VaccinationRecordDTO mapToDTO(VaccinationRecord vaccination) {
        VaccinationRecordDTO dto = new VaccinationRecordDTO();
        dto.setId(vaccination.getId());
        dto.setVaccinationDate(vaccination.getVaccinationDate());
        dto.setVaccinationName(vaccination.getVaccinationName());
        dto.setDose(vaccination.getDose());
        dto.setDescription(vaccination.getDescription());
        dto.setDoctorName(vaccination.getDoctorName());
        dto.setDoctorId(vaccination.getDoctorId());
        dto.setPetId(vaccination.getPet().getPetId());
        return dto;
    }
}
