package com.petcarehub.medical.service;

import com.petcarehub.medical.dto.VaccinationRecordDTO;
import com.petcarehub.medical.entity.VaccinationRecord;
import com.petcarehub.medical.repository.VaccinationRecordRepository;
import com.petcarehub.pet.entity.Pet;
import com.petcarehub.pet.repository.PetRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;
import java.time.LocalDate;

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
        vaccination.setDueDate(dto.getDueDate());
        vaccination.setReminderStatus(dto.getReminderStatus() != null ? dto.getReminderStatus() : "PENDING");
        vaccination.setPet(pet);

        VaccinationRecord saved = vaccinationRecordRepository.save(vaccination);
        return mapToDTO(saved);
    }

    public VaccinationRecordDTO updateVaccination(Long id, VaccinationRecordDTO dto) {
        VaccinationRecord vaccination = vaccinationRecordRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vaccination not found"));

        if (dto.getVaccinationDate() != null) vaccination.setVaccinationDate(dto.getVaccinationDate());
        if (dto.getVaccinationName() != null && !dto.getVaccinationName().isBlank()) vaccination.setVaccinationName(dto.getVaccinationName());
        if (dto.getDose() != null && !dto.getDose().isBlank()) vaccination.setDose(dto.getDose());
        if (dto.getDescription() != null) vaccination.setDescription(dto.getDescription());
        if (dto.getDoctorName() != null && !dto.getDoctorName().isBlank()) vaccination.setDoctorName(dto.getDoctorName());
        if (dto.getDoctorId() != null && !dto.getDoctorId().isBlank()) vaccination.setDoctorId(dto.getDoctorId());
        
        // Handle due date changes and potentially reset reminder status
        if (dto.getDueDate() != null) {
            if (!dto.getDueDate().equals(vaccination.getDueDate())) {
                vaccination.setReminderStatus("PENDING");
            }
            vaccination.setDueDate(dto.getDueDate());
        } else {
            vaccination.setDueDate(null);
            vaccination.setReminderStatus("PENDING");
        }

        VaccinationRecord updated = vaccinationRecordRepository.save(vaccination);
        return mapToDTO(updated);
    }

    public List<VaccinationRecordDTO> getUpcomingVaccinations(int daysAhead) {
        LocalDate today = LocalDate.now();
        LocalDate futureDate = today.plusDays(daysAhead);
        
        return vaccinationRecordRepository.findByDueDateLessThanEqualAndReminderStatus(futureDate, "PENDING")
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<VaccinationRecordDTO> getUpcomingVaccinationsByOwner(Long userId, int daysAhead) {
        LocalDate today = LocalDate.now();
        LocalDate futureDate = today.plusDays(daysAhead);

        return vaccinationRecordRepository
                .findByPet_Owner_UserIdAndDueDateLessThanEqualAndReminderStatus(userId, futureDate, "PENDING")
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
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
        dto.setDueDate(vaccination.getDueDate());
        dto.setReminderStatus(vaccination.getReminderStatus());
        if (vaccination.getPet() != null) {
            dto.setPetId(vaccination.getPet().getPetId());
            dto.setPetName(vaccination.getPet().getName());
            dto.setPetSpecies(vaccination.getPet().getSpecies());
        }
        return dto;
    }
}
