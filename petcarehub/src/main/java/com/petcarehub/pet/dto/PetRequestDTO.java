package com.petcarehub.pet.dto;

import com.petcarehub.pet.entity.PetGender;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class PetRequestDTO {

    @NotBlank(message = "Pet name is required")
    private String name;

    @NotBlank(message = "Species is required")
    private String species;

    private String breed;

    private PetGender gender;

    @NotNull(message = "Date of birth is required")
    private LocalDate dateOfBirth;

    private Double weight;

    private String knownIllnesses;

    public PetRequestDTO() {
    }

    // Getters
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

    // Setters
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
}
