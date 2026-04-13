package com.petcarehub.pet.controller;

import com.petcarehub.common.dto.ApiResponse;
import com.petcarehub.pet.dto.PetRequestDTO;
import com.petcarehub.pet.dto.PetResponseDTO;
import com.petcarehub.pet.service.PetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/pets")
@CrossOrigin(origins = "http://localhost:3000")
@Tag(name = "Pet Management", description = "Endpoints for registering and viewing pet profiles")
public class PetController {

    private final PetService petService;

    public PetController(PetService petService) {
        this.petService = petService;
    }

    @Operation(summary = "Register a new pet")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<PetResponseDTO>> registerPet(
            @RequestParam("ownerId") Long ownerId,
            @Valid @ModelAttribute PetRequestDTO petRequestDTO,
            @RequestParam(value = "image", required = false) MultipartFile image) {

        PetResponseDTO pet = petService.registerPet(ownerId, petRequestDTO, image);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(pet, "Pet registered successfully"));
    }

    @Operation(summary = "Get all pets for a specific owner")
    @GetMapping
    public ResponseEntity<ApiResponse<List<PetResponseDTO>>> getPetsByOwner(@RequestParam("ownerId") Long ownerId) {
        List<PetResponseDTO> pets = petService.getPetsByOwner(ownerId);
        return ResponseEntity.ok(ApiResponse.success(pets, "Pets retrieved successfully"));
    }

    @Operation(summary = "Get all pets in the system (Doctor access)")
    @GetMapping("/all")
    public ResponseEntity<ApiResponse<List<PetResponseDTO>>> getAllPets() {
        List<PetResponseDTO> pets = petService.getAllPets();
        return ResponseEntity.ok(ApiResponse.success(pets, "All pets retrieved successfully"));
    }

    @Operation(summary = "Get pet by ID (restricted to owner)")
    @GetMapping("/{petId}")
    public ResponseEntity<ApiResponse<PetResponseDTO>> getPetById(
            @PathVariable Long petId,
            @RequestParam("ownerId") Long ownerId) {
        PetResponseDTO pet = petService.getPetById(petId, ownerId);
        return ResponseEntity.ok(ApiResponse.success(pet, "Pet details retrieved successfully"));
    }

    @Operation(summary = "Search pets by name for a specific owner")
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<PetResponseDTO>>> searchPets(
            @RequestParam("ownerId") Long ownerId,
            @RequestParam("name") String name) {
        List<PetResponseDTO> pets = petService.searchPets(ownerId, name);
        return ResponseEntity.ok(ApiResponse.success(pets, "Search results retrieved successfully"));
    }

    @Operation(summary = "Update an existing pet")
    @PutMapping(value = "/{petId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<PetResponseDTO>> updatePet(
            @PathVariable Long petId,
            @RequestParam("ownerId") Long ownerId,
            @Valid @ModelAttribute PetRequestDTO petRequestDTO,
            @RequestParam(value = "image", required = false) MultipartFile image) {

        PetResponseDTO updatedPet = petService.updatePet(petId, ownerId, petRequestDTO, image);
        return ResponseEntity.ok(ApiResponse.success(updatedPet, "Pet profile updated successfully"));
    }


}
