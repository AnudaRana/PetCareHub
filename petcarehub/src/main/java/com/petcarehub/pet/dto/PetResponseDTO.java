package com.petcarehub.pet.dto;

import com.petcarehub.pet.entity.Pet;
import com.petcarehub.pet.entity.PetGender;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class PetResponseDTO {

    private Long petId;
    private String name;
    private String species;
    private String breed;
    private PetGender gender;
    private LocalDate dateOfBirth;
    private Double weight;
    private String knownIllnesses;
    private String petImagePath;
    private Long ownerId;
    private String ownerName;
    private LocalDateTime createdAt;

    public PetResponseDTO() {
    }

    public static PetResponseDTO fromEntity(Pet pet) {
        PetResponseDTO dto = new PetResponseDTO();
        dto.petId = pet.getPetId();
        dto.name = pet.getName();
        dto.species = pet.getSpecies();
        dto.breed = pet.getBreed();
        dto.gender = pet.getGender();
        dto.dateOfBirth = pet.getDateOfBirth();
        dto.weight = pet.getWeight();
        dto.knownIllnesses = pet.getKnownIllnesses();
        dto.petImagePath = pet.getPetImagePath();
        dto.ownerId = pet.getOwner().getUserId();
        dto.ownerName = pet.getOwner().getFirstName() + " " + pet.getOwner().getLastName();
        dto.createdAt = pet.getCreatedAt();
        return dto;
    }

    // Getters
    public Long getPetId() {
        return petId;
    }

    public String getName() {
        return name;
    }

    public String getSpecies() {
        return species;
    }

    public String getBreed() {
        return breed;
    }

    public PetGender getGender() {
        return gender;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public Double getWeight() {
        return weight;
    }

    public String getKnownIllnesses() {
        return knownIllnesses;
    }

    public String getPetImagePath() {
        return petImagePath;
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    // Setters
    public void setPetId(Long petId) {
        this.petId = petId;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setSpecies(String species) {
        this.species = species;
    }

    public void setBreed(String breed) {
        this.breed = breed;
    }

    public void setGender(PetGender gender) {
        this.gender = gender;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public void setWeight(Double weight) {
        this.weight = weight;
    }

    public void setKnownIllnesses(String knownIllnesses) {
        this.knownIllnesses = knownIllnesses;
    }

    public void setPetImagePath(String petImagePath) {
        this.petImagePath = petImagePath;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }

    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
