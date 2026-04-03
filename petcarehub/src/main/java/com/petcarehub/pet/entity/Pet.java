package com.petcarehub.pet.entity;

import com.petcarehub.pet.entity.PetGender;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.petcarehub.user.entity.User;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "pets")
@NamedQueries({
        @NamedQuery(name = "pets", query = "select p from Pet p")
})
public class Pet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "pet_id")
    private Long petId;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "species", nullable = false, length = 100)
    private String species;

    @Column(name = "breed", length = 100)
    private String breed;

    @Enumerated(EnumType.STRING)
    @Column(name = "gender")
    private PetGender gender;

    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;

    @Column(name = "weight")
    private Double weight;

    @Column(name = "known_illnesses", columnDefinition = "TEXT")
    private String knownIllnesses;

    @Column(name = "pet_image_path")
    private String petImagePath;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    @JsonIgnoreProperties(value = {"password", "roles"}, allowSetters = true)
    private User owner;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Pet() {
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

    public User getOwner() {
        return owner;
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

    public void setOwner(User owner) {
        this.owner = owner;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
