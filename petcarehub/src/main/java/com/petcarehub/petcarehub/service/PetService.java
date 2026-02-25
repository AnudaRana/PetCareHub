// File: src/main/java/com/petcarehub/petcarehub/service/PetService.java
package com.petcarehub.petcarehub.service;

import com.petcarehub.petcarehub.dto.PetRequestDTO;
import com.petcarehub.petcarehub.dto.PetResponseDTO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface PetService {

    PetResponseDTO registerPet(Long userId, PetRequestDTO dto, MultipartFile image);

    List<PetResponseDTO> getPetsByOwner(Long userId);

    PetResponseDTO getPetById(Long petId, Long userId);

    List<PetResponseDTO> searchPets(Long userId, String name);
}
