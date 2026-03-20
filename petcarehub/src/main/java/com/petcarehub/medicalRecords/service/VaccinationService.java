package com.petcarehub.medicalRecords.service;

import com.petcarehub.medicalRecords.dto.VaccinationDTO;
import com.petcarehub.medicalRecords.entity.Vaccination;
import com.petcarehub.medicalRecords.repository.VaccinationReporsitory;
import com.petcarehub.petcarehub.entity.Pet;
import com.petcarehub.petcarehub.repository.PetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class VaccinationService {

    @Autowired
    private VaccinationReporsitory vaccinationRepository;

    @Autowired
    private PetRepository petRepository;

    public List<VaccinationDTO> getAllVaccinationsByPetId(Long petId) {
        return vaccinationRepository.findByPetPetIdOrderByVaccinationDateDesc(petId)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    public VaccinationDTO addVaccination(Long petId, VaccinationDTO dto) {
        Pet pet = petRepository.findById(petId).orElseThrow(() -> new RuntimeException("Pet not found"));
        Vaccination vaccination = new Vaccination();
        vaccination.setVaccinationDate(dto.getVaccinationDate());
        vaccination.setVaccine(dto.getVaccine());
        vaccination.setBooster(dto.getBooster());
        vaccination.setDoctorName(dto.getDoctorName());
        vaccination.setDoctorId(dto.getDoctorId());
        vaccination.setPet(pet);

        Vaccination saved = vaccinationRepository.save(vaccination);
        return mapToDTO(saved);
    }

    private VaccinationDTO mapToDTO(Vaccination vaccination) {
        VaccinationDTO dto = new VaccinationDTO();
        dto.setId(vaccination.getId());
        dto.setVaccinationDate(vaccination.getVaccinationDate());
        dto.setVaccine(vaccination.getVaccine());
        dto.setBooster(vaccination.getBooster());
        dto.setDoctorName(vaccination.getDoctorName());
        dto.setDoctorId(vaccination.getDoctorId());
        dto.setPetId(vaccination.getPet().getPetId());
        return dto;
    }
}
