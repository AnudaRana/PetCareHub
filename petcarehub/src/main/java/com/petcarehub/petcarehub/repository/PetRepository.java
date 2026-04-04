package com.petcarehub.petcarehub.repository;

import com.petcarehub.petcarehub.entity.Pet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PetRepository extends JpaRepository<Pet, Long> {
    List<Pet> findByOwner_UserIdOrderByNameAsc(Long ownerId);
    Optional<Pet> findByPetIdAndOwner_UserId(Long petId, Long ownerId);
}
