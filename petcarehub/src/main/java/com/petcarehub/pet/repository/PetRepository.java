package com.petcarehub.pet.repository;

import com.petcarehub.pet.entity.Pet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PetRepository extends JpaRepository<Pet, Long> {

    List<Pet> findByOwner_UserId(Long userId);

    List<Pet> findByOwner_UserIdAndNameContainingIgnoreCase(Long userId, String name);
}
