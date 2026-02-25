// File: src/main/java/com/petcarehub/petcarehub/service/impl/PetServiceImpl.java
package com.petcarehub.petcarehub.service.impl;

import com.petcarehub.petcarehub.dto.PetRequestDTO;
import com.petcarehub.petcarehub.dto.PetResponseDTO;
import com.petcarehub.petcarehub.entity.Pet;
import com.petcarehub.petcarehub.entity.User;
import com.petcarehub.petcarehub.exception.PetNotFoundException;
import com.petcarehub.petcarehub.exception.UnauthorizedAccessException;
import com.petcarehub.petcarehub.repository.PetRepository;
import com.petcarehub.petcarehub.repository.UserRepository;
import com.petcarehub.petcarehub.service.PetService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PetServiceImpl implements PetService {

    private final PetRepository petRepository;
    private final UserRepository userRepository;

    @Value("${app.upload.dir:uploads/pets}")
    private String uploadDir;

    public PetServiceImpl(PetRepository petRepository, UserRepository userRepository) {
        this.petRepository = petRepository;
        this.userRepository = userRepository;
    }

    @Override
    public PetResponseDTO registerPet(Long userId, PetRequestDTO dto, MultipartFile image) {
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

        Pet pet = new Pet();
        pet.setName(dto.getName());
        pet.setSpecies(dto.getSpecies());
        pet.setBreed(dto.getBreed());
        pet.setGender(dto.getGender());
        pet.setDateOfBirth(dto.getDateOfBirth());
        pet.setWeight(dto.getWeight());
        pet.setKnownIllnesses(dto.getKnownIllnesses());
        pet.setOwner(owner);

        if (image != null && !image.isEmpty()) {
            String imagePath = saveImage(image);
            pet.setPetImagePath(imagePath);
        }

        Pet savedPet = petRepository.save(pet);
        return PetResponseDTO.fromEntity(savedPet);
    }

    @Override
    public List<PetResponseDTO> getPetsByOwner(Long userId) {
        return petRepository.findByOwner_UserId(userId)
                .stream()
                .map(PetResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public PetResponseDTO getPetById(Long petId, Long userId) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new PetNotFoundException(petId));

        if (!pet.getOwner().getUserId().equals(userId)) {
            throw new UnauthorizedAccessException(userId, petId);
        }

        return PetResponseDTO.fromEntity(pet);
    }

    @Override
    public List<PetResponseDTO> searchPets(Long userId, String name) {
        return petRepository.findByOwner_UserIdAndNameContainingIgnoreCase(userId, name)
                .stream()
                .map(PetResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }

    private String saveImage(MultipartFile image) {
        try {
            Path uploadPath = Paths.get(uploadDir);
            Files.createDirectories(uploadPath);

            String filename = UUID.randomUUID() + "_" + image.getOriginalFilename();
            Path filePath = uploadPath.resolve(filename);
            Files.copy(image.getInputStream(), filePath);

            return uploadDir + "/" + filename;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store image: " + e.getMessage(), e);
        }
    }
}
