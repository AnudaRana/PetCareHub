package com.petcarehub.pet.service.impl;

import com.petcarehub.pet.dto.PetRequestDTO;
import com.petcarehub.pet.dto.PetResponseDTO;
import com.petcarehub.exception.PetNotFoundException;
import com.petcarehub.exception.UnauthorizedAccessException;
import com.petcarehub.pet.entity.Pet;
import com.petcarehub.pet.repository.PetRepository;
import com.petcarehub.pet.service.PetService;
import com.petcarehub.user.entity.User;
import com.petcarehub.user.repository.UserRepository;
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
    public PetResponseDTO updatePet(Long petId, Long userId, PetRequestDTO dto, MultipartFile image) {
        // Find pet
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new PetNotFoundException(petId));

        // Check authorization
        if (!pet.getOwner().getUserId().equals(userId)) {
            throw new UnauthorizedAccessException(userId, petId);
        }

        // Update fields
        pet.setName(dto.getName());
        pet.setSpecies(dto.getSpecies());
        pet.setBreed(dto.getBreed());
        pet.setGender(dto.getGender());
        pet.setDateOfBirth(dto.getDateOfBirth());
        pet.setWeight(dto.getWeight());
        pet.setKnownIllnesses(dto.getKnownIllnesses());

        // Update image if provided
        if (image != null && !image.isEmpty()) {
            String imagePath = saveImage(image);
            pet.setPetImagePath(imagePath);
        }

        // Save and return
        Pet updatedPet = petRepository.save(pet);
        return PetResponseDTO.fromEntity(updatedPet);
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

    @Override
    public List<PetResponseDTO> getAllPets() {
        return petRepository.findAll()
                .stream()
                .map(PetResponseDTO::fromEntity)
                .collect(Collectors.toList());
    }
}
