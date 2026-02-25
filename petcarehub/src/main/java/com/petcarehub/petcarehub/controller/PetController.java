// File: src/main/java/com/petcarehub/petcarehub/controller/PetController.java
package com.petcarehub.petcarehub.controller;

import com.petcarehub.petcarehub.dto.ApiResponse;
import com.petcarehub.petcarehub.dto.PetRequestDTO;
import com.petcarehub.petcarehub.dto.PetResponseDTO;
import com.petcarehub.petcarehub.service.PetService;
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
}
