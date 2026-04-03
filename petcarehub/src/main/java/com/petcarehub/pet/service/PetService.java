package com.petcarehub.pet.service;

import com.petcarehub.pet.dto.PetRequestDTO;
import com.petcarehub.pet.dto.PetResponseDTO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface PetService {

    PetResponseDTO registerPet(Long userId, PetRequestDTO dto, MultipartFile image);

    List<PetResponseDTO> getPetsByOwner(Long userId);

    PetResponseDTO getPetById(Long petId, Long userId);

    List<PetResponseDTO> searchPets(Long userId, String name);

    PetResponseDTO updatePet(Long petId, Long userId, PetRequestDTO dto, MultipartFile image);

    List<PetResponseDTO> getAllPets();
}
