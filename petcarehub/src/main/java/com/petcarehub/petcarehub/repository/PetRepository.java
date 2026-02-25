// File: src/main/java/com/petcarehub/petcarehub/repository/PetRepository.java
package com.petcarehub.petcarehub.repository;

import com.petcarehub.petcarehub.entity.Pet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PetRepository extends JpaRepository<Pet, Long> {

    List<Pet> findByOwner_UserId(Long userId);

    List<Pet> findByOwner_UserIdAndNameContainingIgnoreCase(Long userId, String name);
}
